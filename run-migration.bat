@echo off
echo Running database migration to add record_count column...
echo.

REM Check if PostgreSQL is available
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL and add it to your PATH
    pause
    exit /b 1
)

echo Connecting to database...
psql -h localhost -U csv_user -d csv_upload_db -f database/migration_add_record_count.sql

if %errorlevel% equ 0 (
    echo.
    echo Migration completed successfully!
    echo The record_count column has been added to the csv_uploads table.
) else (
    echo.
    echo Migration failed. Please check the error messages above.
)

echo.
pause
