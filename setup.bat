@echo off
echo Setting up AyurSutra - Panchakarma Management System...

echo.
echo Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Backend setup failed!
    pause
    exit /b 1
)

echo.
echo Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend setup failed!
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
echo.
echo To start the application:
echo 1. Backend: cd backend && npm start
echo 2. Frontend: cd frontend && npm start
echo 3. Open http://localhost:3000
echo 4. Login with admin/admin123
echo.
pause