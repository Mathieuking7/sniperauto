/**
 * Test script: scrape LeBonCoin, La Centrale, Facebook Marketplace
 * Vehicles 10-20k€, 20km around Nîmes
 * Send 5 test messages to Auto1 WhatsApp group
 */
require("dotenv").config();
const { runLeboncoinScraper } = require("./bots/leboncoin");
const { runLaCentraleScraper } = require("./bots/lacentrale");
const { runFacebookScraper } = require("./bots/facebook");
const { sendWhatsApp, sendWhatsAppWithImage } = require("./whatsapp");

const GROUP_ID = process.env.WHATSAPP_GROUP_ID;
const MAX_MESSAGES = 5;

function formatMessage(deal, source) {
  const emoji = { leboncoin: "🏷️", lacentrale: "🚘", facebook: "📘" }[source] || "🚗";
  const label = { leboncoin: "LeBonCoin", lacentrale: "La Centrale", facebook: "Facebook Marketplace" }[source];

  const lines = [`${emoji} *${deal.title}*`, ""];

  if (deal.price) lines.push(`💰 *${deal.price.toLocaleString("fr-FR")}€*`);
  const details = [];
  if (deal.year) details.push(deal.year);
  if (deal.km) details.push(`${deal.km.toLocaleString("fr-FR")} km`);
  if (details.length) lines.push(`📅 ${details.join(" | ")}`);
  if (deal.fuel) lines.push(`⛽ ${deal.fuel}`);
  if (deal.location) lines.push(`📍 ${deal.location}`);
  lines.push("");
  if (deal.url) lines.push(`🔗 ${deal.url}`);
  lines.push(`\n_Via ${label}_`);

  return lines.join("\n");
}

async function testScraper(name, scraperFn, config) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Testing: ${name}`);
  console.log(`${"=".repeat(50)}`);

  try {
    const deals = await scraperFn(config);
    console.log(`✅ ${name}: ${deals.length} annonces trouvées`);
    return deals.map((d) => ({ ...d, _source: name }));
  } catch (err) {
    console.error(`❌ ${name}: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log("🚀 Test des nouveaux scrapers — 10-20k€, Nîmes 20km\n");

  const allDeals = [];

  // Test La Centrale (public, most reliable)
  const lcDeals = await testScraper("lacentrale", runLaCentraleScraper, {
    url: "https://www.lacentrale.fr/listing?makesModelsCommercialNames=&options=&page=1&priceMin=10000&priceMax=20000&sortBy=firstOnlineDateDesc",
    filters: { minPrice: 10000, maxPrice: 20000 },
  });
  allDeals.push(...lcDeals);

  // Test LeBonCoin (public)
  const lbcDeals = await testScraper("leboncoin", runLeboncoinScraper, {
    url: "https://www.leboncoin.fr/recherche?category=2&locations=N%C3%AEmes__43.8367_4.3601_20000&price=10000-20000&sort=time",
    filters: { minPrice: 10000, maxPrice: 20000 },
  });
  allDeals.push(...lbcDeals);

  // Test Facebook Marketplace (may need login)
  const fbDeals = await testScraper("facebook", runFacebookScraper, {
    filters: { minPrice: 10000, maxPrice: 20000, distance: 20, lat: "43.8367", lng: "4.3601" },
  });
  allDeals.push(...fbDeals);

  console.log(`\n📊 Total: ${allDeals.length} annonces de ${new Set(allDeals.map(d => d._source)).size} sources`);

  // Send first 5 to WhatsApp
  const toSend = allDeals.slice(0, MAX_MESSAGES);

  if (toSend.length === 0) {
    console.log("⚠️  Aucune annonce à envoyer. Les scrapers n'ont rien trouvé.");
    console.log("   Cela peut être dû à des protections anti-bot ou un changement de structure HTML.");
    return;
  }

  console.log(`\n📨 Envoi de ${toSend.length} messages au groupe WhatsApp...`);

  // Send header
  await sendWhatsApp(
    `🧪 *TEST SCRAPERS*\n\n` +
    `Recherche: 10-20k€, 20km autour de Nîmes\n` +
    `Sources: La Centrale, LeBonCoin, Facebook\n` +
    `${allDeals.length} annonces trouvées au total\n\n` +
    `Voici les ${toSend.length} premières:`,
    GROUP_ID
  );
  await new Promise((r) => setTimeout(r, 2000));

  for (let i = 0; i < toSend.length; i++) {
    const deal = toSend[i];
    const msg = formatMessage(deal, deal._source);

    if (deal.imageUrl) {
      await sendWhatsAppWithImage(deal.imageUrl, msg, GROUP_ID);
    } else {
      await sendWhatsApp(msg, GROUP_ID);
    }
    console.log(`  ✅ ${i + 1}/${toSend.length} envoyé: ${deal.title}`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n✅ Test terminé !");
}

main().catch(console.error);
