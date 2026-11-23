# RETURVEX — Quick Start Guide

This guide provides instructions to set up, initialize, run, and test **RETURVEX** on Windows.

---

## Prerequisites
- **Python**: Version 3.10 or newer (tested with Python 3.14 / 3.12).
- **Node.js**: Version 18 or newer (tested with Node 24).
- **PowerShell** or **Command Prompt** (standard user permissions, no admin required).

---

## Automated 1-Click Windows Setup

### Step 1: Initialize Database & Dependencies
Double-click `setup.bat` or run in PowerShell:
```powershell
.\setup.bat
```
This script will:
1. Verify Python and Node runtimes.
2. Create `.env` from `.env.example`.
3. Create database tables and seed 5,000 synthetic demonstration orders and 912 realistic return records (Fixed seed 42).
4. Train the zero-leakage Random Forest champion classifier and Logistic Regression baseline.
5. Compile production frontend assets.

### Step 2: Launch the Platform
Double-click `run.bat` or run:
```powershell
.\run.bat
```
This starts:
- **FastAPI Backend Server**: `http://127.0.0.1:8000`
- **Interactive API Documentation (Swagger)**: `http://127.0.0.1:8000/docs`
- **React Frontend Workstation**: `http://127.0.0.1:5173`

### Step 3: Run Automated Verification Tests
Double-click `test.bat` or run:
```powershell
.\test.bat
```
Executes all 23 backend API tests, financial formula validations, ML leakage checks, and frontend UI tests.

---

## Manual Setup (Step-by-Step)

If you prefer manual terminal control:

### Backend Setup
1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd "D:\90 days\90-days-90-projects-day-30-returvex"
   ```
2. Set the Python path and install requirements:
   ```powershell
   $env:PYTHONPATH="$PWD\backend"
   python -m pip install -r requirements.txt
   ```
3. Initialize tables and seed demo data:
   ```powershell
   python backend\scripts\seed_data.py
   ```
4. Train and register the machine learning model:
   ```powershell
   python backend\scripts\train_model.py
   ```
5. Launch the FastAPI backend:
   ```powershell
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Frontend Setup
1. Open a second PowerShell window:
   ```powershell
   cd "D:\90 days\90-days-90-projects-day-30-returvex\frontend"
   ```
2. Launch Vite development server:
   ```powershell
   npm run dev
   ```
3. Open `http://127.0.0.1:5173` in your browser.
