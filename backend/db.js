const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./phishing.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      risk INTEGER,
      result TEXT,
      mitre TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;