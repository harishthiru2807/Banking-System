const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 12;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be exactly 32 bytes
const IV_LENGTH = 16;

// Password/PIN Hashing
const hashData = async (data) => {
    return await bcrypt.hash(data, SALT_ROUNDS);
};

const compareHash = async (data, hash) => {
    return await bcrypt.compare(data, hash);
};

// AES-256 Encryption for sensitive data
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// JWT helpers
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-jwt-secret', { expiresIn: '1h' });
};

module.exports = {
    hashData,
    compareHash,
    encrypt,
    decrypt,
    generateToken
};
