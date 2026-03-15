/**
 * Quick scraper to fetch example listings from Auto1 for landing page data.
 * Reuses existing auth-state from the main scraper.
 */
const { chromium } = require("playwright");
const path = require("path");
require("dotenv").config();

const AUTH_DIR = path.join(__dirname, "auth-state");

async function main() {
  const browser = await chromium.launchPersistentContext(AUTH_DIR, {
    headless: true,
    viewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  try {
    // Login if needed
    await page.goto("https://www.auto1.com/fr/app/login", { waitUntil: "domcontentloaded" });
    const isLogged = await page.evaluate(() => document.cookie.includes("isUserLogged=true"));
    if (!isLogged) {
      await page.fill('input[name="email"], input[type="email"]', process.env.AUTO1_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', process.env.AUTO1_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL("**/merchant/**", { timeout: 15000 });
    }

    // Search with price range 1000-20000, sorted by time, multiple pages if needed
    const searchUrl = "https://www.auto1.com/fr/app/merchant/cars?" +
      new URLSearchParams({
        channel: "24h",
        dir: "desc",
        distance: "500",
        lat: process.env.SEARCH_LAT || "43.7376301",
        lng: process.env.SEARCH_LNG || "4.260744",
        locationName: process.env.SEARCH_LOCATION_NAME || "Vestric-et-Candiac, France",
        page: "1",
        sort: "time",
        priceMin: "1000",
        priceMax: "20000",
      }).toString();

    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector(".big-car-card__container", { timeout: 20000 });
    await page.waitForTimeout(3000);

    // Extract listings from search results
    const listings = await page.evaluate(() => {
      const cards = document.querySelectorAll(".big-car-card__container");
      const results = [];
      for (const card of cards) {
        const link = card.querySelector('a[href*="/car/"]');
        if (!link) continue;
        const pathMatch = link.href.match(/\/car\/([A-Z0-9]+)/);
        const id = pathMatch ? pathMatch[1] : null;
        if (!id) continue;

        const title = link.textContent.replace(/\s+/g, " ").trim();
        const priceValues = card.querySelectorAll(".price-value");
        const prices = Array.from(priceValues).map(p => p.textContent.replace(/[^\d]/g, ""));

        const fullText = card.textContent;
        const extract = (regex) => { const m = fullText.match(regex); return m ? m[1].trim() : null; };

        const price = prices[0] ? parseInt(prices[0]) : null;

        // Get thumbnail image from card
        const img = card.querySelector("img");
        const imageUrl = img ? img.src : null;

        results.push({
          id,
          title: title || null,
          price,
          km: (() => { const raw = extract(/kilométrique:\s*([\d\s.]+)\s*km/); return raw ? parseInt(raw.replace(/\D/g, "")) : null; })(),
          year: extract(/immatriculation:\s*(\d{2}\/\d{4})/),
          fuel: extract(/carburant:\s*([^\n]+?)(?:Boite|Lieu|Puissance|$)/),
          location: extract(/véhicule:\s*([^\n]+?)(?:Mes|$)/),
          imageUrl,
        });
      }
      return results;
    });

    // Filter to those with price in range and take up to 8 varied ones
    let filtered = listings.filter(l => l.price && l.price >= 1000 && l.price <= 20000);

    // If not enough from page 1, try page 2
    if (filtered.length < 8) {
      const page2Url = searchUrl.replace("page=1", "page=2");
      await page.goto(page2Url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForSelector(".big-car-card__container", { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(3000);

      const more = await page.evaluate(() => {
        const cards = document.querySelectorAll(".big-car-card__container");
        const results = [];
        for (const card of cards) {
          const link = card.querySelector('a[href*="/car/"]');
          if (!link) continue;
          const pathMatch = link.href.match(/\/car\/([A-Z0-9]+)/);
          const id = pathMatch ? pathMatch[1] : null;
          if (!id) continue;
          const title = link.textContent.replace(/\s+/g, " ").trim();
          const priceValues = card.querySelectorAll(".price-value");
          const prices = Array.from(priceValues).map(p => p.textContent.replace(/[^\d]/g, ""));
          const fullText = card.textContent;
          const extract = (regex) => { const m = fullText.match(regex); return m ? m[1].trim() : null; };
          const price = prices[0] ? parseInt(prices[0]) : null;
          const img = card.querySelector("img");
          const imageUrl = img ? img.src : null;
          results.push({
            id, title: title || null, price,
            km: (() => { const raw = extract(/kilométrique:\s*([\d\s.]+)\s*km/); return raw ? parseInt(raw.replace(/\D/g, "")) : null; })(),
            year: extract(/immatriculation:\s*(\d{2}\/\d{4})/),
            fuel: extract(/carburant:\s*([^\n]+?)(?:Boite|Lieu|Puissance|$)/),
            location: extract(/véhicule:\s*([^\n]+?)(?:Mes|$)/),
            imageUrl,
          });
        }
        return results;
      });
      filtered = filtered.concat(more.filter(l => l.price && l.price >= 1000 && l.price <= 20000));
    }

    // Now visit each listing's detail page to get the high-res photo
    const selected = filtered.slice(0, 8);
    const results = [];

    for (const listing of selected) {
      const detailUrl = `https://www.auto1.com/fr/app/merchant/car/${listing.id}`;
      try {
        await page.goto(detailUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(2000);

        const detail = await page.evaluate(() => {
          // Get first high-res car photo
          const img = document.querySelector('img[src*="img-pa.auto1.com"], img[src*="/pa/"]');
          const imageUrl = img ? img.src : null;
          return { imageUrl };
        });

        if (detail.imageUrl) {
          listing.imageUrl = detail.imageUrl;
        }
      } catch (e) {
        // keep thumbnail URL
      }
      results.push(listing);
    }

    // Output JSON
    console.log(JSON.stringify(results, null, 2));

  } finally {
    await browser.close();
  }
}

main().catch(err => { console.error("Error:", err.message); process.exit(1); });
