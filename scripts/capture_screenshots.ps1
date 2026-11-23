# Script to capture screenshots of all major application pages
$ErrorActionPreference = "Continue"

$baseDir = "d:\90 days\90-days-90-projects-day-30-returvex"
$screenshotDir = Join-Path $baseDir "screenshots"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if (-not (Test-Path $screenshotDir)) {
    New-Item -ItemType Directory -Force -Path $screenshotDir | Out-Null
}

Write-Output "[1/4] Starting backend API server on port 8000..."
$env:PYTHONPATH = "backend"
$backendProcess = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory $baseDir -PassThru

Write-Output "[2/4] Starting frontend server on port 5173..."
$frontendProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "vite", "--host", "127.0.0.1", "--port", "5173" -WorkingDirectory (Join-Path $baseDir "frontend") -PassThru

# Wait for servers to be live
$maxRetries = 25
$live = $false
for ($i = 0; $i -lt $maxRetries; $i++) {
    Start-Sleep -Seconds 1
    try {
        $res = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 2
        if ($res.StatusCode -eq 200) {
            $live = $true
            break
        }
    } catch {
        # continue waiting
    }
}

if (-not $live) {
    Write-Output "[ERROR] Frontend server failed to start in time."
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Output "[SUCCESS] Both servers are responsive!"

# Give backend a moment to warm up SQLite cache
Start-Sleep -Seconds 2

# Target pages to capture
$routes = @(
    @{ Name = "01_dashboard.png"; Path = "/" },
    @{ Name = "02_products.png"; Path = "/products" },
    @{ Name = "03_returns.png"; Path = "/returns" },
    @{ Name = "04_root_causes.png"; Path = "/root-causes" },
    @{ Name = "05_predictions.png"; Path = "/predictions" },
    @{ Name = "06_financial.png"; Path = "/financial" },
    @{ Name = "07_reports.png"; Path = "/reports" },
    @{ Name = "08_data_management.png"; Path = "/data-management" },
    @{ Name = "09_settings.png"; Path = "/settings" }
)

Write-Output "[3/4] Capturing screenshots of key features..."
foreach ($r in $routes) {
    $outFile = Join-Path $screenshotDir $r.Name
    $url = "http://127.0.0.1:5173$($r.Path)"
    Write-Output "Capturing $($r.Name) from $url..."

    & $edge --headless --disable-gpu --no-sandbox --window-size=1440,900 --virtual-time-budget=6000 --screenshot=$outFile $url 2>&1 | Out-Null
    Start-Sleep -Milliseconds 500
}

Write-Output "[4/4] Shutting down background servers..."
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
Get-Process -Name "*uvicorn*", "*vite*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Output "`nScreenshot capture complete. Generated files:"
Get-ChildItem -Path $screenshotDir -Filter "*.png" | Select-Object Name, Length, LastWriteTime
