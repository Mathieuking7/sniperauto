const { chromium } = require("playwright");
const path = require("path");

const AUTH_DIR = path.join(__dirname, "..", "auth-state-facebook");

async function runFacebookScraper(config = {}) {
  const { url, filters = {} } = config;

  // Build Facebook Marketplace URL
  const searchUrl = url || buildSearchUrl(filters);
  console.log(`[Facebook] Scraping: ${searchUrl}`);

  const browser = await chromium.launchPersistentContext(AUTH_DIR, {
    headless: true,
    viewport: { width: 1400, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await browser.newPage();

  try {
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Accept cookies if shown
    const cookieBtn = await page.$('button[data-cookiebanner="accept_button"], button:has-text("Tout accepter"), button:has-text("Autoriser")');
    if (cookieBtn) {
      await cookieBtn.click().catch(() => {});
      await page.waitForTimeout(2000);
    }

    // Close login popup if it appears
    const closeBtn = await page.$('[aria-label="Fermer"], [aria-label="Close"]');
    if (closeBtn) {
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Wait for marketplace listings
    await page.waitForTimeout(5000);

    // Scroll to load more
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    const ads = await page.evaluate(() => {
      const results = [];

      // Strategy 1: Marketplace listing cards
      const links = document.querySelectorAll('a[href*="/marketplace/item/"]');
      const seen = new Set();

      for (const link of links) {
        try {
          const href = link.href;
          const idMatch = href.match(/\/item\/(\d+)/);
          const id = idMatch ? `fb_${idMatch[1]}` : null;
          if (!id || seen.has(id)) continue;
          seen.add(id);

          // Get the card container (walk up the DOM)
          let card = link;
          for (let i = 0; i < 5; i++) {
            if (card.parentElement) card = card.parentElement;
          }

          const text = card.textContent;

          // Price - look for €, $, or plain number with currency
          const priceMatch = text.match(/(\d[\d\s.,]*)\s*€/) || text.match(/€\s*(\d[\d\s.,]*)/) || text.match(/(\d[\d\s.,]*)\s*\$/) || text.match(/\$\s?(\d[\d\s.,]*)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/[\s.,]/g, "")) : null;

          // Title - first meaningful text in the link
          const spans = link.querySelectorAll("span");
          let title = "";
          for (const span of spans) {
            const t = span.textContent.trim();
            if (t.length > 5 && t.length < 100 && !t.includes("€") && !t.match(/^\d/)) {
              title = t;
              break;
            }
          }
          if (!title) {
            // Fallback: get text from image alt
            const img = link.querySelector("img");
            title = img ? img.alt : text.substring(0, 60).trim();
          }
          if (!title || title.length < 3) continue;

          // Location
          let location = null;
          const locMatches = text.match(/(?:à|·)\s*([A-ZÀ-Ü][a-zà-ü]+(?:\s[A-ZÀ-Ü][a-zà-ü]+)*)/);
          if (locMatches) location = locMatches[1];

          // Mileage
          const kmMatch = text.match(/([\d\s.]+)\s*km/i);
          const km = kmMatch ? parseInt(kmMatch[1].replace(/[\s.]/g, "")) : null;

          // Year
          const yearMatch = text.match(/\b(20\d{2})\b/) || text.match(/\b(19\d{2})\b/);
          const year = yearMatch ? yearMatch[1] : null;

          // Image
          const img = link.querySelector("img[src]");
          const imageUrl = img ? img.src : null;

          results.push({
            id,
            title: title.substring(0, 80),
            price,
            km,
            year,
            location,
            url: href.split("?")[0], // Clean URL
            imageUrl,
          });
        } catch (e) {}
      }

      return results;
    });

    console.log(`[Facebook] ${ads.length} annonces trouvées`);

    // Apply filters
    let filtered = ads;
    if (filters.maxPrice) filtered = filtered.filter((a) => a.price && a.price <= filters.maxPrice);
    if (filters.minPrice) filtered = filtered.filter((a) => a.price && a.price >= filters.minPrice);
    if (filters.maxKm) filtered = filtered.filter((a) => !a.km || a.km <= filters.maxKm);

    console.log(`[Facebook] ${filtered.length} annonces après filtres`);
    return filtered;
  } finally {
    await browser.close();
  }
}

function buildSearchUrl(filters = {}) {
  // Facebook Marketplace vehicles near Nîmes
  const params = new URLSearchParams({
    sortBy: "creation_time_descend",
    exact: "false",
  });

  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

  // Nîmes coordinates for radius search
  const lat = filters.lat || "43.8367";
  const lng = filters.lng || "4.3601";
  const radius = filters.distance || "20";

  return `https://www.facebook.com/marketplace/nimes/vehicles?${params.toString()}&radius=${radius}&latitude=${lat}&longitude=${lng}`;
}

module.exports = { runFacebookScraper };
