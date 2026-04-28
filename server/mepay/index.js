const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run, query } = require('./db.js');

const router = express.Router();
const JWT_SECRET = 'meshpay_secret_key_123';


// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided. Please log in.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token expired or invalid. Please log in again.' });
    req.user = user;
    next();
  });
};

/** AUTH ROUTES **/

// Login or auto-register logic
router.post('/auth/login', async (req, res) => {
  console.log('Login attempt received:', req.body);
  const { phone, pin } = req.body;

  if (phone !== '8098719903' || pin !== '2802') {
    return res.status(401).json({ message: 'Invalid credentials. Use 8098719903 / 2802' });
  }

  try {
    let user = await get("SELECT * FROM users WHERE phone = ?", [phone]);

    if (!user) {
      // Auto-register new user
      const hashedPassword = bcrypt.hashSync(pin, 10);
      const result = await run(
        "INSERT INTO users (phone, pin, name, balance) VALUES (?, ?, ?, ?)",
        [phone, hashedPassword, `User ${phone.slice(-4)}`, 5000.00]
      );
      user = { id: result.id, phone, name: `User ${phone.slice(-4)}`, balance: 5000.00 };
    } else {
      // Validate PIN
      const validPin = bcrypt.compareSync(pin, user.pin);
      if (!validPin) {
        return res.status(401).json({ message: 'Invalid PIN' });
      }
    }

    const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { id: user.id, phone: user.phone, name: user.name, balance: user.balance } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** USER & TRANSACTION ROUTES **/

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await get("SELECT id, phone, name, balance FROM users WHERE id = ?", [req.user.id]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const txs = await query(
      "SELECT * FROM transactions WHERE sender_id = ? OR receiver_phone = ? ORDER BY timestamp DESC",
      [req.user.id, req.user.phone]
    );
    res.json(txs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/pay', authenticateToken, async (req, res) => {
  const { receiverPhone, amount, method } = req.body;

  try {
    const sender = await get("SELECT balance FROM users WHERE id = ?", [req.user.id]);
    
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Begin atomic transaction manually since we're using run
    await run("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, req.user.id]);
    
    // If receiver exists, update their balance too
    const receiver = await get("SELECT id FROM users WHERE phone = ?", [receiverPhone]);
    if (receiver) {
      await run("UPDATE users SET balance = balance + ? WHERE id = ?", [amount, receiver.id]);
    }

    const result = await run(
      "INSERT INTO transactions (sender_id, receiver_phone, amount, status, method) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, receiverPhone, amount, 'completed', method || 'Online']
    );

    res.json({ message: 'Payment successful', transactionId: result.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/sync-mesh', authenticateToken, async (req, res) => {
  const { transactions } = req.body;
  if (!Array.isArray(transactions)) return res.status(400).json({ message: 'Invalid data' });

  const results = [];
  try {
    for (const tx of transactions) {
      // Basic validation
      const sender = await get("SELECT balance FROM users WHERE id = ?", [req.user.id]);
      
      if (sender.balance < tx.amount) {
        results.push({ id: tx.id, status: 'failed', error: 'Insufficient balance' });
        continue;
      }

      // Deduct balance
      await run("UPDATE users SET balance = balance - ? WHERE id = ?", [tx.amount, req.user.id]);
      
      // Credit receiver
      const receiver = await get("SELECT id FROM users WHERE phone = ?", [tx.receiverPhone]);
      if (receiver) {
        await run("UPDATE users SET balance = balance + ? WHERE id = ?", [tx.amount, receiver.id]);
      }

      // Save transaction
      await run(
        "INSERT INTO transactions (sender_id, receiver_phone, amount, status, method, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        [req.user.id, tx.receiverPhone, tx.amount, 'completed', 'Mesh', new Date(tx.timestamp).toISOString().replace('T', ' ').slice(0, 19)]
      );

      results.push({ id: tx.id, status: 'completed' });
    }

    res.json({ message: 'Sync complete', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
