const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "auto1.db");

function getDb() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      title TEXT,
      price_auto1 INTEGER,
      current_bid INTEGER,
      savings INTEGER,
      km INTEGER,
      year TEXT,
      fuel TEXT,
      gearbox TEXT,
      power TEXT,
      location TEXT,
      auction_end TEXT,
      url TEXT,
      first_seen TEXT DEFAULT (datetime('now')),
      notified INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan TEXT,
      billing TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      total_scanned INTEGER,
      total_under_1000 INTEGER,
      best_deals TEXT,
      sent_at TEXT
    );
  `);

  return db;
}

function upsertDeal(db, deal) {
  const stmt = db.prepare(`
    INSERT INTO deals (id, title, price_auto1, current_bid, savings, km, year, fuel, gearbox, power, location, auction_end, url)
    VALUES (@id, @title, @price_auto1, @current_bid, @savings, @km, @year, @fuel, @gearbox, @power, @location, @auction_end, @url)
    ON CONFLICT(id) DO UPDATE SET
      current_bid = @current_bid,
      savings = @savings,
      auction_end = @auction_end
  `);
  return stmt.run(deal);
}

function getUnnotifiedDeals(db) {
  return db
    .prepare("SELECT * FROM deals WHERE notified = 0 ORDER BY current_bid ASC")
    .all();
}

function markNotified(db, ids) {
  const stmt = db.prepare("UPDATE deals SET notified = 1 WHERE id = ?");
  for (const id of ids) {
    stmt.run(id);
  }
}

function getTodayDeals(db) {
  return db
    .prepare(
      "SELECT * FROM deals WHERE first_seen >= date('now') ORDER BY current_bid ASC"
    )
    .all();
}

module.exports = { getDb, upsertDeal, getUnnotifiedDeals, markNotified, getTodayDeals };
