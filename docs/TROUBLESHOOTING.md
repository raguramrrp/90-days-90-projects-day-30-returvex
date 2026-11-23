# RETURVEX — Operational Troubleshooting & Diagnostics Guide

This guide provides diagnostic procedures and verified solutions for common operational issues encountered in local Windows environments.

---

## 1. Port Availability Issues

### A. Backend Port 8000 Already in Use
**Symptom**: `OSError: [WinError 10048] Only one usage of each socket address (protocol/network address/port) is normally permitted`

**Diagnostic & Resolution**:
Check which process is listening on port 8000 and terminate it:
```powershell
# Identify process ID listening on port 8000
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -Property OwningProcess

# Terminate the process (replace <PID> with output from previous command)
Stop-Process -Id <PID> -Force
```
Alternatively, launch the FastAPI server on an alternate port:
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
*(Remember to update `VITE_API_BASE_URL` in `.env` to match `http://127.0.0.1:8001/api/v1`)*.

---

### B. Frontend Port 5173 Already in Use
**Symptom**: Vite starts on port 5174 instead of 5173.

**Resolution**:
Vite automatically falls back to port 5174 if 5173 is busy. You can access the UI directly at `http://localhost:5174`. To force 5173:
```powershell
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -Property OwningProcess
Stop-Process -Id <PID> -Force
```

---

## 2. Python Environment & Path Issues

### A. Multiple Python Versions on Windows
**Symptom**: Running `pytest` or `uvicorn` fails with `ModuleNotFoundError` despite packages being installed.

**Resolution**:
Always execute modules through the explicit Python executable rather than global script wrappers:
```powershell
# Preferred invocation syntax
python -m uvicorn app.main:app --reload
python -m pytest backend/tests -v
```

---

## 3. Database & Seeding Issues

### A. Resetting or Rebuilding the Local Database
**Symptom**: Database schema changes or test modifications necessitate a fresh state.

**Resolution**:
Delete the local SQLite database file and re-run the seed script:
```powershell
# Delete existing database file
Remove-Item -Path "backend/returvex.db" -Force -ErrorAction SilentlyContinue

# Re-seed database with synthetic records
python backend/scripts/seed_data.py

# Re-train model and generate pre-dispatch risk predictions
python backend/scripts/train_model.py
```

---

## 4. Node.js & Vite Build Diagnostics

### A. Frontend Build Fails on Stale Cache
**Symptom**: `npm run build` throws rollup bundle errors or missing module references.

**Resolution**:
Clear the local Vite cache and rebuild:
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
npm run build
```

---

## 5. Report Generation Diagnostics

### A. PDF Export Throws ReportLab Errors
**Symptom**: `/api/v1/reports/export/pdf` returns HTTP 500.

**Resolution**:
Verify ReportLab and Pillow are installed in your active Python environment:
```powershell
python -c "import reportlab; import PIL; print('ReportLab version:', reportlab.__version__)"
```
If missing:
```powershell
pip install reportlab pillow
```
