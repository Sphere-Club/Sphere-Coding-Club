const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

const initDB = () => {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS chargers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            lat REAL,
            lng REAL,
            available INTEGER DEFAULT 1,
            type TEXT,
            price_per_unit REAL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            charger_id INTEGER,
            ev_id TEXT,
            expiry DATETIME,
            qr_code TEXT,
            token_hash TEXT,
            slot TEXT,
            status TEXT DEFAULT 'active'
        )`);
    });
};

module.exports = { db, initDB };
