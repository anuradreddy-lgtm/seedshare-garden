
const path = require("node:path");
const Database = require("better-sqlite3");

// Connect to SQLite database
const databasePath = path.join(__dirname, "seedshare.db");
const db = new Database(databasePath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create database tables
db.exec(`

CREATE TABLE IF NOT EXISTS gardeners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    soil TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gardener_id INTEGER NOT NULL,
    plot_id INTEGER NOT NULL,

    FOREIGN KEY (gardener_id) REFERENCES gardeners(id),
    FOREIGN KEY (plot_id) REFERENCES plots(id)
);

`);

console.log("Database and tables created successfully!");

module.exports = db;
