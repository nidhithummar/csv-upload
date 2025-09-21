#!/bin/bash

echo "Running database migration to add record_count column..."
echo

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL and add it to your PATH"
    exit 1
fi

echo "Connecting to database..."
psql -h localhost -U csv_user -d csv_upload_db -f database/migration_add_record_count.sql

if [ $? -eq 0 ]; then
    echo
    echo "Migration completed successfully!"
    echo "The record_count column has been added to the csv_uploads table."
else
    echo
    echo "Migration failed. Please check the error messages above."
    exit 1
fi

echo
