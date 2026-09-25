@echo off
echo ===================================================
echo Starting SourceLock - Personal Study SPACE
echo ===================================================

cd /d "%~dp0"

echo Starting Backend...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Frontend will be available at http://localhost:5173
echo Backend will be available at http://localhost:3001
echo ===================================================
pause
