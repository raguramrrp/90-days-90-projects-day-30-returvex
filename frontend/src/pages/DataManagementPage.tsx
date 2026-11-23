import React, { useState, useEffect } from "react";
import {
  Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight,
  Database, RefreshCw, Download, Check, History, AlertCircle
} from "lucide-react";
import { api } from "../api/client";

export const DataManagementPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Column Mapping
  const [sourceType, setSourceType] = useState<string>("products");
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Validation
  const [validating, setValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);

  // Commit
  const [committing, setCommitting] = useState<boolean>(false);
  const [commitResult, setCommitResult] = useState<any | null>(null);

  // History
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.getImportHistory().then(setHistory).catch(console.error);
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (f: File) => {
    setFile(f);
    setUploading(true);
    setErrorMsg(null);

    api.uploadFileForPreview(f)
      .then((res) => {
        setPreviewData(res);
        setSourceType(res.detected_type);
        // Default 1:1 mapping where names match
        const initialMap: Record<string, string> = {};
        res.headers.forEach((h: string) => {
          if (res.required_columns.includes(h)) {
            initialMap[h] = h;
          }
        });
        setColumnMapping(initialMap);
        setStep(2);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to inspect file structure");
      })
      .finally(() => setUploading(false));
  };

  const handleValidate = () => {
    if (!previewData) return;
    setValidating(true);
    setErrorMsg(null);

    api.validateImport({
      file_token: previewData.file_token,
      source_type: sourceType,
      mapping: columnMapping
    })
      .then((res) => {
        setValidationResult(res);
        setStep(3);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Validation failed");
      })
      .finally(() => setValidating(false));
  };

  const handleCommit = () => {
    if (!previewData) return;
    setCommitting(true);
    setErrorMsg(null);

    api.commitImport({
      file_token: previewData.file_token,
      source_type: sourceType,
      mapping: columnMapping
    })
      .then((res) => {
        setCommitResult(res);
        setStep(4);
        api.getImportHistory().then(setHistory);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Commit failed");
      })
      .finally(() => setCommitting(false));
  };

  const resetWorkflow = () => {
    setStep(1);
    setFile(null);
    setPreviewData(null);
    setValidationResult(null);
    setCommitResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DFE6EF]">
        <div>
          <h1 className="text-xl font-bold text-[#24344D] tracking-tight">Data Management & CSV Ingestion</h1>
        </div>

        {/* Template Downloads */}
        <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
          <span className="text-[#718096]">Templates:</span>
          <a
            href="/api/import/template/products"
            className="px-2 py-1 bg-white border border-[#DFE6EF] rounded hover:bg-[#F3F6FA] text-[#3567C8]"
          >
            Products
          </a>
          <a
            href="/api/import/template/orders"
            className="px-2 py-1 bg-white border border-[#DFE6EF] rounded hover:bg-[#F3F6FA] text-[#3567C8]"
          >
            Orders
          </a>
          <a
            href="/api/import/template/returns"
            className="px-2 py-1 bg-white border border-[#DFE6EF] rounded hover:bg-[#F3F6FA] text-[#3567C8]"
          >
            Returns
          </a>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="returvex-card p-4">
        <div className="flex items-center justify-between text-xs max-w-2xl mx-auto">
          {[
            { num: 1, label: "Upload & Inspect" },
            { num: 2, label: "Map Columns" },
            { num: 3, label: "Validate Records" },
            { num: 4, label: "Commit to DB" }
          ].map((s) => (
            <div key={s.num} className="flex items-center space-x-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === s.num
                    ? "bg-[#3567C8] text-white"
                    : step > s.num
                    ? "bg-[#58A88B] text-white"
                    : "bg-[#E2E8F0] text-[#718096]"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span
                className={`font-medium ${
                  step === s.num ? "text-[#3567C8]" : step > s.num ? "text-[#24344D]" : "text-[#91A0B5]"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: UPLOAD & DROP */}
      {step === 1 && (
        <div className="returvex-card p-8 text-center space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-[#BAC7D8] rounded-xl p-10 hover:border-[#3567C8] transition-colors cursor-pointer bg-[#F8FAFC]"
            onClick={() => document.getElementById("file-upload-input")?.click()}
          >
            <Upload className="w-10 h-10 text-[#3567C8] mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-[#24344D]">Drag & Drop CSV / XLSX Data File</h3>
            <p className="text-xs text-[#718096] mt-1">
              Supports Orders, Products, Returns, or Customer catalog spreadsheets.
            </p>
            <input
              id="file-upload-input"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="mt-4">
              <span className="btn-primary text-xs py-1.5 px-4 font-semibold">
                {uploading ? "Analyzing File..." : "Browse Local File"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MAP COLUMNS */}
      {step === 2 && previewData && (
        <div className="returvex-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE6EF]">
            <div>
              <h2 className="text-sm font-semibold text-[#24344D]">
                Map Uploaded Headers &bull; {previewData.filename}
              </h2>
              <p className="text-xs text-[#718096]">
                Detected {previewData.total_rows} records. Map file columns to required schema fields.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#718096]">Target Table:</span>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="field-input py-1 text-xs w-36"
              >
                <option value="products">Products</option>
                <option value="orders">Orders</option>
                <option value="returns">Returns</option>
                <option value="customers">Customers</option>
              </select>
            </div>
          </div>

          {/* Mapping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {previewData.headers.map((hdr: string) => (
              <div key={hdr} className="p-3 bg-[#F8FAFC] border border-[#DFE6EF] rounded-lg space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#24344D] truncate">{hdr}</span>
                  <span className="text-[10px] text-[#91A0B5]">CSV Column</span>
                </div>
                <select
                  value={columnMapping[hdr] || ""}
                  onChange={(e) => setColumnMapping({ ...columnMapping, [hdr]: e.target.value })}
                  className="field-input py-1 text-xs"
                >
                  <option value="">-- Ignore Column --</option>
                  <option value="product_code">product_code (Required)</option>
                  <option value="product_name">product_name (Required)</option>
                  <option value="category_name">category_name (Required)</option>
                  <option value="brand">brand (Required)</option>
                  <option value="selling_price">selling_price (Required)</option>
                  <option value="order_number">order_number</option>
                  <option value="customer_code">customer_code</option>
                  <option value="return_number">return_number</option>
                </select>
              </div>
            ))}
          </div>

          {/* Preview Rows Table */}
          <div className="space-y-2">
            <h3 className="font-semibold text-xs text-[#24344D] uppercase tracking-wider">
              Sample File Rows Preview
            </h3>
            <div className="overflow-x-auto border border-[#DFE6EF] rounded-lg">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#F8FAFC] border-b border-[#DFE6EF] text-[#718096]">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    {previewData.headers.map((h: string) => (
                      <th key={h} className="py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE6EF]">
                  {previewData.preview_rows.map((r: any) => (
                    <tr key={r._row_number}>
                      <td className="py-1.5 px-3 text-[#91A0B5]">{r._row_number}</td>
                      {previewData.headers.map((h: string) => (
                        <td key={h} className="py-1.5 px-3">{r[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-[#DFE6EF]">
            <button onClick={resetWorkflow} className="btn-secondary text-xs">
              Cancel & Upload New
            </button>
            <button
              onClick={handleValidate}
              disabled={validating}
              className="btn-primary text-xs flex items-center space-x-1.5 font-semibold"
            >
              <span>{validating ? "Validating Records..." : "Validate & Review Records"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: VALIDATION SUMMARY */}
      {step === 3 && validationResult && (
        <div className="returvex-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE6EF]">
            <div>
              <h2 className="text-sm font-semibold text-[#24344D]">Pre-Flight Data Validation</h2>
              <p className="text-xs text-[#718096]">
                Checks duplicate IDs, missing required fields, and numeric constraints.
              </p>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                validationResult.is_valid
                  ? "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]"
                  : "bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]"
              }`}
            >
              {validationResult.is_valid ? "Pass: Ready to Commit" : "Has Validation Errors"}
            </span>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div className="p-3 bg-[#F8FAFC] border border-[#DFE6EF] rounded-lg">
              <span className="text-[#718096] uppercase text-[10px]">Total Scanned</span>
              <p className="text-xl font-bold font-mono text-[#24344D] mt-0.5">{validationResult.total_rows}</p>
            </div>
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
              <span className="text-[#16A34A] uppercase text-[10px] font-semibold">Valid Records</span>
              <p className="text-xl font-bold font-mono text-[#16A34A] mt-0.5">{validationResult.valid_rows}</p>
            </div>
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
              <span className="text-[#DC2626] uppercase text-[10px] font-semibold">Invalid Records</span>
              <p className="text-xl font-bold font-mono text-[#DC2626] mt-0.5">{validationResult.invalid_rows}</p>
            </div>
          </div>

          {/* Error Table if any */}
          {validationResult.error_summary && validationResult.error_summary.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-xs text-[#DC2626] uppercase tracking-wider">
                Validation Discrepancies ({validationResult.error_summary.length})
              </h3>
              <div className="border border-red-200 rounded-lg overflow-hidden bg-red-50/40 p-3 space-y-1.5 text-xs">
                {validationResult.error_summary.map((err: any, i: number) => (
                  <div key={i} className="flex items-start space-x-2 text-red-700">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      <b>Row {err.row}:</b> {err.errors.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-[#DFE6EF]">
            <button onClick={() => setStep(2)} className="btn-secondary text-xs">
              Back to Column Mapping
            </button>
            <button
              onClick={handleCommit}
              disabled={committing || validationResult.valid_rows === 0}
              className="btn-primary text-xs flex items-center space-x-1.5 font-semibold"
            >
              <span>{committing ? "Committing Transaction..." : `Commit ${validationResult.valid_rows} Records to Database`}</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: COMMIT CONFIRMATION */}
      {step === 4 && commitResult && (
        <div className="returvex-card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#24344D]">Import Transaction Successfully Committed</h2>
          <p className="text-xs text-[#718096] max-w-md mx-auto">
            {commitResult.message} Audit logs have been generated and analytics updated.
          </p>

          <div className="pt-2">
            <button onClick={resetWorkflow} className="btn-primary text-xs py-2 px-5 font-semibold">
              Import Another Dataset
            </button>
          </div>
        </div>
      )}

      {/* Import History Table */}
      <div className="returvex-card overflow-hidden">
        <div className="p-4 border-b border-[#DFE6EF] bg-[#F8FAFC] flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-[#24344D]">Historical Data Ingestion Jobs</h3>
            <p className="text-[11px] text-[#718096]">Audit log of completed imports and batch records.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-head">
                <th className="py-2.5 px-3">Filename</th>
                <th className="py-2.5 px-3">Source Type</th>
                <th className="py-2.5 px-3">Total Rows</th>
                <th className="py-2.5 px-3">Inserted</th>
                <th className="py-2.5 px-3">Failed</th>
                <th className="py-2.5 px-3">Imported At</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE6EF]">
              {history.map((j) => (
                <tr key={j.id} className="hover:bg-[#F3F6FA]">
                  <td className="py-2.5 px-3 font-medium text-[#24344D]">{j.filename}</td>
                  <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-[#3567C8]">
                    {j.source_type}
                  </td>
                  <td className="py-2.5 px-3 font-mono">{j.total_records}</td>
                  <td className="py-2.5 px-3 font-mono text-[#16A34A] font-semibold">{j.successful_records}</td>
                  <td className="py-2.5 px-3 font-mono text-[#DC2626]">{j.failed_records}</td>
                  <td className="py-2.5 px-3 text-[#718096]">{j.imported_at}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
