require("dotenv").config();
const { chromium } = require("playwright");
const path = require("path");

async function debugLaCentrale() {
  console.log("\n=== DEBUG LA CENTRALE ===");
  const browser = await chromium.launchPersistentContext(path.join(__dirname, "auth-state-lacentrale"), {
    headless: true,
    viewport: { width: 1400, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await browser.newPage();
  try {
    await page.goto("https://www.lacentrale.fr/listing?makesModelsCommercialNames=&priceMin=10000&priceMax=20000&page=1&sortBy=firstOnlineDateDesc", { waitUntil: "domcontentloaded", timeout: 30000 });
    // Cookie
    const btn = await page.$('button#onetrust-accept-btn-handler, button:has-text("Tout accepter")');
    if (btn) { await btn.click().catch(() => {}); await page.waitForTimeout(2000); }
    await page.waitForTimeout(5000);
    console.log("URL:", page.url());
    const html = await page.content();
    // Count links and cards
    const stats = await page.evaluate(() => {
      return {
        links: document.querySelectorAll('a[href*="/auto-occasion"]').length,
        cards: document.querySelectorAll('[class*="searchCard"], [class*="SearchCard"], article').length,
        allLinks: document.querySelectorAll('a[href]').length,
        bodyLen: document.body.innerText.length,
        sample: document.body.innerText.substring(0, 500),
      };
    });
    console.log("Stats:", JSON.stringify(stats, null, 2));
  } finally { await browser.close(); }
}

async function debugLeBonCoin() {
  console.log("\n=== DEBUG LEBONCOIN ===");
  const browser = await chromium.launchPersistentContext(path.join(__dirname, "auth-state-lbc"), {
    headless: true,
    viewport: { width: 1400, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await browser.newPage();
  try {
    await page.goto("https://www.leboncoin.fr/recherche?category=2&locations=N%C3%AEmes__43.8367_4.3601_20000&price=10000-20000&sort=time", { waitUntil: "domcontentloaded", timeout: 30000 });
    const btn = await page.$('button#didomi-notice-agree-button, button:has-text("Accepter"), button:has-text("Tout accepter")');
    if (btn) { await btn.click().catch(() => {}); await page.waitForTimeout(2000); }
    await page.waitForTimeout(5000);
    console.log("URL:", page.url());
    const stats = await page.evaluate(() => {
      return {
        adContainers: document.querySelectorAll('[data-qa-id="aditem_container"]').length,
        adCards: document.querySelectorAll('[class*="styles_adCard"], [class*="adCard"]').length,
        links: document.querySelectorAll('a[href*="/ad/"]').length,
        allLinks: document.querySelectorAll('a[href]').length,
        bodyLen: document.body.innerText.length,
        sample: document.body.innerText.substring(0, 500),
      };
    });
    console.log("Stats:", JSON.stringify(stats, null, 2));
  } finally { await browser.close(); }
}

async function debugFacebook() {
  console.log("\n=== DEBUG FACEBOOK ===");
  const browser = await chromium.launchPersistentContext(path.join(__dirname, "auth-state-facebook"), {
    headless: true,
    viewport: { width: 1400, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await browser.newPage();
  try {
    await page.goto("https://www.facebook.com/marketplace/nimes/vehicles?minPrice=10000&maxPrice=20000&radius=20&latitude=43.8367&longitude=4.3601&sortBy=creation_time_descend&exact=false", { waitUntil: "domcontentloaded", timeout: 30000 });
    const btn = await page.$('button[data-cookiebanner="accept_button"], button:has-text("Tout accepter")');
    if (btn) { await btn.click().catch(() => {}); await page.waitForTimeout(2000); }
    const close = await page.$('[aria-label="Fermer"], [aria-label="Close"]');
    if (close) { await close.click().catch(() => {}); }
    await page.waitForTimeout(5000);
    console.log("URL:", page.url());
    const stats = await page.evaluate(() => {
      const items = document.querySelectorAll('a[href*="/marketplace/item/"]');
      const sample = [];
      for (let i = 0; i < Math.min(3, items.length); i++) {
        let card = items[i];
        for (let j = 0; j < 5; j++) if (card.parentElement) card = card.parentElement;
        sample.push(card.textContent.substring(0, 200));
      }
      return {
        marketplaceItems: items.length,
        sampleTexts: sample,
      };
    });
    console.log("Stats:", JSON.stringify(stats, null, 2));
  } finally { await browser.close(); }
}

async function main() {
  await debugFacebook();
  await debugLaCentrale();
  await debugLeBonCoin();
}
main().catch(console.error);
