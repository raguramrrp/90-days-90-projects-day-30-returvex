@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo                RETURVEX - WORKSTATION SETUP & INITIALIZATION
echo       E-Commerce Returns Intelligence & Profit Recovery Platform
echo ===============================================================================

:: 1. Check Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in system PATH.
    echo Please install Python 3.10+ from python.org.
    pause
    exit /b 1
)
echo [OK] Python detected: 
python --version

:: 2. Check Node
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in system PATH.
    echo Please install Node.js 18+ from nodejs.org.
    pause
    exit /b 1
)
echo [OK] Node.js detected: 
node --version

:: 3. Configure .env if not exists
if not exist ".env" (
    echo [INFO] Creating .env from .env.example...
    copy .env.example .env >nul
) else (
    echo [INFO] Existing .env file found; preserving settings.
)

:: 4. Initialize Database and Seed Data
echo [INFO] Initializing database tables and generating synthetic demo dataset (5,000 orders)...
set PYTHONPATH=%~dp0backend
python "%~dp0backend\scripts\seed_data.py"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database seeding failed.
    pause
    exit /b 1
)
echo [OK] Database seeded successfully.

:: 5. Train Machine Learning Models
echo [INFO] Training ML models (Logistic Regression vs Random Forest with Zero Target Leakage)...
python "%~dp0backend\scripts\train_model.py"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] ML model training failed.
    pause
    exit /b 1
)
echo [OK] Machine Learning pipeline trained and champion model registered.

:: 6. Build Frontend
echo [INFO] Building production frontend assets...
cd "%~dp0frontend"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Frontend build reported an issue; dev server will still be available.
) else (
    echo [OK] Frontend built successfully.
)
cd "%~dp0"

echo ===============================================================================
echo [SUCCESS] RETURVEX Workstation is fully initialized and ready!
echo Run 'run.bat' to start the application workstation.
echo ===============================================================================
pause
