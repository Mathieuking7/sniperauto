const cron = require("node-cron");
require("dotenv").config();

const { runScraper } = require("./scraper");
const { getDb, upsertDeal, getUnnotifiedDeals, markNotified } = require("./db");
const { sendWhatsApp, sendWhatsAppWithImage, formatDealMessage } = require("./whatsapp");

async function checkDeals() {
  console.log(`\n[${new Date().toLocaleString("fr-FR")}] Scan en cours...`);
  const db = getDb();

  try {
    const deals = await runScraper();
    console.log(`[Monitor] ${deals.length} deals trouvés`);

    // Upsert all deals
    let newCount = 0;
    for (const deal of deals) {
      if (!deal.id) continue;
      deal.url = `https://www.auto1.com/fr/app/merchant/car/${deal.id}`;
      const result = upsertDeal(db, deal);
      if (result.changes > 0 && result.lastInsertRowid) {
        newCount++;
      }
    }
    console.log(`[Monitor] ${newCount} nouveaux deals`);

    // Send notifications for new deals
    const unnotified = getUnnotifiedDeals(db);
    if (unnotified.length > 0) {
      console.log(`[Monitor] ${unnotified.length} deals à notifier`);

      for (const deal of unnotified) {
        const msg = formatDealMessage(deal);
        // Find the deal with imageUrl from scraper results
        const scraped = deals.find((d) => d.id === deal.id);
        const imageUrl = scraped && scraped.imageUrl;
        if (imageUrl) {
          await sendWhatsAppWithImage(imageUrl, msg);
        } else {
          await sendWhatsApp(msg);
        }
        await new Promise((r) => setTimeout(r, 2000)); // rate limit
      }

      markNotified(
        db,
        unnotified.map((d) => d.id)
      );
    }
  } catch (err) {
    console.error("[Monitor] Erreur:", err.message);
    await sendWhatsApp(`⚠️ *Erreur Auto1 Monitor*\n${err.message}`);
  } finally {
    db.close();
  }
}

// --- SCHEDULING ---

// Check every 30 minutes between 10h and 17h
cron.schedule("*/30 10-16 * * *", () => {
  checkDeals();
});

console.log("🚗 Auto1 Monitor démarré");
console.log("  - Scan toutes les 30 min (10h-17h)");
console.log("  - WhatsApp:", process.env.WHATSAPP_PHONE ? "configuré" : "⚠️ non configuré");
console.log("");

// Run immediately on start
checkDeals();
