import io
from fastapi.datastructures import UploadFile
from starlette.datastructures import Headers
from app.core.database import SessionLocal
from app.services.import_service import (
    stage_file_upload, validate_staged_data, commit_staged_import, get_import_history
)

def test_stage_file_upload():
    csv_content = b"product_code,product_name,category_name,brand,selling_price\nPRD-TEST-001,Test Smart Watch,Electronics & Gadgets,TestBrand,2999.0\n"
    file = UploadFile(
        file=io.BytesIO(csv_content),
        filename="test_upload.csv",
        headers=Headers({"content-type": "text/csv"})
    )
    staged = stage_file_upload(file)
    assert staged["filename"] == "test_upload.csv"
    assert staged["detected_type"] == "products"
    assert staged["total_rows"] == 1
    assert "file_token" in staged

def test_validate_and_commit_import():
    db = SessionLocal()
    try:
        import uuid
        test_sku = f"PRD-VAL-{uuid.uuid4().hex[:6].upper()}"
        csv_content = f"product_code,product_name,category_name,brand,selling_price\n{test_sku},Validation Test Shirt,Apparel & Fashion,AeroFit,1299.0\n".encode("utf-8")
        file = UploadFile(
            file=io.BytesIO(csv_content),
            filename="validation_test.csv",
            headers=Headers({"content-type": "text/csv"})
        )
        staged = stage_file_upload(file)
        token = staged["file_token"]

        mapping = {
            "product_code": "product_code",
            "product_name": "product_name",
            "category_name": "category_name",
            "brand": "brand",
            "selling_price": "selling_price"
        }

        val_res = validate_staged_data(db, token=token, source_type="products", mapping=mapping)
        assert val_res["is_valid"] is True
        assert val_res["valid_rows"] == 1
        assert val_res["invalid_rows"] == 0

        # Commit
        commit_res = commit_staged_import(db, token=token, source_type="products", mapping=mapping)
        assert commit_res["success"] is True
        assert commit_res["inserted_records"] == 1

        # Check history
        history = get_import_history(db)
        assert len(history) > 0
    finally:
        db.close()
