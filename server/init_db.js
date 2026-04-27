const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'banking.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // ── Core Auth Tables ──────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS auth_data (
        user_id INTEGER PRIMARY KEY,
        pin_hash TEXT,
        biometric_enabled BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS otp_table (
        otp_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        otp_code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS devices (
        device_id TEXT PRIMARY KEY,
        user_id INTEGER,
        device_info TEXT,
        is_trusted BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`);

    // ── KYC Tables ────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS kyc_details (
        user_id INTEGER PRIMARY KEY,
        dob TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        aadhaar_encrypted TEXT,
        pan_encrypted TEXT,
        status TEXT DEFAULT 'not_started',
        rejection_reason TEXT,
        submitted_at DATETIME,
        reviewed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS documents (
        doc_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT,
        file_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`);

    // ── Banking / Dashboard Tables ────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS accounts (
        account_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        account_type TEXT DEFAULT 'Savings',
        balance REAL DEFAULT 0.0,
        currency TEXT DEFAULT 'INR',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        txn_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT,          -- credit | debit
        category TEXT,      -- Food, Bills, Transfer, etc.
        amount REAL NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'success',  -- success | pending | failed
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS budget (
        budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        category TEXT,
        limit_amount REAL,
        spent_amount REAL DEFAULT 0,
        month TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`);

    // ── Demo User (id=999) ────────────────────────────────────────
    const demoHash = '$2b$12$JQJKzkD/X51CpE5v/yOyN.MzBd/73j3gL8.F5efZj2iTrI3Qz8kw6'; // 'password'
    db.run(`INSERT OR IGNORE INTO users (user_id, name, email, phone, password_hash)
            VALUES (999, 'Haris Ali', 'demo@halora.com', '9999999999', ?)`, [demoHash]);
    db.run(`INSERT OR IGNORE INTO auth_data (user_id) VALUES (999)`);
    db.run(`INSERT OR IGNORE INTO kyc_details (user_id, status) VALUES (999, 'approved')`);
    db.run(`INSERT OR IGNORE INTO accounts (user_id, account_type, balance) VALUES (999, 'Savings', 125430.50)`);

    const txns = [
        [999, 'debit',  'Food',     450.00,  'Swiggy Order',      'success'],
        [999, 'credit', 'Transfer', 5000.00, 'Salary Credit',     'success'],
        [999, 'debit',  'Bills',    899.00,  'Netflix Subscription','success'],
        [999, 'debit',  'Shopping', 2300.00, 'Amazon Purchase',   'success'],
        [999, 'credit', 'Transfer', 1200.00, 'Received from Raj', 'success'],
        [999, 'debit',  'Food',     680.00,  'Zomato Order',      'success'],
        [999, 'debit',  'Bills',    1200.00, 'Electricity Bill',  'success'],
    ];
    txns.forEach(t => {
        db.run(`INSERT OR IGNORE INTO transactions (user_id, type, category, amount, description, status)
                VALUES (?, ?, ?, ?, ?, ?)`, t);
    });

    db.run(`INSERT OR IGNORE INTO budget (user_id, category, limit_amount, spent_amount, month)
            VALUES (999, 'Food', 3000, 1130, '2026-04')`);
    db.run(`INSERT OR IGNORE INTO budget (user_id, category, limit_amount, spent_amount, month)
            VALUES (999, 'Bills', 2000, 2099, '2026-04')`);
    db.run(`INSERT OR IGNORE INTO budget (user_id, category, limit_amount, spent_amount, month)
            VALUES (999, 'Shopping', 5000, 2300, '2026-04')`);
});

console.log('✅ SQLite Database initialized at:', dbPath);
setTimeout(() => db.close(), 500);
