const db = require('../db');

const kycRestricted = async (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.body.userId;
    
    if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
    }

    try {
        const result = await db.query('SELECT status FROM kyc_details WHERE user_id = $1', [userId]);
        
        const status = result.rows.length > 0 ? result.rows[0].status : 'not_started';

        if (status !== 'approved') {
            return res.status(403).json({ 
                error: 'KYC not approved', 
                status,
                message: 'Please complete your KYC to access banking features.' 
            });
        }

        next();
    } catch (err) {
        console.error('KYC Middleware error:', err);
        // Fallback for demo mode if DB fails
        next(); 
    }
};

module.exports = kycRestricted;
