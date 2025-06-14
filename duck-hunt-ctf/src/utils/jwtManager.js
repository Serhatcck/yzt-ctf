const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT secret key - in production this should be in environment variables
const JWT_SECRET = 'Hackmaster-CTF-Uludag';

// Generate encryption parameters once at startup
const ENCRYPTION_KEY = crypto.randomBytes(16).toString('hex'); // 16 bytes for AES-128
const ENCRYPTION_IV = crypto.randomBytes(16).toString('hex');  // 16 bytes for IV

console.log('Generated Encryption Parameters:');
console.log('Key:', ENCRYPTION_KEY);
console.log('IV:', ENCRYPTION_IV);

// Generate JWT token
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        type: user.type
    };

    // Add static encryption parameters to header
    const header = {
        alg: 'HS256',
        typ: 'JWT',
        enc: {
            alg: 'aes-128-cbc',
            key: ENCRYPTION_KEY,
            iv: ENCRYPTION_IV
        }
    };

    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: '24h',
        header: header
    });
}

// Verify JWT token
function verifyToken(token) {
    try {
        // Decode token header to check algorithm
        const decodedHeader = jwt.decode(token, { complete: true });
        
        if (decodedHeader.header.alg === 'none') {
            // Vulnerable to Null Algorithm attack
            return jwt.verify(token, null, { algorithms: ['none'] });
        } else {
            // Normal verification for other algorithms
            return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
        }
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// Middleware to check JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}

module.exports = {
    generateToken,
    verifyToken,
    authenticateToken,
    ENCRYPTION_KEY,
    ENCRYPTION_IV
}; 