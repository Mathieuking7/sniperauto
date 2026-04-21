/**
 * Dashboard — Express server with API + frontend
 */
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const BotManager = require("./bot-manager");
const Stripe = require("stripe");
const { sendSubscriptionConfirmation, sendAdminNotification, sendContactRequest, sendClientSetupConfirmation, sendClientSetupAdminNotification, sendWaitlistConfirmation, sendWaitlistAdminNotification } = require("./email");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const app = express();
const PORT = process.env.PORT || 3000;
const HEARTBEAT_FILE = path.join(__dirname, ".heartbeat");

// Stripe webhook needs raw body — MUST be before express.json()
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[Stripe] Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email || session.customer_details?.email;
    const plan = session.metadata?.plan || "unknown";
    const billing = session.metadata?.billing || "monthly";
    const userInfo = {
      firstName: session.metadata?.firstName || "",
      lastName: session.metadata?.lastName || "",
      email: email || session.metadata?.email || "",
      phone: session.metadata?.phone || "",
      companyName: session.metadata?.companyName || "",
    };

    // Save to DB
    try {
      manager.db.prepare(`
        INSERT INTO subscribers (email, stripe_customer_id, stripe_subscription_id, plan, billing)
        VALUES (?, ?, ?, ?, ?)
      `).run(userInfo.email, session.customer, session.subscription, plan, billing);
      console.log(`[Stripe] Nouvel abonné: ${userInfo.email} - ${plan} (${userInfo.firstName} ${userInfo.lastName})`);
    } catch (e) {
      console.error("[Stripe] DB error:", e.message);
    }

    // Send emails
    await sendSubscriptionConfirmation(userInfo, plan, billing);
    await sendAdminNotification(userInfo, plan, billing);
  }

  res.json({ received: true });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve monitor.html as the root page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "monitor.html"));
});

app.get("/monitor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "monitor.html"));
});

// Stable URL for client onboarding form — shareable link
app.get("/configurer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "onboarding.html"));
});
app.get("/onboarding", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "onboarding.html"));
});

// Initialize bot manager
const manager = new BotManager();

// Heartbeat for bot monitor (write every 10s to prove liveness)
setInterval(() => {
  try {
    fs.writeFileSync(HEARTBEAT_FILE, Date.now().toString());
  } catch (e) {
    console.warn("[Heartbeat] Erreur write:", e.message);
  }
}, 10000);
// Write initial heartbeat
fs.writeFileSync(HEARTBEAT_FILE, Date.now().toString());

// --- API Routes ---

// Get all bots
app.get("/api/bots", (req, res) => {
  res.json(manager.getAllBots());
});

// Get stats
app.get("/api/stats", (req, res) => {
  res.json(manager.getStats());
});

// Get single bot
app.get("/api/bots/:id", (req, res) => {
  const bot = manager.getBot(req.params.id);
  if (!bot) return res.status(404).json({ error: "Bot not found" });
  res.json(bot);
});

// Add new bot
app.post("/api/bots", (req, res) => {
  try {
    const bot = manager.addBot(req.body);
    res.json(bot);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update bot
app.put("/api/bots/:id", (req, res) => {
  try {
    const bot = manager.updateBot(req.params.id, req.body);
    res.json(bot);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete bot
app.delete("/api/bots/:id", (req, res) => {
  try {
    manager.deleteBot(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Run bot manually
app.post("/api/bots/:id/run", async (req, res) => {
  try {
    const result = await manager.runBot(req.params.id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Toggle bot enabled
app.post("/api/bots/:id/toggle", (req, res) => {
  const bot = manager.getBot(req.params.id);
  if (!bot) return res.status(404).json({ error: "Bot not found" });
  const updated = manager.updateBot(req.params.id, { enabled: !bot.enabled });
  res.json(updated);
});

// Get logs
app.get("/api/logs", (req, res) => {
  const botId = req.query.bot_id || null;
  res.json(manager.getLogs(botId, 100));
});

// Get deals
app.get("/api/deals", (req, res) => {
  const botId = req.query.bot_id || null;
  res.json(manager.getDeals(botId, 200));
});

// Waitlist
app.post("/api/waitlist", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    manager.db.exec(`CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    manager.db.prepare("INSERT OR IGNORE INTO waitlist (email) VALUES (?)").run(email);
    console.log(`[Waitlist] ${email} inscrit`);
    res.json({ ok: true });
    // Envoi des emails en arrière-plan (après la réponse)
    sendWaitlistConfirmation(email).catch((err) => console.error("[Email] Waitlist confirmation error:", err.message));
    sendWaitlistAdminNotification(email).catch((err) => console.error("[Email] Waitlist admin error:", err.message));
  } catch (e) {
    console.error("[Waitlist] Erreur:", e.message);
    res.json({ ok: true }); // don't leak errors
  }
});

// Stripe Checkout
const PRICE_MAP = {
  essentiel_monthly: process.env.STRIPE_PRICE_ESSENTIEL_MONTHLY,
  essentiel_annual: process.env.STRIPE_PRICE_ESSENTIEL_ANNUAL,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
};
const SETUP_FEE_MAP = {
  essentiel: process.env.STRIPE_PRICE_SETUP_ESSENTIEL,
  pro: process.env.STRIPE_PRICE_SETUP_PRO,
};

app.post("/api/checkout", async (req, res) => {
  const { plan, billing, firstName = "", lastName = "", email = "", phone = "", companyName = "" } = req.body;
  const priceKey = `${plan}_${billing}`;
  const priceId = PRICE_MAP[priceKey];
  const setupPriceId = SETUP_FEE_MAP[plan];

  if (!priceId) return res.status(400).json({ error: "Plan ou facturation invalide" });

  try {
    const lineItems = [{ price: priceId, quantity: 1 }];
    if (setupPriceId) lineItems.push({ price: setupPriceId, quantity: 1 });

    const sessionParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: { plan, billing, firstName, lastName, email, phone, companyName },
      success_url: `${req.protocol}://${req.get("host")}/success.html`,
      cancel_url: `${req.protocol}://${req.get("host")}/#pricing`,
      locale: "fr",
    };

    // Pre-fill customer email if provided
    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe] Checkout error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Contact form
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "All fields required" });
  await sendContactRequest(name, email, message);
  res.json({ ok: true });
});

// SSE for real-time updates
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const onStatus = (data) => {
    res.write(`data: ${JSON.stringify({ type: "status", ...data })}\n\n`);
  };
  const onAdded = (bot) => {
    res.write(`data: ${JSON.stringify({ type: "bot-added", bot })}\n\n`);
  };

  manager.on("bot-status", onStatus);
  manager.on("bot-added", onAdded);

  req.on("close", () => {
    manager.off("bot-status", onStatus);
    manager.off("bot-added", onAdded);
  });
});

// Temp endpoint: receive cookies from browser extension → save storage-state.json
app.post("/api/save-cookies", express.json({ limit: "1mb" }), (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  const { platform, cookies } = req.body || {};
  if (!platform || !cookies) return res.status(400).json({ error: "platform and cookies required" });
  const authDir = path.join(__dirname, `auth-state-${platform}`);
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
  const statePath = path.join(authDir, "storage-state.json");
  fs.writeFileSync(statePath, JSON.stringify({ cookies, origins: [] }, null, 2));
  console.log(`[SaveCookies] ✅ ${cookies.length} cookies → ${statePath}`);
  res.json({ ok: true, count: cookies.length });
});

app.options("/api/save-cookies", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

// --- Client onboarding: collect filter preferences ---
manager.db.exec(`CREATE TABLE IF NOT EXISTS client_setups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  radius INTEGER,
  min_price INTEGER DEFAULT 0,
  max_price INTEGER,
  min_km INTEGER DEFAULT 0,
  max_km INTEGER,
  min_year INTEGER,
  max_year INTEGER,
  vehicle_types TEXT,
  fuels TEXT,
  gearbox_pref TEXT DEFAULT 'both',
  seller_type TEXT DEFAULT 'both',
  first_owner INTEGER DEFAULT 0,
  no_accident INTEGER DEFAULT 0,
  ct_valid INTEGER DEFAULT 0,
  zero_defects INTEGER DEFAULT 0,
  min_auto_score TEXT,
  num_doors TEXT,
  min_cv INTEGER,
  max_cv INTEGER,
  options TEXT,
  colors TEXT,
  platforms TEXT,
  evo_cities TEXT,
  preferred_brands TEXT,
  excluded_brands TEXT,
  keywords TEXT,
  exclude_keywords TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
)`);

// Migrate existing installs: add new columns if missing (safe — errors are ignored)
[
  "ALTER TABLE client_setups ADD COLUMN min_price INTEGER DEFAULT 0",
  "ALTER TABLE client_setups ADD COLUMN min_km INTEGER DEFAULT 0",
  "ALTER TABLE client_setups ADD COLUMN max_year INTEGER",
  "ALTER TABLE client_setups ADD COLUMN gearbox_pref TEXT DEFAULT 'both'",
  "ALTER TABLE client_setups ADD COLUMN seller_type TEXT DEFAULT 'both'",
  "ALTER TABLE client_setups ADD COLUMN first_owner INTEGER DEFAULT 0",
  "ALTER TABLE client_setups ADD COLUMN no_accident INTEGER DEFAULT 0",
  "ALTER TABLE client_setups ADD COLUMN ct_valid INTEGER DEFAULT 0",
  "ALTER TABLE client_setups ADD COLUMN zero_defects INTEGER DEFAULT 0",
  "ALTER TABLE client_setups ADD COLUMN min_auto_score TEXT",
  "ALTER TABLE client_setups ADD COLUMN num_doors TEXT",
  "ALTER TABLE client_setups ADD COLUMN min_cv INTEGER",
  "ALTER TABLE client_setups ADD COLUMN max_cv INTEGER",
  "ALTER TABLE client_setups ADD COLUMN options TEXT",
  "ALTER TABLE client_setups ADD COLUMN colors TEXT",
  "ALTER TABLE client_setups ADD COLUMN evo_cities TEXT",
  "ALTER TABLE client_setups ADD COLUMN keywords TEXT",
  "ALTER TABLE client_setups ADD COLUMN exclude_keywords TEXT",
].forEach(sql => { try { manager.db.exec(sql); } catch (_) {} });

app.post("/api/client-setup", async (req, res) => {
  try {
    const p = req.body || {};

    // Basic validation
    const required = ["firstName", "lastName", "phone", "email", "city", "radius", "maxPrice", "maxKm"];
    for (const k of required) {
      if (!p[k] && p[k] !== 0) {
        return res.status(400).json({ error: `Champ requis manquant: ${k}` });
      }
    }
    if (!Array.isArray(p.vehicleType) || p.vehicleType.length === 0) {
      return res.status(400).json({ error: "Sélectionnez au moins un type de véhicule" });
    }
    if (!Array.isArray(p.platforms) || p.platforms.length === 0) {
      return res.status(400).json({ error: "Sélectionnez au moins une plateforme" });
    }

    // Save
    const stmt = manager.db.prepare(`INSERT INTO client_setups
      (first_name, last_name, phone, email, city, radius,
       min_price, max_price, min_km, max_km, min_year, max_year,
       vehicle_types, fuels, gearbox_pref, seller_type,
       first_owner, no_accident, ct_valid, zero_defects, min_auto_score,
       num_doors, min_cv, max_cv,
       options, colors, platforms, evo_cities,
       preferred_brands, excluded_brands, keywords, exclude_keywords, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    const info = stmt.run(
      p.firstName, p.lastName, p.phone, p.email,
      p.city, p.radius,
      p.minPrice || 0, p.maxPrice, p.minKm || 0, p.maxKm,
      p.minYear || null, p.maxYear || null,
      JSON.stringify(p.vehicleType || []),
      JSON.stringify(p.fuel || []),
      p.gearboxPref || "both",
      p.sellerType || "both",
      p.firstOwner ? 1 : 0,
      p.noAccident ? 1 : 0,
      p.ctValid ? 1 : 0,
      p.zeroDefects ? 1 : 0,
      p.minAutoScore || null,
      p.numDoors || null,
      p.minCV || null,
      p.maxCV || null,
      JSON.stringify(p.options || []),
      JSON.stringify(p.colors || []),
      JSON.stringify(p.platforms || []),
      JSON.stringify(p.evoCities || []),
      Array.isArray(p.preferredBrands) ? p.preferredBrands.join(", ") : (p.preferredBrands || ""),
      Array.isArray(p.excludedBrands) ? p.excludedBrands.join(", ") : (p.excludedBrands || ""),
      Array.isArray(p.keywords) ? p.keywords.join(", ") : (p.keywords || ""),
      Array.isArray(p.excludeKeywords) ? p.excludeKeywords.join(", ") : (p.excludeKeywords || ""),
      p.notes || ""
    );

    const priceRange = p.minPrice > 0 ? `${Number(p.minPrice).toLocaleString("fr-FR")} → ${Number(p.maxPrice).toLocaleString("fr-FR")}€` : `max ${Number(p.maxPrice).toLocaleString("fr-FR")}€`;
    const yearRange = p.minYear || p.maxYear ? ` | Année: ${p.minYear || '?'}→${p.maxYear || '?'}` : '';
    console.log(`[ClientSetup] 🎯 Nouveau client #${info.lastInsertRowid}: ${p.firstName} ${p.lastName} — ${p.city} ${p.radius}km — ${priceRange} / ${Number(p.maxKm).toLocaleString("fr-FR")}km${yearRange}`);

    // Notify admin via WhatsApp
    try {
      const { sendWhatsApp } = require("./whatsapp");
      const qualityFlags = [
        p.firstOwner && "1ère main",
        p.noAccident && "sans accident",
        p.ctValid && "CT valide",
        p.zeroDefects && "zéro défaut Auto1",
        p.minAutoScore && `note ≥ ${p.minAutoScore}/5`,
      ].filter(Boolean);

      const msg = [
        `🎯 *Nouveau client SniperAuto*`,
        ``,
        `👤 ${p.firstName} ${p.lastName}`,
        `📞 ${p.phone}`,
        `📧 ${p.email}`,
        ``,
        `📍 ${p.city} — rayon ${p.radius}km`,
        `💰 Budget: ${priceRange}`,
        `🛣️ Km: ${p.minKm > 0 ? Number(p.minKm).toLocaleString("fr-FR") + " → " : ""}${Number(p.maxKm).toLocaleString("fr-FR")} km`,
        (p.minYear || p.maxYear) ? `📅 Année: ${p.minYear || '?'} → ${p.maxYear || '?'}` : null,
        ``,
        `🚗 Types: ${(p.vehicleType || []).join(", ")}`,
        p.numDoors ? `🚪 Portes: ${p.numDoors}` : null,
        (p.minCV || p.maxCV) ? `⚡ Puissance: ${p.minCV || '?'}→${p.maxCV || '?'} CV` : null,
        p.fuel?.length ? `⛽ Carburant: ${p.fuel.join(", ")}` : null,
        p.gearboxPref && p.gearboxPref !== 'both' ? `⚙️ Boîte: ${p.gearboxPref}` : null,
        `👤 Vendeur: ${p.sellerType === 'particulier' ? 'Particuliers seulement' : p.sellerType === 'professionnel' ? 'Pros seulement' : 'Tous'}`,
        qualityFlags.length ? `✅ Qualité: ${qualityFlags.join(", ")}` : null,
        p.options?.length ? `🎯 Options: ${p.options.join(", ")}` : null,
        p.colors?.length ? `🎨 Couleurs: ${p.colors.join(", ")}` : null,
        ``,
        `📡 Sources: ${(p.platforms || []).join(", ")}`,
        p.evoCities?.length ? `🏛️ Enchères villes: ${p.evoCities.join(", ")}` : null,
        p.preferredBrands ? `✅ Marques: ${p.preferredBrands}` : null,
        p.excludedBrands ? `❌ Exclues: ${p.excludedBrands}` : null,
        p.keywords ? `🔎 Mots-clés: ${p.keywords}` : null,
        p.excludeKeywords ? `🚫 Exclure: ${p.excludeKeywords}` : null,
        p.notes ? `\n💬 Notes: ${p.notes}` : null,
      ].filter(Boolean).join("\n");

      await sendWhatsApp(msg).catch((e) => console.warn("[ClientSetup] WhatsApp admin KO:", e.message));
    } catch (e) {
      console.warn("[ClientSetup] Notification erreur:", e.message);
    }

    // Send emails via Resend (non-blocking)
    sendClientSetupConfirmation(p).catch((e) => console.warn("[ClientSetup] Email confirmation KO:", e.message));
    sendClientSetupAdminNotification(p).catch((e) => console.warn("[ClientSetup] Email admin KO:", e.message));

    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    console.error("[ClientSetup] Erreur:", e.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Admin: list client setups
app.get("/api/client-setups", (req, res) => {
  try {
    const rows = manager.db.prepare("SELECT * FROM client_setups ORDER BY created_at DESC LIMIT 200").all();
    res.json(rows.map((r) => ({
      ...r,
      vehicle_types: JSON.parse(r.vehicle_types || "[]"),
      fuels: JSON.parse(r.fuels || "[]"),
      options: JSON.parse(r.options || "[]"),
      colors: JSON.parse(r.colors || "[]"),
      platforms: JSON.parse(r.platforms || "[]"),
      evo_cities: JSON.parse(r.evo_cities || "[]"),
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`\n🖥️  Dashboard: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/bots`);
  console.log("");
});

if (process.env.DISABLE_AUTO_SCAN !== "true") {
  setTimeout(() => {
    manager.getAllBots().forEach((bot) => {
      if (bot.enabled && bot.type === "auto1") manager.runBot(bot.id).catch(() => {});
    });
  }, 2000);
}

// Graceful shutdown
process.on("SIGINT", () => {
  manager.shutdown();
  process.exit(0);
});
process.on("SIGTERM", () => {
  manager.shutdown();
  process.exit(0);
});
