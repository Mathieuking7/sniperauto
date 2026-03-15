/**
 * Dashboard — Express server with API + frontend
 */
require("dotenv").config();
const express = require("express");
const path = require("path");
const BotManager = require("./bot-manager");
const Stripe = require("stripe");
const { sendSubscriptionConfirmation, sendAdminNotification, sendContactRequest } = require("./email");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

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

    // Save to DB
    try {
      manager.db.prepare(`
        INSERT INTO subscribers (email, stripe_customer_id, stripe_subscription_id, plan, billing)
        VALUES (?, ?, ?, ?, ?)
      `).run(email, session.customer, session.subscription, plan, billing);
      console.log(`[Stripe] Nouvel abonne: ${email} - ${plan}`);
    } catch (e) {
      console.error("[Stripe] DB error:", e.message);
    }

    // Send emails
    await sendSubscriptionConfirmation(email, plan, billing);
    await sendAdminNotification(email, plan, billing);
  }

  res.json({ received: true });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// index.html is served automatically as homepage by express.static

// Initialize bot manager
const manager = new BotManager();

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
  } catch (e) {
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
  const { plan, billing } = req.body;
  const priceKey = `${plan}_${billing}`;
  const priceId = PRICE_MAP[priceKey];
  const setupPriceId = SETUP_FEE_MAP[plan];

  if (!priceId) return res.status(400).json({ error: "Invalid plan or billing" });

  try {
    const lineItems = [{ price: priceId, quantity: 1 }];
    if (setupPriceId) lineItems.push({ price: setupPriceId, quantity: 1 });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: { plan, billing },
      success_url: `${req.protocol}://${req.get("host")}/success.html`,
      cancel_url: `${req.protocol}://${req.get("host")}/#tarifs`,
    });
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

app.listen(PORT, () => {
  console.log(`\n🖥️  Dashboard: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/bots`);
  console.log("");
});

// Graceful shutdown
process.on("SIGINT", () => {
  manager.shutdown();
  process.exit(0);
});
process.on("SIGTERM", () => {
  manager.shutdown();
  process.exit(0);
});
