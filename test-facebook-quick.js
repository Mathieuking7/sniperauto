/**
 * Quick test: Facebook Marketplace only — send 5 to WhatsApp
 */
require("dotenv").config();
const { runFacebookScraper } = require("./bots/facebook");
const { sendWhatsApp, sendWhatsAppWithImage } = require("./whatsapp");

const GROUP_ID = process.env.WHATSAPP_GROUP_ID;

async function main() {
  console.log("🧪 Test Facebook Marketplace — Nîmes 20km, 10-20k€\n");

  const deals = await runFacebookScraper({
    filters: { distance: 20, lat: "43.8367", lng: "4.3601" },
  });

  console.log(`\n📊 ${deals.length} annonces trouvées`);

  if (deals.length === 0) {
    console.log("Aucune annonce.");
    return;
  }

  // Print first 5
  const toSend = deals.slice(0, 5);
  for (const d of toSend) {
    console.log(`  - ${d.title} | ${d.price || "?"} | ${d.url}`);
  }

  console.log(`\n📨 Envoi de ${toSend.length} messages au groupe WhatsApp...`);

  await sendWhatsApp(
    `🧪 *TEST - Facebook Marketplace*\n\nRecherche: Nîmes 20km\n${deals.length} annonces trouvées\nVoici les 5 premières:`,
    GROUP_ID
  );
  await new Promise((r) => setTimeout(r, 2000));

  for (let i = 0; i < toSend.length; i++) {
    const deal = toSend[i];
    const lines = [`📘 *${deal.title}*`, ""];
    if (deal.price) lines.push(`💰 *${deal.price.toLocaleString("fr-FR")}*`);
    const details = [];
    if (deal.year) details.push(deal.year);
    if (deal.km) details.push(`${deal.km.toLocaleString("fr-FR")} km`);
    if (details.length) lines.push(`📅 ${details.join(" | ")}`);
    if (deal.location) lines.push(`📍 ${deal.location}`);
    lines.push("");
    if (deal.url) lines.push(`🔗 ${deal.url}`);
    lines.push("\n_Via Facebook Marketplace_");

    const msg = lines.join("\n");
    if (deal.imageUrl) {
      await sendWhatsAppWithImage(deal.imageUrl, msg, GROUP_ID);
    } else {
      await sendWhatsApp(msg, GROUP_ID);
    }
    console.log(`  ✅ ${i + 1}/5 envoyé`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n✅ Test terminé !");
}

main().catch(console.error);
