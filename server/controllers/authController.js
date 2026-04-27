const db = require('../db');
const { hashData, compareHash, generateToken } = require('../utils/security');

// POST /auth/signup
const signup = async (req, res) => {
    let { name, email, phone, password } = req.body;
    email = email.toLowerCase().trim();
    try {
        const passwordHash = await hashData(password);

        // Insert user — SQLite returns lastID (not RETURNING clause)
        const result = await db.query(
            'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4)',
            [name, email, phone, passwordHash]
        );

        // Get userId from lastID (SQLite) or rows[0].user_id (PostgreSQL fallback)
        const userId = result.lastID || (result.rows && result.rows[0] && result.rows[0].user_id);
        console.log('User created with ID:', userId);

        if (!userId) {
            throw new Error('Failed to get user_id after insert');
        }

        // Initialize auth_data row for this user
        await db.query('INSERT OR IGNORE INTO auth_data (user_id) VALUES ($1)', [userId]);
        
        // Initialize kyc_details row
        await db.query('INSERT OR IGNORE INTO kyc_details (user_id, status) VALUES ($1, $2)', [userId, 'not_started']);

        res.status(201).json({ message: 'User created successfully', userId });
    } catch (err) {
        console.error('Signup error:', err);
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email or phone number already registered.' });
        }
        res.status(500).json({ error: 'User registration failed' });
    }
};

// POST /auth/login
const login = async (req, res) => {
    let { email, password, device_id } = req.body;
    email = email.toLowerCase().trim();
    console.log('Login attempt for:', email);
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log('Users found:', result.rows.length);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials - user not found' });
        }

        const user = result.rows[0];
        console.log('User found:', user.email, '| Has hash:', !!user.password_hash);

        const isMatch = await compareHash(password, user.password_hash);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials - password mismatch' });
        }

        const token = generateToken({ userId: user.user_id });

        // Device binding (safe, won't crash if table is empty)
        let isTrusted = false;
        try {
            const deviceResult = await db.query(
                'SELECT * FROM devices WHERE device_id = $1 AND user_id = $2',
                [device_id || 'browser-default', user.user_id]
            );
            isTrusted = deviceResult.rows && deviceResult.rows.length > 0 ? !!deviceResult.rows[0].is_trusted : false;
        } catch (e) {
            console.warn('Device check skipped:', e.message);
        }

        res.json({ token, user: { id: user.user_id, name: user.name, email: user.email }, isTrusted });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed: ' + err.message });
    }
};

// POST /auth/otp/send
const sendOTP = async (req, res) => {
    const { userId } = req.body;
    try {
        const otpCode = '123456'; // Default demo OTP
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        await db.query('DELETE FROM otp_table WHERE user_id = $1', [userId]);
        await db.query(
            'INSERT INTO otp_table (user_id, otp_code, expires_at) VALUES ($1, $2, $3)',
            [userId, otpCode, expiresAt]
        );

        console.log(`OTP for user ${userId}: ${otpCode}`);
        res.json({ message: 'OTP sent successfully', otpCode });
    } catch (err) {
        console.error('OTP send error:', err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

// POST /auth/otp/verify
const verifyOTP = async (req, res) => {
    const { userId, otpCode } = req.body;
    try {
        const result = await db.query(
            'SELECT * FROM otp_table WHERE user_id = $1 AND otp_code = $2',
            [userId, otpCode]
        );
        if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid OTP' });

        const otp = result.rows[0];
        if (new Date() > new Date(otp.expires_at)) return res.status(400).json({ error: 'OTP expired' });

        await db.query('DELETE FROM otp_table WHERE user_id = $1', [userId]);
        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error('OTP verify error:', err);
        res.status(500).json({ error: 'OTP verification failed' });
    }
};

// POST /auth/set-pin
const setPin = async (req, res) => {
    const { userId, pin } = req.body;
    try {
        const pinHash = await hashData(pin);
        await db.query('UPDATE auth_data SET pin_hash = $1 WHERE user_id = $2', [pinHash, userId]);
        res.json({ message: 'PIN set successfully' });
    } catch (err) {
        console.error('SetPin error:', err);
        res.status(500).json({ error: 'Failed to set PIN' });
    }
};

// POST /auth/biometric-enable
const enableBiometric = async (req, res) => {
    const { userId, enabled } = req.body;
    try {
        await db.query('UPDATE auth_data SET biometric_enabled = $1 WHERE user_id = $2', [enabled ? 1 : 0, userId]);
        res.json({ message: `Biometrics ${enabled ? 'enabled' : 'disabled'} successfully` });
    } catch (err) {
        console.error('Biometric error:', err);
        res.status(500).json({ error: 'Failed to update biometric status' });
    }
};

module.exports = { signup, login, sendOTP, verifyOTP, setPin, enableBiometric };
