-- Banking System Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auth data for sensitive pins and biometrics
CREATE TABLE IF NOT EXISTS auth_data (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    pin_hash VARCHAR(255),
    biometric_enabled BOOLEAN DEFAULT FALSE
);

-- OTP storage
CREATE TABLE IF NOT EXISTS otp_table (
    otp_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

-- Device binding
CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    device_info JSONB,
    is_trusted BOOLEAN DEFAULT FALSE
);

-- KYC details table
CREATE TABLE IF NOT EXISTS kyc_details (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    dob DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    aadhaar_encrypted TEXT,
    pan_encrypted TEXT,
    status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, pending, approved, rejected
    rejection_reason TEXT,
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- KYC documents
CREATE TABLE IF NOT EXISTS documents (
    doc_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50), -- aadhaar_front, aadhaar_back, pan_card, selfie
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin logs
CREATE TABLE IF NOT EXISTS admin_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    action VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
