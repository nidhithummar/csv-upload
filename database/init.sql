-- Create database and user (if not exists)
CREATE DATABASE csv_upload_db;
CREATE USER csv_user WITH PASSWORD 'csv_password';
GRANT ALL PRIVILEGES ON DATABASE csv_upload_db TO csv_user;

-- Connect to the database
\c csv_upload_db;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create csv_uploads table
CREATE TABLE csv_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    record_count INTEGER DEFAULT 0
);

-- Create records table for parsed CSV data
CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    upload_id INTEGER REFERENCES csv_uploads(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_csv_uploads_user_id ON csv_uploads(user_id);
CREATE INDEX idx_records_upload_id ON records(upload_id);
CREATE INDEX idx_records_name ON records(name);
CREATE INDEX idx_records_email ON records(email);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@example.com', '$2b$10$rQZ8K9vX7mN2pL1oI3jK6eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8', 'admin');
