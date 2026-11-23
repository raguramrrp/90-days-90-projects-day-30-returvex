@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo                 RETURVEX - WORKSTATION LAUNCH SCRIPT
echo       E-Commerce Returns Intelligence & Profit Recovery Platform
echo ===============================================================================

set PYTHONPATH=%~dp0backend

echo [1/2] Starting FastAPI Backend Service on http://127.0.0.1:8000...
start "RETURVEX Backend Server (FastAPI)" cmd /c "title RETURVEX Backend && cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting React Vite Frontend Service on http://127.0.0.1:5173...
start "RETURVEX Frontend Server (Vite)" cmd /c "title RETURVEX Frontend && cd /d %~dp0frontend && npm run dev"

echo.
echo ===============================================================================
echo [SUCCESS] RETURVEX Services Dispatched:
echo   - Frontend Interface:  http://127.0.0.1:5173
echo   - Backend REST API:    http://127.0.0.1:8000
echo   - Interactive Swagger: http://127.0.0.1:8000/docs
echo ===============================================================================
echo Press any key to open the browser...
pause >nul
start http://127.0.0.1:5173
