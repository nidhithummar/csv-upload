@echo off
echo 🚀 Starting CSV Upload & Processing Service...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\temp" mkdir "backend\temp"

REM Start the services
echo 🐳 Starting Docker containers...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services are running successfully!
    echo.
    echo 🌐 Application URLs:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:5000
    echo    Health Check: http://localhost:5000/health
    echo.
    echo 👤 Default Admin Credentials:
    echo    Email: admin@example.com
    echo    Password: admin123
    echo.
    echo 📊 To view logs: docker-compose logs -f
    echo 🛑 To stop: docker-compose down
    echo.
    echo 🎉 Opening application in your browser...
    start http://localhost:3000
) else (
    echo ❌ Some services failed to start. Check logs with: docker-compose logs
    pause
    exit /b 1
)

pause
