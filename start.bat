@echo off
echo Starting AyurSutra Application...

echo Starting Backend Server...
start "AyurSutra Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "AyurSutra Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login with: admin / admin123
pause