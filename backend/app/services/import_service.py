import io
import csv
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException

from app.models.entities import (
    ImportJob, AuditLog, Product, Order, OrderItem, Customer, Return, Category, Vendor
)

# In-memory staged files store (uuid -> {filename, source_type, rows, headers})
_staged_imports: Dict[str, Dict[str, Any]] = {}

REQUIRED_COLUMNS_BY_TYPE = {
    "products": ["product_code", "product_name", "category_name", "brand", "selling_price"],
    "orders": ["order_number", "customer_code", "order_date", "total_amount"],
    "customers": ["customer_code", "customer_name", "region", "state"],
    "returns": ["return_number", "order_number", "product_code", "return_date", "return_reason", "refund_amount"]
}

def stage_file_upload(file: UploadFile) -> Dict[str, Any]:
    contents = file.file.read()
    filename = file.filename or "upload.csv"
    
    # Try decoding as utf-8
    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        text = contents.decode("latin-1")

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")

    headers = [h.strip() for h in rows[0]]
    data_rows = rows[1:]

    # Auto-detect source type from headers
    detected_type = "products"
    for stype, req_cols in REQUIRED_COLUMNS_BY_TYPE.items():
        matches = sum(1 for c in req_cols if c in headers)
        if matches >= 3:
            detected_type = stype
            break

    token = str(uuid.uuid4())
    _staged_imports[token] = {
        "filename": filename,
        "source_type": detected_type,
        "headers": headers,
        "rows": data_rows,
        "uploaded_at": datetime.utcnow()
    }

    # Format preview rows
    preview_items = []
    for idx, r in enumerate(data_rows[:10]):
        row_dict = {headers[i]: r[i] if i < len(r) else "" for i in range(len(headers))}
        row_dict["_row_number"] = idx + 2
        preview_items.append(row_dict)

    return {
        "file_token": token,
        "filename": filename,
        "detected_type": detected_type,
        "total_rows": len(data_rows),
        "headers": headers,
        "preview_rows": preview_items,
        "required_columns": REQUIRED_COLUMNS_BY_TYPE.get(detected_type, [])
    }

def validate_staged_data(db: Session, token: str, source_type: str, mapping: Dict[str, str]) -> Dict[str, Any]:
    staged = _staged_imports.get(token)
    if not staged:
        raise HTTPException(status_code=404, detail="Upload session expired or invalid. Please re-upload the file.")

    required_fields = REQUIRED_COLUMNS_BY_TYPE.get(source_type, [])
    missing_fields = [rf for rf in required_fields if rf not in mapping.values()]

    errors = []
    seen_ids = set()
    valid_count = 0
    invalid_count = 0

    headers = staged["headers"]
    rows = staged["rows"]

    # Invert mapping: system_field -> csv_header
    inv_map = {sys_f: csv_h for csv_h, sys_f in mapping.items() if sys_f}

    # Query existing IDs for duplicates in DB
    existing_db_ids = set()
    if source_type == "products":
        existing_db_ids = {p[0] for p in db.query(Product.product_code).all()}
    elif source_type == "orders":
        existing_db_ids = {o[0] for o in db.query(Order.order_number).all()}
    elif source_type == "returns":
        existing_db_ids = {r[0] for r in db.query(Return.return_number).all()}
    elif source_type == "customers":
        existing_db_ids = {c[0] for c in db.query(Customer.customer_code).all()}

    validated_preview = []

    for r_idx, r in enumerate(rows):
        row_num = r_idx + 2
        row_dict = {headers[i]: r[i] if i < len(r) else "" for i in range(len(headers))}
        row_errors = []

        # Check required fields
        for rf in required_fields:
            csv_col = inv_map.get(rf)
            val = row_dict.get(csv_col, "").strip() if csv_col else ""
            if not val:
                row_errors.append(f"Missing required field '{rf}'")

        # Specific validations
        if source_type == "products":
            code_col = inv_map.get("product_code")
            code_val = row_dict.get(code_col, "").strip() if code_col else ""
            if code_val:
                if code_val in seen_ids:
                    row_errors.append(f"Duplicate product_code '{code_val}' in file")
                elif code_val in existing_db_ids:
                    row_errors.append(f"Product code '{code_val}' already exists in database")
                seen_ids.add(code_val)

            price_col = inv_map.get("selling_price")
            if price_col:
                try:
                    p_val = float(row_dict.get(price_col, 0))
                    if p_val < 0:
                        row_errors.append("Price cannot be negative")
                except ValueError:
                    row_errors.append("Invalid numeric format for selling_price")

        elif source_type == "orders":
            ord_col = inv_map.get("order_number")
            ord_val = row_dict.get(ord_col, "").strip() if ord_col else ""
            if ord_val:
                if ord_val in seen_ids:
                    row_errors.append(f"Duplicate order_number '{ord_val}' in file")
                elif ord_val in existing_db_ids:
                    row_errors.append(f"Order number '{ord_val}' already exists in database")
                seen_ids.add(ord_val)

        if row_errors:
            invalid_count += 1
            if len(errors) < 20:
                errors.append({"row": row_num, "errors": row_errors, "data": row_dict})
        else:
            valid_count += 1

        if len(validated_preview) < 5:
            validated_preview.append({
                "row_number": row_num,
                "status": "Invalid" if row_errors else "Valid",
                "errors": row_errors,
                "fields": {sys_f: row_dict.get(csv_col, "") for sys_f, csv_col in inv_map.items()}
            })

    return {
        "is_valid": (len(missing_fields) == 0 and invalid_count == 0),
        "total_rows": len(rows),
        "valid_rows": valid_count,
        "invalid_rows": invalid_count,
        "missing_required_columns": missing_fields,
        "error_summary": errors,
        "preview_rows": validated_preview
    }

def commit_staged_import(db: Session, token: str, source_type: str, mapping: Dict[str, str]) -> Dict[str, Any]:
    staged = _staged_imports.get(token)
    if not staged:
        raise HTTPException(status_code=404, detail="Staged upload not found or expired.")

    headers = staged["headers"]
    rows = staged["rows"]
    filename = staged["filename"]
    inv_map = {sys_f: csv_h for csv_h, sys_f in mapping.items() if sys_f}

    # Perform transactional import
    inserted = 0
    failed = 0
    error_messages = []

    try:
        if source_type == "products":
            # Ensure default category and vendor exist
            default_cat = db.query(Category).first()
            default_vnd = db.query(Vendor).first()

            for r_idx, r in enumerate(rows):
                row_dict = {headers[i]: r[i] if i < len(r) else "" for i in range(len(headers))}
                try:
                    p_code = row_dict.get(inv_map.get("product_code", ""), "").strip()
                    p_name = row_dict.get(inv_map.get("product_name", ""), "").strip()
                    brand = row_dict.get(inv_map.get("brand", ""), "General").strip()
                    price = float(row_dict.get(inv_map.get("selling_price", ""), 0))
                    cat_name = row_dict.get(inv_map.get("category_name", ""), "").strip()

                    cat = db.query(Category).filter(Category.category_name == cat_name).first() if cat_name else default_cat
                    if not cat:
                        cat = default_cat

                    if not p_code or not p_name:
                        failed += 1
                        continue

                    prod = Product(
                        product_code=p_code,
                        product_name=p_name,
                        category_id=cat.id,
                        brand=brand,
                        vendor_id=default_vnd.id,
                        selling_price=price,
                        created_at=datetime.utcnow()
                    )
                    db.add(prod)
                    inserted += 1
                except Exception as ex:
                    failed += 1
                    error_messages.append(f"Row {r_idx+2}: {str(ex)}")

        db.commit()

        # Record Import Job
        job = ImportJob(
            filename=filename,
            source_type=source_type,
            total_records=len(rows),
            successful_records=inserted,
            failed_records=failed,
            error_log="\n".join(error_messages[:20]) if error_messages else None,
            imported_at=datetime.utcnow()
        )
        db.add(job)

        # Audit Log
        audit = AuditLog(
            action="IMPORT_DATA",
            entity_type=source_type.upper(),
            entity_id=f"JOB-{job.id or 'NEW'}",
            description=f"Imported {inserted} records from {filename} with {failed} failures.",
            created_at=datetime.utcnow()
        )
        db.add(audit)
        db.commit()

        # Clear token
        del _staged_imports[token]

        return {
            "success": True,
            "filename": filename,
            "total_records": len(rows),
            "inserted_records": inserted,
            "failed_records": failed,
            "message": f"Successfully committed {inserted} records into the {source_type} table."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database transaction failed: {str(e)}")

def get_import_history(db: Session) -> List[Dict[str, Any]]:
    jobs = db.query(ImportJob).order_by(ImportJob.imported_at.desc()).all()
    return [
        {
            "id": j.id,
            "filename": j.filename,
            "source_type": j.source_type,
            "total_records": j.total_records,
            "successful_records": j.successful_records,
            "failed_records": j.failed_records,
            "imported_at": j.imported_at.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "Success" if j.failed_records == 0 else "Partial"
        }
        for j in jobs
    ]
