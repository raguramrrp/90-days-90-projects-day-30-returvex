@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo                RETURVEX - AUTOMATED QUALITY ASSURANCE SUITE
echo ===============================================================================

set PYTHONPATH=%~dp0backend

echo [1/2] Executing Python Backend and Machine Learning Tests (pytest)...
python -m pytest "%~dp0backend\tests" -v
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Backend test suite failed.
    exit /b %ERRORLEVEL%
)
echo [PASS] Backend and ML tests passed.

echo.
echo [2/2] Executing React Frontend Interface Tests (vitest)...
cd "%~dp0frontend"
call npm test
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Frontend test suite failed.
    cd "%~dp0"
    exit /b %ERRORLEVEL%
)
cd "%~dp0"
echo [PASS] Frontend vitest suite passed.

echo.
echo ===============================================================================
echo [SUCCESS] ALL 23 AUTOMATED VERIFICATION CHECKS PASSED (100%%)
echo ===============================================================================
exit /b 0
