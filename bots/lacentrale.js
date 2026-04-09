const { chromium } = require("playwright");
const path = require("path");

const AUTH_DIR = path.join(__dirname, "..", "auth-state-lacentrale");

async function runLaCentraleScraper(config = {}) {
  const { url, filters = {} } = config;

  // Build La Centrale URL with filters
  const searchUrl = url || buildSearchUrl(filters);
  console.log(`[LaCentrale] Scraping: ${searchUrl}`);

  const browser = await chromium.launchPersistentContext(AUTH_DIR, {
    headless: true,
    viewport: { width: 1400, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await browser.newPage();

  try {
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Accept cookies
    const cookieBtn = await page.$('button#onetrust-accept-btn-handler, button:has-text("Tout accepter"), button:has-text("Accepter")');
    if (cookieBtn) {
      await cookieBtn.click().catch(() => {});
      await page.waitForTimeout(1500);
    }

    // Wait for listings
    await page.waitForSelector('[class*="searchCard"], [class*="listing"], [data-testid*="card"], article, .searchCard', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Scroll to load lazy content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const ads = await page.evaluate(() => {
      const results = [];

      // Strategy 1: Search result cards
      const cards = document.querySelectorAll('[class*="searchCard"], [class*="SearchCard"], article[class*="card"], [data-testid*="classified"]');

      for (const card of cards) {
        try {
          const link = card.querySelector('a[href*="/auto-occasion"], a[href*="/annonce"]');
          if (!link) continue;

          const href = link.href.startsWith("http") ? link.href : `https://www.lacentrale.fr${link.getAttribute("href")}`;

          // Extract ID from URL
          const idMatch = href.match(/(\d{10,})/);
          const id = idMatch ? `lc_${idMatch[1]}` : `lc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

          // Title
          const titleEl = card.querySelector('h2, h3, [class*="title"], [class*="Title"], [class*="name"]');
          const title = titleEl ? titleEl.textContent.trim() : link.textContent.trim().substring(0, 80);
          if (!title || title.length < 3) continue;

          const text = card.textContent;

          // Price
          const priceMatch = text.match(/(\d[\d\s.,]*)\s*€/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/[\s.,]/g, "")) : null;

          // Mileage
          const kmMatch = text.match(/([\d\s.]+)\s*km/i);
          const km = kmMatch ? parseInt(kmMatch[1].replace(/[\s.]/g, "")) : null;

          // Year
          const yearMatch = text.match(/\b(20\d{2})\b/) || text.match(/\b(19\d{2})\b/);
          const year = yearMatch ? yearMatch[1] : null;

          // Fuel
          const fuelMatch = text.match(/(Essence|Diesel|Hybride|Électrique|GPL)/i);
          const fuel = fuelMatch ? fuelMatch[1] : null;

          // Gearbox
          const gearMatch = text.match(/(Manuelle|Automatique|BVA|BVM)/i);
          const gearbox = gearMatch ? gearMatch[1] : null;

          // Location
          const locEl = card.querySelector('[class*="location"], [class*="Location"], [class*="city"]');
          const location = locEl ? locEl.textContent.trim() : null;

          // Image
          const img = card.querySelector('img[src*="auto"], img[src*="photo"], img[data-src]');
          const imageUrl = img ? (img.src || img.dataset.src) : null;

          results.push({ id, title, price, km, year, fuel, gearbox, location, url: href, imageUrl });
        } catch (e) {}
      }

      // Strategy 2: If no cards found, try generic links
      if (results.length === 0) {
        const links = document.querySelectorAll('a[href*="/auto-occasion-annonce"]');
        for (const link of links) {
          try {
            const href = link.href;
            const text = link.textContent.trim();
            if (text.length < 5 || text.length > 200) continue;

            const idMatch = href.match(/(\d{10,})/);
            const id = idMatch ? `lc_${idMatch[1]}` : `lc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

            const priceMatch = text.match(/(\d[\d\s.,]*)\s*€/);
            const price = priceMatch ? parseInt(priceMatch[1].replace(/[\s.,]/g, "")) : null;

            results.push({ id, title: text.substring(0, 80), price, url: href });
          } catch (e) {}
        }
      }

      return results;
    });

    console.log(`[LaCentrale] ${ads.length} annonces trouvées`);

    // Apply filters
    let filtered = ads;
    if (filters.maxPrice) filtered = filtered.filter((a) => a.price && a.price <= filters.maxPrice);
    if (filters.minPrice) filtered = filtered.filter((a) => a.price && a.price >= filters.minPrice);
    if (filters.maxKm) filtered = filtered.filter((a) => !a.km || a.km <= filters.maxKm);

    console.log(`[LaCentrale] ${filtered.length} annonces après filtres`);
    return filtered;
  } finally {
    await browser.close();
  }
}

function buildSearchUrl(filters = {}) {
  // La Centrale search URL for Nîmes area, 10-20k€
  const params = new URLSearchParams({
    makesModelsCommercialNames: "",
    options: "",
    page: "1",
    sortBy: "firstOnlineDateDesc",
  });

  if (filters.minPrice) params.set("priceMin", filters.minPrice);
  if (filters.maxPrice) params.set("priceMax", filters.maxPrice);
  if (filters.location) params.set("cityName", filters.location);
  if (filters.distance) params.set("radius", filters.distance);

  return `https://www.lacentrale.fr/listing?${params.toString()}`;
}

module.exports = { runLaCentraleScraper };
