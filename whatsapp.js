require("dotenv").config();

const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID;
const API_TOKEN = process.env.GREEN_API_TOKEN;
const GROUP_ID = process.env.WHATSAPP_GROUP_ID;
const API_URL = "https://7107.api.greenapi.com";

function getChatId() {
  return GROUP_ID || `${process.env.WHATSAPP_PHONE}@c.us`;
}

async function sendWhatsApp(message) {
  if (!INSTANCE_ID || !API_TOKEN) {
    console.log("[WhatsApp] Config manquante, message en console:");
    console.log(message);
    return false;
  }

  const url = `${API_URL}/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId: getChatId(), message }),
  });

  if (!res.ok) {
    console.error(`[WhatsApp] Erreur ${res.status}: ${await res.text()}`);
    return false;
  }
  console.log("[WhatsApp] Message envoyé");
  return true;
}

async function sendWhatsAppWithImage(imageUrl, caption) {
  if (!INSTANCE_ID || !API_TOKEN) {
    console.log("[WhatsApp] Config manquante, message en console:");
    console.log(caption);
    return false;
  }

  const url = `${API_URL}/waInstance${INSTANCE_ID}/sendFileByUrl/${API_TOKEN}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatId: getChatId(),
      urlFile: imageUrl,
      fileName: "car.jpg",
      caption,
    }),
  });

  if (!res.ok) {
    console.error(`[WhatsApp] Erreur image ${res.status}: ${await res.text()}`);
    return sendWhatsApp(caption);
  }
  console.log("[WhatsApp] Message avec image envoyé");
  return true;
}

function formatDealMessage(deal) {
  const lines = [`*${deal.title}*`, ""];

  // Prix
  if (deal.current_bid && deal.price_auto1) {
    lines.push(`Prix: *${deal.current_bid}€* (au lieu de ${deal.price_auto1}€)`);
    if (deal.savings) lines.push(`Economie: ${deal.savings}€`);
  } else if (deal.price_auto1) {
    lines.push(`Prix: *${deal.price_auto1}€*`);
  }

  lines.push("");

  // Details - only add if we have real data
  const details = [];
  if (deal.year) details.push(`${deal.year}`);
  if (deal.km) details.push(`${deal.km.toLocaleString()} km`);
  if (details.length > 0) lines.push(details.join(" | "));

  if (deal.fuel) lines.push(`${deal.fuel}`);
  if (deal.power) lines.push(`${deal.power}`);
  if (deal.location) lines.push(`${deal.location}`);

  lines.push("");
  lines.push(`https://www.auto1.com/fr/app/merchant/car/${deal.id}`);

  return lines.join("\n");
}

function formatDailyReport(deals, totalScanned) {
  const now = new Date().toLocaleDateString("fr-FR");
  const lines = [
    `*RAPPORT AUTO1 - ${now}*`,
    "",
    `Vehicules scannés: ${totalScanned}`,
    `Essai routier OK + < 1000€: *${deals.length}*`,
    "",
  ];

  if (deals.length === 0) {
    lines.push("Aucun deal aujourd'hui.");
  } else {
    lines.push("*Meilleurs deals:*");
    lines.push("");
    deals.slice(0, 10).forEach((deal, i) => {
      const price = deal.current_bid || deal.price_auto1 || "?";
      const info = [deal.year, deal.km ? `${deal.km.toLocaleString()}km` : null]
        .filter(Boolean)
        .join(", ");
      lines.push(`${i + 1}. *${deal.title}* - ${price}€${info ? ` (${info})` : ""}`);
    });
  }

  return lines.join("\n");
}

module.exports = { sendWhatsApp, sendWhatsAppWithImage, formatDealMessage, formatDailyReport };
