const { chromium } = require("playwright");
const path = require("path");
require("dotenv").config();

const AUTH_DIR = path.join(__dirname, "auth-state");

const SEARCH_URL =
  "https://www.auto1.com/fr/app/merchant/cars?" +
  new URLSearchParams({
    channel: "24h",
    dir: "desc",
    distance: process.env.SEARCH_DISTANCE || "200",
    lat: process.env.SEARCH_LAT || "43.7376301",
    lng: process.env.SEARCH_LNG || "4.260744",
    locationName: process.env.SEARCH_LOCATION_NAME || "Vestric-et-Candiac, France",
    page: "1",
    sort: "time",
    priceMax: process.env.MAX_PRICE || "1000",
  }).toString();

async function login(page) {
  console.log("[Scraper] Connexion à Auto1...");
  await page.goto("https://www.auto1.com/fr/app/login", {
    waitUntil: "domcontentloaded",
  });

  // Check if already logged in
  const isLogged = await page.evaluate(() =>
    document.cookie.includes("isUserLogged=true")
  );
  if (isLogged) {
    console.log("[Scraper] Déjà connecté");
    return true;
  }

  const email = process.env.AUTO1_EMAIL;
  const password = process.env.AUTO1_PASSWORD;
  if (!email || !password) {
    console.error("[Scraper] AUTO1_EMAIL et AUTO1_PASSWORD requis dans .env");
    return false;
  }

  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/merchant/**", { timeout: 15000 });
  console.log("[Scraper] Connecté");
  return true;
}

function parsePrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : null;
}

async function scrapeDeals(page) {
  console.log(`[Scraper] Navigation vers la recherche...`);
  await page.goto(SEARCH_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector(".big-car-card__price-info", { timeout: 20000 });
  // Wait extra for details to render
  await page.waitForTimeout(3000);

  // Get total results count
  const totalText = await page.textContent('[class*="searchSidebar__total"], [class*="VÉHICULES"]').catch(() => null);
  console.log(`[Scraper] Résultats: ${totalText || "?"}`);

  const allDeals = [];
  let currentPage = 1;
  const maxPages = 10;

  while (currentPage <= maxPages) {
    console.log(`[Scraper] Page ${currentPage}...`);

    const deals = await page.evaluate(() => {
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
        const prices = Array.from(priceValues).map((p) =>
          p.textContent.replace(/[^\d]/g, "")
        );

        // Extract details via regex on full card text
        const fullText = card.textContent;
        const extract = (regex) => {
          const m = fullText.match(regex);
          return m ? m[1].trim() : null;
        };

        results.push({
          id,
          title: title || null,
          price_auto1: prices[0] ? parseInt(prices[0]) : null,
          current_bid: prices[2] ? parseInt(prices[2]) : null,
          savings: prices[4] ? parseInt(prices[4]) : null,
          km: (() => {
            const raw = extract(/kilométrique:\s*([\d\s.]+)\s*km/);
            return raw ? parseInt(raw.replace(/\D/g, "")) : null;
          })(),
          year: extract(/immatriculation:\s*(\d{2}\/\d{4})/),
          fuel: extract(/carburant:\s*([^\n]+?)(?:Boite|Lieu|Puissance|$)/),
          gearbox: extract(/vitesse:\s*([^\n]+?)(?:Lieu|Type|Puissance|$)/),
          power: extract(/Puissance:\s*([^\n]+?)(?:Type|Boite|Lieu|$)/),
          location: extract(/véhicule:\s*([^\n]+?)(?:Mes|$)/),
          auction_end: extract(/dans\s*([\d:]+)/),
        });
      }

      return results;
    });

    allDeals.push(...deals);

    // Check for next page
    const nextBtn = await page.$('a[href*="page=' + (currentPage + 1) + '"]');
    if (!nextBtn) break;

    currentPage++;
    const nextUrl = SEARCH_URL.replace("page=1", `page=${currentPage}`);
    await page.goto(nextUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page
      .waitForSelector(".big-car-card__price-info", { timeout: 10000 })
      .catch(() => null);
    await page.waitForTimeout(3000);
  }

  console.log(`[Scraper] ${allDeals.length} deals extraits sur ${currentPage} pages`);

  // Check each deal's detail page for clean test drive
  const cleanDeals = [];
  for (const deal of allDeals) {
    const detailUrl = `https://www.auto1.com/fr/app/merchant/car/${deal.id}`;
    console.log(`[Scraper] Vérification essai routier: ${deal.id} (${deal.title})...`);
    try {
      await page.goto(detailUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(2000);

      const testDriveResult = await page.evaluate(() => {
        const body = document.body.innerText;
        const idx = body.indexOf("ESSAI ROUTIER");
        if (idx === -1) return { found: false, section: null, imageUrl: null };
        // Extract text between ESSAI ROUTIER and RELEVE DE DOMMAGES
        const endIdx = body.indexOf("RELEVE DE DOMMAGES", idx);
        const section = endIdx > -1
          ? body.substring(idx, endIdx).replace(/\s+/g, " ").trim()
          : body.substring(idx, idx + 500).replace(/\s+/g, " ").trim();
        // Get first car image
        const img = document.querySelector('img[src*="img-pa.auto1.com"], img[src*="/pa/"]');
        const imageUrl = img ? img.src : null;
        return { found: true, section, imageUrl };
      });

      if (!testDriveResult.found) {
        console.log(`  -> Pas de section essai routier trouvée, ignoré`);
        continue;
      }

      const section = testDriveResult.section;
      // Only accept vehicles with explicitly NO issues
      const isClean =
        section.includes("AUCUNE DÉCOUVERTE SPÉCIFIQUE") ||
        section.includes("AUCUNE DECOUVERTE SPECIFIQUE") ||
        section.includes("Pas de constat sp") ||
        section.includes("aucune découverte spécifique");

      if (isClean) {
        // Filter by year >= 2002
        const yearMatch = deal.year && deal.year.match(/(\d{4})/);
        const yearNum = yearMatch ? parseInt(yearMatch[1]) : 0;
        if (yearNum < 2002) {
          console.log(`  -> Essai OK mais année ${yearNum} < 2002, filtré`);
          continue;
        }
        console.log(`  -> CLEAN - essai routier OK, année ${yearNum}`);
        deal.test_drive = "clean";
        deal.imageUrl = testDriveResult.imageUrl;
        cleanDeals.push(deal);
      } else {
        console.log(`  -> DEFAUTS détectés, filtré`);
      }
    } catch (err) {
      console.log(`  -> Erreur: ${err.message}`);
    }
  }

  console.log(`[Scraper] ${cleanDeals.length}/${allDeals.length} véhicules avec essai routier propre`);
  return cleanDeals;
}

async function runScraper() {
  const browser = await chromium.launchPersistentContext(AUTH_DIR, {
    headless: true,
    viewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  try {
    const loggedIn = await login(page);
    if (!loggedIn) {
      throw new Error("Impossible de se connecter");
    }

    const deals = await scrapeDeals(page);
    return deals;
  } finally {
    await browser.close();
  }
}

module.exports = { runScraper };
