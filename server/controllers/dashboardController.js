const db = require('../db');

// GET /dashboard/summary
const getSummary = async (req, res) => {
    const userId = req.query.userId;
    try {
        // Check KYC
        const kyc = await db.query('SELECT status FROM kyc_details WHERE user_id = $1', [userId]);
        if (!kyc.rows.length || kyc.rows[0].status !== 'approved') {
            return res.status(403).json({ error: 'KYC not approved', redirect: '/kyc-status' });
        }

        // Account balance
        const account = await db.query('SELECT * FROM accounts WHERE user_id = $1', [userId]);
        const accountData = account.rows[0] || { balance: 0, account_type: 'Savings', currency: 'INR' };

        // Recent 5 transactions
        const txns = await db.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [userId]
        );

        // User info
        const user = await db.query('SELECT name, email FROM users WHERE user_id = $1', [userId]);

        res.json({
            user: user.rows[0],
            account: accountData,
            recentTransactions: txns.rows,
        });
    } catch (err) {
        console.error('Dashboard summary error:', err);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
};

// GET /insights
const getInsights = async (req, res) => {
    const userId = req.query.userId;
    try {
        const budgets = await db.query(
            'SELECT * FROM budget WHERE user_id = $1', [userId]
        );

        const insights = [];
        budgets.rows.forEach(b => {
            const pct = Math.round((b.spent_amount / b.limit_amount) * 100);
            if (pct >= 100) {
                insights.push({ type: 'danger', message: `⚠️ ${b.category} budget exceeded! You spent ₹${b.spent_amount} of ₹${b.limit_amount}.` });
            } else if (pct >= 75) {
                insights.push({ type: 'warning', message: `📊 ${b.category} is at ${pct}% of your budget. ₹${b.limit_amount - b.spent_amount} remaining.` });
            } else {
                insights.push({ type: 'success', message: `✅ ${b.category} spending is healthy at ${pct}%.` });
            }
        });

        if (!insights.length) {
            insights.push({ type: 'info', message: '💡 No budget data yet. Set a budget to start tracking your spending.' });
        }

        res.json({ insights });
    } catch (err) {
        console.error('Insights error:', err);
        res.status(500).json({ error: 'Failed to load insights' });
    }
};

// GET /transactions/recent
const getRecentTransactions = async (req, res) => {
    const userId = req.query.userId;
    try {
        const txns = await db.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [userId]
        );
        res.json({ transactions: txns.rows });
    } catch (err) {
        console.error('Transactions error:', err);
        res.status(500).json({ error: 'Failed to load transactions' });
    }
};

// GET /balance
const getBalance = async (req, res) => {
    const userId = req.query.userId;
    try {
        const result = await db.query('SELECT balance, account_type, currency FROM accounts WHERE user_id = $1', [userId]);
        if (!result.rows.length) return res.json({ balance: 0, account_type: 'Savings', currency: 'INR' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Balance error:', err);
        res.status(500).json({ error: 'Failed to get balance' });
    }
};

module.exports = { getSummary, getInsights, getRecentTransactions, getBalance };
