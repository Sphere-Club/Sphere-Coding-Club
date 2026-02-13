const crypto = require('crypto');

const SECRET_KEY = 'EV-SMART-ROUTE-SECRET-KEY-2026'; // In production, use ENV

exports.hashToken = (data) => {
    return crypto.createHmac('sha256', SECRET_KEY)
        .update(data)
        .digest('hex');
};

// Generates a random raw token for the user (QR)
exports.generateRawToken = (chargerId, evId) => {
    const random = crypto.randomBytes(16).toString('hex');
    return `GATE-${chargerId}-${random}`;
};
