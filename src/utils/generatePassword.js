const crypto = require('crypto');

const generateSecurePassword = () => {
    return crypto.randomBytes(8).toString('hex'); // 16 chars
};

module.exports = generateSecurePassword