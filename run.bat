@echo off
REM EcoGuard - Quick Start Script for Windows
REM This script sets up and runs the entire application

echo.
echo ============================================
echo     EcoGuard - Environmental Monitoring
echo ============================================
echo.

REM Check if running in production mode
set RUN_MODE=%1
if "%RUN_MODE%"=="" (
    set RUN_MODE=dev
)

echo Mode: %RUN_MODE%
echo.

if "%RUN_MODE%"=="prod" (
    echo Building frontend for production...
    cd frontend
    call npm run build
    if errorlevel 1 (
        echo Frontend build failed!
        exit /b 1
    )
    cd ..
    echo Build complete!
    echo.
    echo Starting backend server on http://localhost:8000
    echo.
    cd backend
    python -m uvicorn main:app --port 8000
) else (
    echo.
    echo Development Mode - Two terminals will start
    echo.
    echo IMPORTANT:
    echo - Backend runs on: http://localhost:8000
    echo - Frontend runs on: http://localhost:5173
    echo - Frontend will proxy API calls to backend
    echo.
    echo Starting backend server...
    cd backend
    python -m uvicorn main:app --reload --port 8000
)

