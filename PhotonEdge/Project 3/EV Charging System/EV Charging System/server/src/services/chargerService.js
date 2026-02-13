const { db } = require('../config/db');
const fs = require('fs');
const path = require('path');

const seedChargers = () => {
    db.get("SELECT count(*) as count FROM chargers", (err, row) => {
        if (err) {
            console.error("Error checking chargers", err);
            return;
        }
        if (row.count === 0) {
            console.log("Seeding chargers from JSON...");
            try {
                const dataPath = path.join(__dirname, '../data/chargers.json');
                const rawData = fs.readFileSync(dataPath);
                const chargers = JSON.parse(rawData);

                const stmt = db.prepare("INSERT INTO chargers (name, lat, lng, type, price_per_unit) VALUES (?, ?, ?, ?, ?)");
                chargers.forEach(c => stmt.run(c.name, c.lat, c.lng, c.type, c.price_per_unit));
                stmt.finalize();
                console.log("Seeding complete.");
            } catch (error) {
                console.error("Error seeding data:", error);
            }
        }
    });
};

module.exports = { seedChargers };
