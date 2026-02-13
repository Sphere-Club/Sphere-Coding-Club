const { db } = require('../config/db');

exports.getChargers = (req, res) => {
    db.all("SELECT * FROM chargers", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.toggleCharger = (req, res, io) => {
    const { id, available } = req.body;
    db.run("UPDATE chargers SET available = ? WHERE id = ?", [available, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Emit Websocket event
        io.emit('charger_update', { id, available });
        res.json({ success: true });
    });
};
