const { chromium } = require("playwright");
const path = require("path");
require("dotenv").config();

async function main() {
  const browser = await chromium.launchPersistentContext(path.join(__dirname, "auth-state"), {
    headless: true,
    viewport: { width: 1400, height: 900 },
  });
  const page = await browser.newPage();
  await page.goto("https://www.auto1.com/fr/app/merchant/cars?channel=24h&dir=desc&distance=200&lat=43.7376301&lng=4.260744&locationName=Vestric-et-Candiac%2C+France&page=1&sort=time&priceMax=1000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector(".big-car-card__price-info", { timeout: 20000 });
  await page.waitForTimeout(5000);

  // Get first card - go higher up
  const html = await page.evaluate(() => {
    const link = document.querySelector('a[href*="/car/BX33058"]');
    let el = link;
    for (let i = 0; i < 20; i++) {
      el = el.parentElement;
      if (!el) break;
      // Stop when we find something that looks like a full card container
      if (el.querySelector('.big-car-card__price-info') && el.querySelector('[data-qa-id*="km"], [class*="detail"], [class*="spec"]')) break;
    }
    // Also get all text content to find km/year patterns
    const fullText = el ? el.textContent.replace(/\s+/g, ' ').trim() : 'nope';
    const classList = el ? el.className : '';
    // Check the whole page for km pattern near this car
    const allText = document.body.innerHTML.match(/133[\s.]?009/g);
    return { fullText: fullText.substring(0, 1000), class: classList, kmFound: allText };
  });
  console.log(html);
  await browser.close();
}
main();
