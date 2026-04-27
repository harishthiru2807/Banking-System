# Halora Banking Authentication System

A secure, modern authentication system for a mobile-first banking application.

## Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide React, Axios.
- **Backend**: Node.js, Express, PostgreSQL, JWT, Bcrypt, AES-256.

## Features
- Premium Dark Fintech UI (#0B0B0B, Neon Green)
- Mobile-first responsive design (Desktop mobile frame)
- Multi-step onboarding
- Secure Signup/Login with password hashing
- OTP Verification (simulated backend log)
- PIN Setup & Biometric Simulation
- Rate limiting & Device binding logic
- Multi-language support UI (English, Tamil, Hindi)

## Setup Instructions

### 1. Database Setup
- Install PostgreSQL.
- Create a database named `user_db`.
- Run the SQL commands in `server/schema.sql` to initialize tables.

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
node server.js
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Security Implementation
- **Passwords**: Hashed using Bcrypt with 12 salt rounds.
- **PINs**: Hashed using Bcrypt.
- **Sessions**: JWT based (1h expiration).
- **Sensitive Data**: AES-256 encryption utilities provided.
- **Protection**: Rate limiting on auth endpoints (10 attempts / 15 mins).
