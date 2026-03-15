const { chromium } = require("playwright");
const path = require("path");

const AUTH_DIR = path.join(__dirname, "..", "auth-state-lbc");

async function runLeboncoinScraper(config) {
  const { url, filters = {} } = config;
  if (!url) throw new Error("URL Le Bon Coin requise");

  console.log(`[LBC] Scraping: ${url}`);

  const browser = await chromium.launchPersistentContext(AUTH_DIR, {
    headless: true,
    viewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Accept cookies if popup appears
    const cookieBtn = await page.$('button[id*="didomi"], button:has-text("Accepter"), button:has-text("Tout accepter")');
    if (cookieBtn) {
      await cookieBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Wait for listings
    await page.waitForSelector('[data-qa-id="aditem_container"], [class*="aditem"], a[data-qa-id="ad"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    const ads = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-qa-id="aditem_container"], [class*="styles_adCard"]');
      const results = [];

      for (const item of items) {
        try {
          const link = item.querySelector("a[href]");
          if (!link) continue;

          const href = link.href;
          // Extract ID from URL
          const idMatch = href.match(/(\d+)\.htm/);
          const id = idMatch ? idMatch[1] : href;

          const titleEl = item.querySelector('[data-qa-id="aditem_title"], [class*="Title"], p[data-qa-id]');
          const title = titleEl ? titleEl.textContent.trim() : "";

          const priceEl = item.querySelector('[data-qa-id="aditem_price"], [class*="Price"], span[aria-label*="prix"]');
          const priceText = priceEl ? priceEl.textContent.trim() : "";
          const price = parseInt(priceText.replace(/[^\d]/g, "")) || null;

          const locEl = item.querySelector('[data-qa-id="aditem_location"], [aria-label*="Localisation"]');
          const location = locEl ? locEl.textContent.trim() : "";

          const dateEl = item.querySelector('[data-qa-id="aditem_date"], [class*="Date"], time');
          const date = dateEl ? dateEl.textContent.trim() : "";

          const imgEl = item.querySelector("img[src]");
          const imageUrl = imgEl ? imgEl.src : null;

          results.push({ id, title, price, priceText, location, date, url: href, imageUrl });
        } catch (e) {
          // skip bad item
        }
      }

      return results;
    });

    console.log(`[LBC] ${ads.length} annonces trouvées`);

    // Apply filters
    let filtered = ads;

    if (filters.maxPrice) {
      filtered = filtered.filter((a) => a.price && a.price <= filters.maxPrice);
    }
    if (filters.minPrice) {
      filtered = filtered.filter((a) => a.price && a.price >= filters.minPrice);
    }
    if (filters.keywords && filters.keywords.length > 0) {
      filtered = filtered.filter((a) => {
        const text = (a.title + " " + a.location).toLowerCase();
        return filters.keywords.some((kw) => text.includes(kw.toLowerCase()));
      });
    }
    if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
      filtered = filtered.filter((a) => {
        const text = (a.title + " " + a.location).toLowerCase();
        return !filters.excludeKeywords.some((kw) => text.includes(kw.toLowerCase()));
      });
    }

    console.log(`[LBC] ${filtered.length} annonces après filtres`);
    return filtered;
  } finally {
    await browser.close();
  }
}

module.exports = { runLeboncoinScraper };
