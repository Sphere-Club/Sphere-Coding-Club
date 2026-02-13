const { db } = require('../config/db');
const QRCode = require('qrcode');
const { generateGateToken } = require('../utils/security');

exports.createReservation = (req, res, io) => {
    const { charger_id, ev_id } = req.body;

    db.get("SELECT available, name, lat, lng FROM chargers WHERE id = ?", [charger_id], (err, charger) => {
        if (err || !charger) return res.status(404).json({ success: false, message: 'Charger not found' });
        if (charger.available === 0) return res.status(400).json({ success: false, message: 'Charger occupied' });

        const expiry = new Date(Date.now() + 15 * 60000).toISOString();
        const slot_id = `SLOT-A${charger_id}`;

        // SECURITY: Split Token
        const { generateRawToken, hashToken } = require('../utils/security');
        const raw_token = generateRawToken(charger_id, ev_id);
        const token_hash = hashToken(raw_token);

        QRCode.toDataURL(raw_token, (err, qr_base64) => {
            if (err) return res.status(500).json({ error: 'QR Gen Error' });

            db.run("INSERT INTO reservations (charger_id, ev_id, expiry, qr_code, token_hash, slot, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
                [charger_id, ev_id, expiry, raw_token, token_hash, slot_id],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });

                    // Mark charger occupied
                    db.run("UPDATE chargers SET available = 0 WHERE id = ?", [charger_id]);
                    io.emit('charger_update', { id: charger_id, available: 0 });

                    res.json({
                        success: true,
                        reservation_id: this.lastID,
                        gate_token: raw_token,
                        qr_base64,
                        expiry,
                        charger_name: charger.name,
                        slot_id,
                        lat: charger.lat,
                        lng: charger.lng
                    });
                }
            );
        });
    });
};

exports.getReservation = (req, res) => {
    const { id } = req.params;
    db.get(`
        SELECT r.*, c.name as charger_name, c.lat, c.lng 
        FROM reservations r 
        JOIN chargers c ON r.charger_id = c.id 
        WHERE r.id = ? AND r.status != 'expired'`,
        [id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Reservation not found or expired' });

            QRCode.toDataURL(row.qr_code, (err, qr_base64) => {
                res.json({
                    reservation_id: row.id,
                    charger_name: row.charger_name,
                    gate_token: row.qr_code,
                    expiry: row.expiry,
                    status: row.status,
                    qr_base64,
                    slot_id: row.slot || `Slot-A${row.charger_id}`,
                    lat: row.lat,
                    lng: row.lng
                });
            });
        });
};

exports.verifyQR = (req, res) => {
    const { qr_code } = req.body;

    // 1. Find reservation by Token
    db.get("SELECT * FROM reservations WHERE qr_code = ? AND status='active'", [qr_code], (err, row) => {
        if (err || !row) return res.status(400).json({ success: false, message: 'Invalid or Expired Token' });

        // 2. Check Expiry
        if (new Date(row.expiry) < new Date()) {
            db.run("UPDATE reservations SET status='expired' WHERE id = ?", [row.id]);
            return res.status(400).json({ success: false, message: 'Token Expired' });
        }

        // 3. Mark as Completed (Charging Started)
        db.run("UPDATE reservations SET status='completed' WHERE id = ?", [row.id]);

        res.json({
            success: true,
            message: 'Access Granted - Charging Started',
            charger_id: row.charger_id,
            slot_id: row.slot
        });
    });
};
