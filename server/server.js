const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authController = require('./controllers/authController');
const kycController = require('./controllers/kycController');
const kycRestricted = require('./middleware/kycMiddleware');
const dashboardController = require('./controllers/dashboardController');
const mepayRouter = require('./mepay/index');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: { error: 'Too many login attempts, please try again later.' }
});

// Routes
app.post('/auth/signup', authController.signup);
app.post('/auth/login', authController.login); // Disabled limiter for debugging
app.post('/auth/otp/send', authController.sendOTP);
app.post('/auth/otp/verify', authController.verifyOTP);
app.post('/auth/set-pin', authController.setPin);
app.post('/auth/biometric-enable', authController.enableBiometric);

// KYC Routes
app.post('/kyc/start', kycController.startKYC);
app.post('/kyc/profile', kycController.saveProfile);
app.post('/kyc/verify', kycController.verifyIdentity);
app.post('/kyc/upload', kycController.uploadDocument);
app.post('/kyc/submit', kycController.submitKYC);
app.get('/kyc/status', kycController.getKYCStatus);
app.post('/kyc/admin/review', kycController.adminReview);

// Restricted Banking Features (Example)
app.get('/banking/balance', kycRestricted, (req, res) => {
    res.json({ balance: 1250.50, currency: 'USD' });
});

app.post('/banking/transfer', kycRestricted, (req, res) => {
    res.json({ message: 'Transfer successful' });
});

// MePay Routes
app.use('/api', mepayRouter);

// Dashboard Routes
app.get('/dashboard/summary', dashboardController.getSummary);
app.get('/insights', dashboardController.getInsights);
app.get('/transactions/recent', dashboardController.getRecentTransactions);
app.get('/balance', dashboardController.getBalance);

// Health check
app.get('/', (req, res) => res.send('Halora Banking API Running ✅'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('exit', (code) => {
  console.log(`Process about to exit with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep process alive
setInterval(() => {}, 10000);
