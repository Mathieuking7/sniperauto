/**
 * Bot Manager — Orchestrator pattern
 * Central controller for all scraper bots with scheduling, state, and WhatsApp notifications
 */
const cron = require("node-cron");
const Database = require("better-sqlite3");
const path = require("path");
const { EventEmitter } = require("events");

const { runScraper: runAuto1Scraper } = require("./scraper");
const { runLeboncoinScraper } = require("./bots/leboncoin");
const { runAramisScraper } = require("./bots/aramis");
const { runLaCentraleScraper } = require("./bots/lacentrale");
const { runFacebookScraper } = require("./bots/facebook");
const { sendWhatsApp, sendWhatsAppWithImage, formatDealMessage } = require("./whatsapp");
const { filterValidDeals } = require("./ad-validator");

const DB_PATH = path.join(__dirname, "auto1.db");

class BotManager extends EventEmitter {
  constructor() {
    super();
    this.bots = new Map();
    this.cronJobs = new Map();
    this.db = new Database(DB_PATH);
    this.db.pragma("journal_mode = WAL");
    this._initDb();
    this._loadBots();
  }

  _initDb() {
    this.db.exec(`
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
        image_url TEXT,
        first_seen TEXT DEFAULT (datetime('now')),
        notified INTEGER DEFAULT 0,
        bot_id TEXT DEFAULT 'auto1'
      );

      CREATE TABLE IF NOT EXISTS bots (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT,
        enabled INTEGER DEFAULT 1,
        cron_schedule TEXT DEFAULT '*/30 10-16 * * *',
        filters TEXT DEFAULT '{}',
        last_scan TEXT,
        last_results INTEGER DEFAULT 0,
        last_new INTEGER DEFAULT 0,
        status TEXT DEFAULT 'idle',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS scan_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_id TEXT,
        timestamp TEXT DEFAULT (datetime('now')),
        total_found INTEGER,
        new_deals INTEGER,
        notified INTEGER,
        error TEXT,
        duration_ms INTEGER
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
    `);

    // Ensure bot_id column exists in deals
    try {
      this.db.exec("ALTER TABLE deals ADD COLUMN bot_id TEXT DEFAULT 'auto1'");
    } catch (e) { /* already exists */ }
    try {
      this.db.exec("ALTER TABLE deals ADD COLUMN image_url TEXT");
    } catch (e) { /* already exists */ }
  }

  _loadBots() {
    const bots = this.db.prepare("SELECT * FROM bots").all();

    // If no bots, create default Auto1 bot
    if (bots.length === 0) {
      this._createDefaultAuto1();
    }

    // Ensure Aramis bot exists
    const hasAramis = bots.some((b) => b.id === "aramis");
    if (!hasAramis) {
      this._createDefaultAramis();
    }

    // Ensure La Centrale bot exists
    const hasLC = this.db.prepare("SELECT id FROM bots WHERE id = 'lacentrale'").get();
    if (!hasLC) {
      this._createDefaultLaCentrale();
    }

    // Ensure Facebook Marketplace bot exists
    const hasFB = this.db.prepare("SELECT id FROM bots WHERE id = 'facebook'").get();
    if (!hasFB) {
      this._createDefaultFacebook();
    }

    // Ensure LeBonCoin bot exists
    const hasLBC = this.db.prepare("SELECT id FROM bots WHERE id = 'leboncoin'").get();
    if (!hasLBC) {
      this._createDefaultLeBonCoin();
    }

    // Reload
    const allBots = this.db.prepare("SELECT * FROM bots").all();
    for (const bot of allBots) {
      bot.filters = JSON.parse(bot.filters || "{}");
      this.bots.set(bot.id, bot);
      if (bot.enabled) {
        this._scheduleCron(bot);
      }
    }

    console.log(`[BotManager] ${this.bots.size} bot(s) chargé(s)`);
  }

  _createDefaultAuto1() {
    this.db.prepare(`
      INSERT OR IGNORE INTO bots (id, type, name, url, enabled, cron_schedule, filters)
      VALUES ('auto1', 'auto1', '🚗 Auto1 - Vestric 200km', ?, 1, '*/30 10-16 * * *', ?)
    `).run(
      "https://www.auto1.com/fr/app/merchant/cars",
      JSON.stringify({ maxPrice: 1000, minYear: 2002, cleanTestDrive: true })
    );
  }

  _createDefaultAramis() {
    this.db.prepare(`
      INSERT OR IGNORE INTO bots (id, type, name, url, enabled, cron_schedule, filters)
      VALUES ('aramis', 'aramis', '🚗 Aramis Pro', ?, 1, '*/30 10-16 * * *', ?)
    `).run(
      "https://pro.aramisauto.com/cars",
      JSON.stringify({})
    );
  }

  _createDefaultLaCentrale() {
    this.db.prepare(`
      INSERT OR IGNORE INTO bots (id, type, name, url, enabled, cron_schedule, filters)
      VALUES ('lacentrale', 'lacentrale', '🚘 La Centrale - Nîmes 20km', ?, 1, '*/30 10-16 * * *', ?)
    `).run(
      "https://www.lacentrale.fr/listing?makesModelsCommercialNames=&options=&page=1&priceMin=10000&priceMax=20000&sortBy=firstOnlineDateDesc",
      JSON.stringify({ minPrice: 10000, maxPrice: 20000, location: "Nîmes", distance: 20 })
    );
  }

  _createDefaultFacebook() {
    this.db.prepare(`
      INSERT OR IGNORE INTO bots (id, type, name, url, enabled, cron_schedule, filters)
      VALUES ('facebook', 'facebook', '📘 Facebook Marketplace - Nîmes 20km', ?, 1, '*/30 10-16 * * *', ?)
    `).run(
      "https://www.facebook.com/marketplace/nimes/vehicles?minPrice=10000&maxPrice=20000&radius=20&latitude=43.8367&longitude=4.3601&sortBy=creation_time_descend&exact=false",
      JSON.stringify({ minPrice: 10000, maxPrice: 20000, distance: 20, lat: "43.8367", lng: "4.3601" })
    );
  }

  _createDefaultLeBonCoin() {
    this.db.prepare(`
      INSERT OR IGNORE INTO bots (id, type, name, url, enabled, cron_schedule, filters)
      VALUES ('leboncoin', 'leboncoin', '🏷️ LeBonCoin - Nîmes 20km', ?, 1, '*/30 10-16 * * *', ?)
    `).run(
      "https://www.leboncoin.fr/recherche?category=2&locations=Nîmes__43.8367_4.3601_20000&price=10000-20000&sort=time&owner_type=private",
      JSON.stringify({ minPrice: 10000, maxPrice: 20000 })
    );
  }

  _scheduleCron(bot) {
    // Stop existing cron if any
    if (this.cronJobs.has(bot.id)) {
      this.cronJobs.get(bot.id).stop();
    }

    if (!bot.cron_schedule || !bot.enabled) return;

    try {
      const job = cron.schedule(bot.cron_schedule, () => {
        this.runBot(bot.id);
      });
      this.cronJobs.set(bot.id, job);
      console.log(`[BotManager] Cron planifié pour ${bot.name}: ${bot.cron_schedule}`);
    } catch (e) {
      console.error(`[BotManager] Cron invalide pour ${bot.name}: ${e.message}`);
    }
  }

  // --- API Methods ---

  getAllBots() {
    return Array.from(this.bots.values());
  }

  getBot(id) {
    return this.bots.get(id) || null;
  }

  addBot(data) {
    const id = data.id || `lbc_${Date.now()}`;
    const bot = {
      id,
      type: data.type || "leboncoin",
      name: data.name || "Nouveau bot",
      url: data.url || "",
      enabled: data.enabled !== false ? 1 : 0,
      cron_schedule: data.cron_schedule || "*/10 10-16 * * *",
      filters: data.filters || {},
      last_scan: null,
      last_results: 0,
      last_new: 0,
      status: "idle",
    };

    this.db.prepare(`
      INSERT INTO bots (id, type, name, url, enabled, cron_schedule, filters)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(bot.id, bot.type, bot.name, bot.url, bot.enabled, bot.cron_schedule, JSON.stringify(bot.filters));

    this.bots.set(id, bot);
    if (bot.enabled) this._scheduleCron(bot);
    this.emit("bot-added", bot);
    return bot;
  }

  updateBot(id, data) {
    const bot = this.bots.get(id);
    if (!bot) throw new Error("Bot not found");

    if (data.name !== undefined) bot.name = data.name;
    if (data.url !== undefined) bot.url = data.url;
    if (data.enabled !== undefined) bot.enabled = data.enabled ? 1 : 0;
    if (data.cron_schedule !== undefined) bot.cron_schedule = data.cron_schedule;
    if (data.filters !== undefined) bot.filters = data.filters;

    this.db.prepare(`
      UPDATE bots SET name = ?, url = ?, enabled = ?, cron_schedule = ?, filters = ?
      WHERE id = ?
    `).run(bot.name, bot.url, bot.enabled, bot.cron_schedule, JSON.stringify(bot.filters), id);

    // Reschedule cron
    this._scheduleCron(bot);
    this.emit("bot-updated", bot);
    return bot;
  }

  deleteBot(id) {
    if (id === "auto1") throw new Error("Cannot delete default Auto1 bot");
    if (this.cronJobs.has(id)) {
      this.cronJobs.get(id).stop();
      this.cronJobs.delete(id);
    }
    this.db.prepare("DELETE FROM bots WHERE id = ?").run(id);
    this.db.prepare("DELETE FROM deals WHERE bot_id = ?").run(id);
    this.bots.delete(id);
    this.emit("bot-deleted", id);
  }

  async runBot(id) {
    const bot = this.bots.get(id);
    if (!bot) throw new Error("Bot not found");
    if (bot.status === "scanning") {
      console.log(`[BotManager] ${bot.name} déjà en cours de scan`);
      return;
    }

    bot.status = "scanning";
    this.emit("bot-status", { id, status: "scanning" });
    const startTime = Date.now();

    try {
      let deals = [];

      if (bot.type === "auto1") {
        deals = await runAuto1Scraper();
      } else if (bot.type === "leboncoin") {
        deals = await runLeboncoinScraper({ url: bot.url, filters: bot.filters });
      } else if (bot.type === "aramis") {
        deals = await runAramisScraper({ url: bot.url, filters: bot.filters });
      } else if (bot.type === "lacentrale") {
        deals = await runLaCentraleScraper({ url: bot.url, filters: bot.filters });
      } else if (bot.type === "facebook") {
        deals = await runFacebookScraper({ url: bot.url, filters: bot.filters });
      }

      // Validate deals before storing
      deals = filterValidDeals(deals, bot.name);

      // Upsert deals
      let newCount = 0;
      const upsertStmt = this.db.prepare(`
        INSERT INTO deals (id, title, price_auto1, current_bid, savings, km, year, fuel, gearbox, power, location, auction_end, url, image_url, bot_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET current_bid = excluded.current_bid, savings = excluded.savings
      `);

      for (const deal of deals) {
        const dealId = deal.id || `${bot.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        try {
          const result = upsertStmt.run(
            dealId,
            deal.title || null,
            deal.price_auto1 || deal.price || null,
            deal.current_bid || null,
            deal.savings || null,
            deal.km || null,
            deal.year || null,
            deal.fuel || null,
            deal.gearbox || null,
            deal.power || null,
            deal.location || null,
            deal.auction_end || deal.date || null,
            deal.url || null,
            deal.imageUrl || deal.image_url || null,
            bot.id
          );
          if (result.changes > 0 && result.lastInsertRowid) newCount++;
        } catch (e) {
          // duplicate, skip
        }
      }

      // Send WhatsApp for unnotified
      const unnotified = this.db.prepare(
        "SELECT * FROM deals WHERE notified = 0 AND bot_id = ? ORDER BY price_auto1 ASC"
      ).all(bot.id);

      let notifiedCount = 0;
      if (unnotified.length > 0) {
        // Route to correct WhatsApp group
        const chatId = this._getChatId(bot);

        for (const deal of unnotified) {
          const msg = this._formatMessage(deal, bot);
          const imgUrl = deal.image_url;
          if (imgUrl) {
            await sendWhatsAppWithImage(imgUrl, msg, chatId);
          } else {
            await sendWhatsApp(msg, chatId);
          }
          notifiedCount++;
          await new Promise((r) => setTimeout(r, 2000));
        }
        const ids = unnotified.map((d) => d.id);
        const markStmt = this.db.prepare("UPDATE deals SET notified = 1 WHERE id = ?");
        for (const did of ids) markStmt.run(did);
      }

      const durationMs = Date.now() - startTime;
      bot.status = "idle";
      bot.last_scan = new Date().toISOString();
      bot.last_results = deals.length;
      bot.last_new = newCount;

      this.db.prepare(
        "UPDATE bots SET last_scan = ?, last_results = ?, last_new = ?, status = 'idle' WHERE id = ?"
      ).run(bot.last_scan, bot.last_results, bot.last_new, bot.id);

      this.db.prepare(
        "INSERT INTO scan_logs (bot_id, total_found, new_deals, notified, duration_ms) VALUES (?, ?, ?, ?, ?)"
      ).run(bot.id, deals.length, newCount, notifiedCount, durationMs);

      console.log(`[BotManager] ${bot.name}: ${deals.length} trouvés, ${newCount} nouveaux, ${notifiedCount} notifiés (${durationMs}ms)`);
      this.emit("bot-status", { id, status: "idle", results: deals.length, new: newCount });

      return { total: deals.length, new: newCount, notified: notifiedCount };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      bot.status = "error";
      console.error(`[BotManager] ${bot.name} erreur:`, err.message);

      this.db.prepare(
        "UPDATE bots SET status = 'error' WHERE id = ?"
      ).run(bot.id);
      this.db.prepare(
        "INSERT INTO scan_logs (bot_id, total_found, new_deals, notified, error, duration_ms) VALUES (?, 0, 0, 0, ?, ?)"
      ).run(bot.id, err.message, durationMs);

      this.emit("bot-status", { id, status: "error", error: err.message });
      throw err;
    }
  }

  _getChatId(bot) {
    const GROUP_MAP = {
      aramis: process.env.WHATSAPP_GROUP_ID_ARAMIS,
      auto1: process.env.WHATSAPP_GROUP_ID,
      leboncoin: process.env.WHATSAPP_GROUP_ID,
      lacentrale: process.env.WHATSAPP_GROUP_ID,
      facebook: process.env.WHATSAPP_GROUP_ID,
    };
    return GROUP_MAP[bot.type] || process.env.WHATSAPP_GROUP_ID || null;
  }

  _formatMessage(deal, bot) {
    if (bot.type === "auto1") {
      return formatDealMessage(deal);
    }

    if (bot.type === "aramis") {
      const lines = [];
      lines.push(`🏎️ *${deal.title}*`);
      lines.push("");
      if (deal.price_auto1) lines.push(`💰 *${deal.price_auto1.toLocaleString("fr-FR")}€*`);
      if (deal.km) lines.push(`📏 ${deal.km.toLocaleString("fr-FR")} km`);
      if (deal.year) lines.push(`📅 ${deal.year}`);
      if (deal.location) lines.push(`📍 ${deal.location}`);
      lines.push("");
      if (deal.url) lines.push(`🔗 ${deal.url}`);
      lines.push("\n_Via Aramis Pro_");
      return lines.join("\n");
    }

    if (bot.type === "lacentrale") {
      const lines = [];
      lines.push(`🚘 *${deal.title}*`);
      lines.push("");
      if (deal.price_auto1) lines.push(`💰 *${deal.price_auto1.toLocaleString("fr-FR")}€*`);
      const details = [];
      if (deal.year) details.push(deal.year);
      if (deal.km) details.push(`${deal.km.toLocaleString("fr-FR")} km`);
      if (details.length) lines.push(`📅 ${details.join(" | ")}`);
      if (deal.fuel) lines.push(`⛽ ${deal.fuel}`);
      if (deal.gearbox) lines.push(`⚙️ ${deal.gearbox}`);
      if (deal.location) lines.push(`📍 ${deal.location}`);
      lines.push("");
      if (deal.url) lines.push(`🔗 ${deal.url}`);
      lines.push("\n_Via La Centrale_");
      return lines.join("\n");
    }

    if (bot.type === "facebook") {
      const lines = [];
      lines.push(`📘 *${deal.title}*`);
      lines.push("");
      if (deal.price_auto1) lines.push(`💰 *${deal.price_auto1.toLocaleString("fr-FR")}€*`);
      const details = [];
      if (deal.year) details.push(deal.year);
      if (deal.km) details.push(`${deal.km.toLocaleString("fr-FR")} km`);
      if (details.length) lines.push(`📅 ${details.join(" | ")}`);
      if (deal.location) lines.push(`📍 ${deal.location}`);
      lines.push("");
      if (deal.url) lines.push(`🔗 ${deal.url}`);
      lines.push("\n_Via Facebook Marketplace_");
      return lines.join("\n");
    }

    // Le Bon Coin format
    const lines = [];
    lines.push(`🏷️ *${deal.title}*`);
    lines.push("");

    if (deal.price_auto1) {
      lines.push(`💰 *${deal.price_auto1.toLocaleString("fr-FR")}€*`);
    }
    if (deal.km) lines.push(`📏 ${deal.km.toLocaleString("fr-FR")} km`);
    if (deal.year) lines.push(`📅 ${deal.year}`);
    if (deal.location) lines.push(`📍 ${deal.location}`);
    if (deal.auction_end) lines.push(`🕐 ${deal.auction_end}`);
    lines.push("");
    if (deal.url) lines.push(`🔗 ${deal.url}`);
    lines.push("\n_Via LeBonCoin_");
    return lines.join("\n");
  }

  getLogs(botId, limit = 50) {
    if (botId) {
      return this.db.prepare(
        "SELECT * FROM scan_logs WHERE bot_id = ? ORDER BY timestamp DESC LIMIT ?"
      ).all(botId, limit);
    }
    return this.db.prepare(
      "SELECT * FROM scan_logs ORDER BY timestamp DESC LIMIT ?"
    ).all(limit);
  }

  getDeals(botId, limit = 100) {
    if (botId) {
      return this.db.prepare(
        "SELECT * FROM deals WHERE bot_id = ? ORDER BY first_seen DESC LIMIT ?"
      ).all(botId, limit);
    }
    return this.db.prepare(
      "SELECT * FROM deals ORDER BY first_seen DESC LIMIT ?"
    ).all(limit);
  }

  getStats() {
    const totalBots = this.bots.size;
    const activeBots = Array.from(this.bots.values()).filter((b) => b.enabled).length;
    const totalDeals = this.db.prepare("SELECT COUNT(*) as c FROM deals").get().c;
    const todayDeals = this.db.prepare("SELECT COUNT(*) as c FROM deals WHERE first_seen >= date('now')").get().c;
    const scanToday = this.db.prepare("SELECT COUNT(*) as c FROM scan_logs WHERE timestamp >= date('now')").get().c;
    return { totalBots, activeBots, totalDeals, todayDeals, scanToday };
  }

  shutdown() {
    for (const [id, job] of this.cronJobs) {
      job.stop();
    }
    this.db.close();
    console.log("[BotManager] Arrêté");
  }
}

module.exports = BotManager;
