const { chromium } = require("playwright");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const AUTH_DIR = path.join(__dirname, "..", "auth-state-aramis");

async function login(page) {
  console.log("[Aramis] Connexion...");
  await page.goto("https://pro.aramisauto.com/login", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // Check if already logged in
  const isLoggedIn = await page.evaluate(() => {
    return !window.location.href.includes("/login");
  });
  if (isLoggedIn) {
    console.log("[Aramis] Deja connecte");
    return true;
  }

  const email = process.env.ARAMIS_EMAIL;
  const password = process.env.ARAMIS_PASSWORD;
  if (!email || !password) {
    console.error("[Aramis] ARAMIS_EMAIL et ARAMIS_PASSWORD requis dans .env");
    return false;
  }

  // Fill login form
  await page.waitForSelector('input[type="email"], input[name="email"], input[type="text"]', { timeout: 10000 });
  const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]') || await page.$('input[type="text"]');
  if (emailInput) await emailInput.fill(email);

  const passInput = await page.$('input[type="password"]') || await page.$('input[name="password"]');
  if (passInput) await passInput.fill(password);

  // Click submit
  const submitBtn = await page.$('button[type="submit"]') || await page.$('button:has-text("Connexion")') || await page.$('button:has-text("Se connecter")');
  if (submitBtn) await submitBtn.click();

  // Wait for redirect
  await page.waitForURL("**/cars**", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const loggedIn = await page.evaluate(() => !window.location.href.includes("/login"));
  if (loggedIn) {
    console.log("[Aramis] Connecte");
    return true;
  }

  console.error("[Aramis] Echec de connexion");
  return false;
}

async function scrapeAramis(page, config = {}) {
  const { url, filters = {} } = config;
  const targetUrl = url || "https://pro.aramisauto.com/cars";

  console.log(`[Aramis] Navigation vers ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(5000);

  // Wait for car listings to appear
  await page.waitForSelector('a[href*="/car"], [class*="card"], [class*="Car"], [class*="vehicle"], tr, .row', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Debug: save page content for analysis
  const pageUrl = page.url();
  console.log(`[Aramis] Page actuelle: ${pageUrl}`);

  const deals = await page.evaluate(() => {
    const results = [];

    // Strategy 1: Table rows
    const rows = document.querySelectorAll('table tbody tr, [role="row"]');
    if (rows.length > 0) {
      for (const row of rows) {
        try {
          const cells = row.querySelectorAll("td, [role=\"cell\"]");
          if (cells.length < 3) continue;

          const link = row.querySelector("a[href]");
          const href = link ? link.href : "";
          const idMatch = href.match(/\/car\/(\w+)/) || href.match(/\/(\d+)/);
          const id = idMatch ? idMatch[1] : `aramis_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

          const text = row.textContent;
          const title = link ? link.textContent.trim() : (cells[0] ? cells[0].textContent.trim() : "");

          // Extract price
          const priceMatch = text.match(/(\d[\d\s.,]*)\s*€/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/[\s.,]/g, "")) : null;

          // Extract km
          const kmMatch = text.match(/([\d\s.]+)\s*km/i);
          const km = kmMatch ? parseInt(kmMatch[1].replace(/[\s.]/g, "")) : null;

          // Extract year
          const yearMatch = text.match(/\b(20\d{2})\b/) || text.match(/(\d{2}\/\d{4})/);
          const year = yearMatch ? yearMatch[1] : null;

          const img = row.querySelector("img[src]");
          const imageUrl = img ? img.src : null;

          results.push({ id, title, price, km, year, url: href, imageUrl });
        } catch (e) {}
      }
    }

    // Strategy 2: Card-based listings
    if (results.length === 0) {
      const cards = document.querySelectorAll('[class*="card"], [class*="Car"], [class*="vehicle"], [class*="listing"], [class*="item"]');
      for (const card of cards) {
        try {
          const link = card.querySelector("a[href]");
          if (!link) continue;
          const href = link.href;
          if (!href.includes("car") && !href.includes("vehicle") && !href.includes("auto")) continue;

          const idMatch = href.match(/\/(\w+)$/) || href.match(/\/(\d+)/);
          const id = idMatch ? idMatch[1] : `aramis_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

          const titleEl = card.querySelector("h2, h3, h4, [class*='title'], [class*='name'], [class*='Title']");
          const title = titleEl ? titleEl.textContent.trim() : link.textContent.trim().substring(0, 80);

          const text = card.textContent;
          const priceMatch = text.match(/(\d[\d\s.,]*)\s*€/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/[\s.,]/g, "")) : null;

          const kmMatch = text.match(/([\d\s.]+)\s*km/i);
          const km = kmMatch ? parseInt(kmMatch[1].replace(/[\s.]/g, "")) : null;

          const yearMatch = text.match(/\b(20\d{2})\b/);
          const year = yearMatch ? yearMatch[1] : null;

          const img = card.querySelector("img[src]");
          const imageUrl = img ? img.src : null;

          results.push({ id, title, price, km, year, url: href, imageUrl });
        } catch (e) {}
      }
    }

    // Strategy 3: Generic links with car info
    if (results.length === 0) {
      const links = document.querySelectorAll('a[href*="car"], a[href*="vehicle"]');
      for (const link of links) {
        try {
          const href = link.href;
          const text = link.textContent.trim();
          if (text.length < 5 || text.length > 200) continue;

          const idMatch = href.match(/\/(\w+)$/);
          const id = idMatch ? idMatch[1] : `aramis_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

          const priceMatch = text.match(/(\d[\d\s.,]*)\s*€/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/[\s.,]/g, "")) : null;

          results.push({ id, title: text.substring(0, 80), price, url: href });
        } catch (e) {}
      }
    }

    return results;
  });

  console.log(`[Aramis] ${deals.length} vehicules trouves`);

  // Apply filters
  let filtered = deals;
  if (filters.maxPrice) {
    filtered = filtered.filter((d) => d.price && d.price <= filters.maxPrice);
  }
  if (filters.minPrice) {
    filtered = filtered.filter((d) => d.price && d.price >= filters.minPrice);
  }
  if (filters.maxKm) {
    filtered = filtered.filter((d) => !d.km || d.km <= filters.maxKm);
  }
  if (filters.minYear) {
    filtered = filtered.filter((d) => {
      if (!d.year) return true;
      const y = parseInt(d.year.match(/(\d{4})/)?.[1] || "0");
      return y >= filters.minYear;
    });
  }

  console.log(`[Aramis] ${filtered.length} vehicules apres filtres`);
  return filtered;
}

async function runAramisScraper(config = {}) {
  const browser = await chromium.launchPersistentContext(AUTH_DIR, {
    headless: true,
    viewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  try {
    const loggedIn = await login(page);
    if (!loggedIn) {
      throw new Error("Impossible de se connecter a Aramis Pro");
    }

    const deals = await scrapeAramis(page, config);
    return deals;
  } finally {
    await browser.close();
  }
}

module.exports = { runAramisScraper };
