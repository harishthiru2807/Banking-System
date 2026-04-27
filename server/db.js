const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'banking.db');
const db = new sqlite3.Database(dbPath);

console.log('Using SQLite Database:', dbPath);

module.exports = {
    query: (text, params = []) => {
        // Convert PostgreSQL style placeholders ($1, $2) to SQLite style (?)
        const sql = text.replace(/\$\d+/g, '?');
        console.log('SQL Execute:', sql, params);
        
        return new Promise((resolve, reject) => {
            const isSelect = sql.trim().toLowerCase().startsWith('select');
            
            if (isSelect) {
                db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error('SQL Error:', err, sql);
                        reject(err);
                    } else {
                        resolve({ rows });
                    }
                });
            } else {
                db.run(sql, params, function(err) {
                    if (err) {
                        console.error('SQL Error:', err, sql);
                        reject(err);
                    } else {
                        // For INSERT, we might need the lastID. 
                        // Map it to user_id if that's what's expected (simple mapping for this project)
                        resolve({ 
                            rows: [{ user_id: this.lastID, id: this.lastID }],
                            lastID: this.lastID,
                            changes: this.changes
                        });
                    }
                });
            }
        });
    }
};
