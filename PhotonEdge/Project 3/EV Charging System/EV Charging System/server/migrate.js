const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Running Migration...");
    // Add token_hash column if not exists
    db.run("ALTER TABLE reservations ADD COLUMN token_hash TEXT", (err) => {
        if (err && err.message.includes('duplicate column')) {
            console.log("Column token_hash already exists.");
        } else if (err) {
            console.error("Error adding column:", err);
        } else {
            console.log("Added token_hash column.");
        }
    });
});

db.close();
