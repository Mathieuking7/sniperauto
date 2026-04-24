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

function createReservationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      slug TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      firstName TEXT DEFAULT '',
      deadline INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt INTEGER NOT NULL,
      openedAt INTEGER,
      convertedAt INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
  `);
}

function upsertReservation(db, { slug, email, firstName, deadline }) {
  return db.prepare(`
    INSERT INTO reservations (slug, email, firstName, deadline, status, createdAt)
    VALUES (?, ?, ?, ?, 'active', ?)
    ON CONFLICT(slug) DO UPDATE SET
      email = excluded.email,
      firstName = excluded.firstName,
      deadline = excluded.deadline,
      status = 'active',
      createdAt = excluded.createdAt
  `).run(slug, email, firstName || '', deadline, Date.now());
}

function getReservation(db, slug) {
  return db.prepare('SELECT * FROM reservations WHERE slug = ?').get(slug);
}

function expireReservation(db, slug) {
  db.prepare("UPDATE reservations SET status = 'expired' WHERE slug = ? AND status = 'active'").run(slug);
}

function markReservationOpened(db, slug) {
  db.prepare('UPDATE reservations SET openedAt = ? WHERE slug = ? AND openedAt IS NULL').run(Date.now(), slug);
}

function markReservationConverted(db, slug) {
  db.prepare("UPDATE reservations SET status = 'converted', convertedAt = ? WHERE slug = ?").run(Date.now(), slug);
}

function markReservationWaitlisted(db, slug) {
  db.prepare("UPDATE reservations SET status = 'waitlisted' WHERE slug = ?").run(slug);
}

module.exports = {
  getDb,
  upsertDeal,
  getUnnotifiedDeals,
  markNotified,
  getTodayDeals,
  createReservationsTable,
  upsertReservation,
  getReservation,
  expireReservation,
  markReservationOpened,
  markReservationConverted,
  markReservationWaitlisted,
};
