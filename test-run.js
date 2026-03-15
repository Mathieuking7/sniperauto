/**
 * Test unique: scrape + affiche les résultats (pas de WhatsApp).
 * Usage: node test-run.js
 */
const { runScraper } = require("./scraper");
const { getDb, upsertDeal } = require("./db");

async function main() {
  console.log("Test scraping Auto1...\n");

  const deals = await runScraper();
  console.log(`\n${deals.length} deals trouvés:\n`);

  const db = getDb();

  for (const deal of deals) {
    if (!deal.id) continue;
    deal.url = `https://www.auto1.com/fr/app/merchant/car/${deal.id}`;
    upsertDeal(db, deal);
  }

  // Display top deals
  const sorted = deals
    .sort((a, b) => (a.current_bid || a.price_auto1 || 9999) - (b.current_bid || b.price_auto1 || 9999));

  console.log("--- TOP 15 DEALS (essai routier OK) ---\n");
  for (const d of sorted.slice(0, 15)) {
    const price = d.current_bid || d.price_auto1 || "?";
    console.log(
      `${price}€ | ${d.title} | ${d.year || "?"} | ${d.km ? d.km.toLocaleString() + "km" : "?"} | ${d.fuel || "?"} | ${d.location || "?"}`
    );
  }

  console.log(`\nTotal en DB: ${db.prepare("SELECT COUNT(*) as c FROM deals").get().c}`);
  db.close();
}

main().catch(console.error);
