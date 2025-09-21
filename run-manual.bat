@echo off
echo 🚀 Starting CSV Upload Service (Manual Mode)
echo.

echo 📋 Prerequisites Check:
echo 1. Node.js (v18 or higher)
echo 2. PostgreSQL database
echo 3. npm package manager
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed
echo.

echo 📦 Installing Backend Dependencies...
cd backend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo 📦 Installing Frontend Dependencies...
cd frontend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo.
echo ⚠️  IMPORTANT: You need to set up PostgreSQL manually
echo.
echo 1. Install PostgreSQL from: https://www.postgresql.org/download/
echo 2. Create a database named: csv_upload_db
echo 3. Create a user: csv_user with password: csv_password
echo 4. Run the SQL script: database/init.sql
echo.
echo 📝 Database Configuration:
echo    Host: localhost
echo    Port: 5432
echo    Database: csv_upload_db
echo    User: csv_user
echo    Password: csv_password
echo.

set /p continue="Have you set up PostgreSQL? (y/n): "
if /i not "%continue%"=="y" (
    echo Please set up PostgreSQL first, then run this script again.
    pause
    exit /b 1
)

echo.
echo 🚀 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🚀 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ✅ Services are starting...
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 👤 Admin Login: admin@example.com / admin123
echo.
echo Press any key to exit...
pause >nul
