const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "db.sqlite"));
db.pragma("foreign_keys = ON");

module.exports = db;
