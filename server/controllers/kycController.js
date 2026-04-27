const db = require('../db');
const { encrypt } = require('../utils/security');

// POST /kyc/start
const startKYC = async (req, res) => {
    const { userId } = req.body;
    try {
        await db.query(
            'INSERT INTO kyc_details (user_id, status) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET status = $2',
            [userId, 'in_progress']
        );
        res.json({ message: 'KYC started' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to start KYC' });
    }
};

// POST /kyc/profile
const saveProfile = async (req, res) => {
    const { userId, dob, address, city, state, pincode } = req.body;
    try {
        await db.query(
            'UPDATE kyc_details SET dob = $1, address = $2, city = $3, state = $4, pincode = $5 WHERE user_id = $6',
            [dob, address, city, state, pincode, userId]
        );
        res.json({ message: 'Profile saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save profile' });
    }
};

// POST /kyc/verify (Aadhaar/PAN)
const verifyIdentity = async (req, res) => {
    const { userId, aadhaar, pan } = req.body;
    try {
        const aadhaarEnc = encrypt(aadhaar);
        const panEnc = encrypt(pan);
        await db.query(
            'UPDATE kyc_details SET aadhaar_encrypted = $1, pan_encrypted = $2 WHERE user_id = $3',
            [aadhaarEnc, panEnc, userId]
        );
        res.json({ message: 'Identity details saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save identity' });
    }
};

// POST /kyc/upload
const uploadDocument = async (req, res) => {
    const { userId, type, fileUrl } = req.body;
    try {
        await db.query(
            'INSERT INTO documents (user_id, type, file_url) VALUES ($1, $2, $3)',
            [userId, type, fileUrl]
        );
        res.json({ message: 'Document uploaded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
    }
};

// POST /kyc/submit
const submitKYC = async (req, res) => {
    const { userId } = req.body;
    try {
        // Auto-approve for demo: set status = approved immediately
        await db.query(
            'UPDATE kyc_details SET status = $1, submitted_at = CURRENT_TIMESTAMP, reviewed_at = CURRENT_TIMESTAMP WHERE user_id = $2',
            ['approved', userId]
        );
        // Create an account for this user if not already existing
        await db.query(
            'INSERT OR IGNORE INTO accounts (user_id, account_type, balance) VALUES ($1, $2, $3)',
            [userId, 'Savings', 10000.00]
        );
        res.json({ message: 'KYC submitted and approved', status: 'approved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Submission failed' });
    }
};

// GET /kyc/status
const getKYCStatus = async (req, res) => {
    const { userId } = req.query;
    try {
        const result = await db.query('SELECT status, rejection_reason FROM kyc_details WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) return res.json({ status: 'not_started' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
};

// Admin Mock: Approve/Reject KYC
const adminReview = async (req, res) => {
    const { userId, status, reason, adminId } = req.body;
    try {
        await db.query(
            'UPDATE kyc_details SET status = $1, rejection_reason = $2, reviewed_at = CURRENT_TIMESTAMP WHERE user_id = $3',
            [status, reason, userId]
        );
        await db.query(
            'INSERT INTO admin_logs (admin_id, user_id, action) VALUES ($1, $2, $3)',
            [adminId, userId, `KYC ${status}`]
        );
        res.json({ message: `KYC ${status} successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Review failed' });
    }
};

module.exports = {
    startKYC,
    saveProfile,
    verifyIdentity,
    uploadDocument,
    submitKYC,
    getKYCStatus,
    adminReview
};
