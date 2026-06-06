# EcoGuard - Quick Start Script for PowerShell

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "     EcoGuard - Environmental Monitoring" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

$runMode = if ($args.Count -gt 0) { $args[0] } else { "dev" }

Write-Host "Mode: $runMode" -ForegroundColor Cyan
Write-Host ""

if ($runMode -eq "prod") {
    Write-Host "Building frontend for production..." -ForegroundColor Yellow
    Push-Location frontend
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Frontend build failed!" -ForegroundColor Red
        exit 1
    }
    Pop-Location

    Write-Host ""
    Write-Host "Build complete! Starting backend on http://localhost:8000" -ForegroundColor Green
    Write-Host ""

    Push-Location backend
    & python -m uvicorn main:app --port 8000
    Pop-Location
} else {
    Write-Host ""
    Write-Host "DEVELOPMENT MODE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You need to run TWO separate terminals:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Terminal 1 - Backend Server:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  python -m uvicorn main:app --reload --port 8000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Terminal 2 - Frontend Dev Server:" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then visit: http://localhost:5173" -ForegroundColor Green
    Write-Host ""
    Write-Host "For PRODUCTION (single port):" -ForegroundColor Cyan
    Write-Host "  .\run.ps1 prod" -ForegroundColor Gray
    Write-Host ""
}

