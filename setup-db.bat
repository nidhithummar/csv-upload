@echo off
echo Setting up PostgreSQL database for CSV Upload Service...

REM Set PostgreSQL path
set PG_PATH="C:\Program Files\PostgreSQL\17\bin"

echo Creating database and user...
%PG_PATH%\psql.exe -U postgres -c "CREATE DATABASE csv_upload_db;"
%PG_PATH%\psql.exe -U postgres -c "CREATE USER csv_user WITH PASSWORD 'csv_password';"
%PG_PATH%\psql.exe -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE csv_upload_db TO csv_user;"

echo Setting up database schema...
%PG_PATH%\psql.exe -U postgres -d csv_upload_db -f setup-database.sql

echo Database setup complete!
echo.
echo Database: csv_upload_db
echo User: csv_user
echo Password: csv_password
echo.
pause