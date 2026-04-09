/**
 * Test script: scrape 5 Aramis preview cars and send to WhatsApp ARAMIS group
 */
const { chromium } = require("playwright");
const path = require("path");
require("dotenv").config();

const { sendWhatsApp, sendWhatsAppWithImage } = require("./whatsapp");

const AUTH_DIR = path.join(__dirname, "auth-state-aramis");
const ARAMIS_GROUP = process.env.WHATSAPP_GROUP_ID; // Temporairement envoyer au groupe Auto1

async function login(page) {
  console.log("[Aramis] Connexion...");
  await page.goto("https://pro.aramisauto.com/login", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // Check if already logged in (redirected away from login)
  if (!page.url().includes("/login")) {
    console.log("[Aramis] Déjà connecté");
    return true;
  }

  const email = process.env.ARAMIS_EMAIL;
  const password = process.env.ARAMIS_PASSWORD;

  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', email);
  await page.fill('#password', password);
  await page.click('input[type="submit"], #_submit');

  await page.waitForTimeout(5000);

  if (!page.url().includes("/login")) {
    console.log("[Aramis] Connecté !");
    return true;
  }
  console.error("[Aramis] Échec connexion");
  return false;
}

async function scrapePreviewList(page) {
  console.log("[Aramis] Navigation vers /preview...");
  await page.goto("https://pro.aramisauto.com/preview", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(5000);

  // Debug: log current URL and page title
  console.log("[Aramis] URL:", page.url());
  const title = await page.title();
  console.log("[Aramis] Title:", title);

  // Get all car links from preview page
  const cars = await page.evaluate(() => {
    const results = [];

    // Find all links to /car/preview/
    const links = document.querySelectorAll('a[href*="/car/preview/"]');
    const seen = new Set();

    for (const link of links) {
      const href = link.getAttribute("href");
      if (seen.has(href)) continue;
      seen.add(href);

      // Go up to find the card/row container
      let container = link.closest("li") || link.closest("tr") || link.closest('[class*="card"]') || link.parentElement?.parentElement;
      const text = container ? container.textContent : link.textContent;

      // Extract title from link text or nearby heading
      let titleText = link.textContent.replace(/\s+/g, " ").trim();
      if (!titleText || titleText.length < 3) {
        const heading = container ? container.querySelector("h2, h3, h4, strong, [class*='title'], [class*='name']") : null;
        titleText = heading ? heading.textContent.replace(/\s+/g, " ").trim() : "";
      }
      // Try to build title from brand/model in text
      if (!titleText || titleText.length < 3) {
        const brandMatch = text.match(/(NISSAN|PEUGEOT|RENAULT|CITROEN|CITROËN|FORD|VOLVO|AUDI|BMW|MERCEDES|VOLKSWAGEN|DACIA|TOYOTA|FIAT|OPEL|SEAT|SKODA|HYUNDAI|KIA|MINI|SUZUKI|MAZDA|HONDA|LAND ROVER|JEEP|DS|PORSCHE|ALFA ROMEO|SMART|MITSUBISHI|LEXUS|JAGUAR|INFINITI|CUPRA|MG)\s+([A-Z0-9\s]+)/i);
        titleText = brandMatch ? brandMatch[0].trim() : "Véhicule";
      }

      // Extract km
      const kmMatch = text.match(/([\d\s.]+)\s*KM/i);
      const km = kmMatch ? parseInt(kmMatch[1].replace(/[\s.]/g, "")) : null;

      // Extract year (format MM/YYYY)
      const yearMatch = text.match(/(\d{2}\/\d{4})/);
      const year = yearMatch ? yearMatch[1] : null;

      // Extract fuel
      const fuelMatch = text.match(/(Diesel|Essence|Hybride|Électrique|GPL)/i);
      const fuel = fuelMatch ? fuelMatch[1] : null;

      // Extract gearbox
      const gearboxMatch = text.match(/(Boîte manuelle|Boîte automatique|Automate sequentiel|Séquentielle)/i);
      const gearbox = gearboxMatch ? gearboxMatch[1] : null;

      // Extract location
      const locMatch = text.match(/(Melun parc|TRC DONZERE|Beaucaire Parc|TRC Nemours|[A-Z][a-z]+ parc)/i);
      const location = locMatch ? locMatch[1] : null;

      // Extract sale date/time (e.g. "18 mars - 15:00")
      const dateMatch = text.match(/(\d{1,2}\s+\w+\s*-\s*\d{2}:\d{2})/);
      const saleDate = dateMatch ? dateMatch[1] : null;

      // Extract price (might need login)
      const priceMatch = text.match(/(\d[\d\s.,]*)\s*€/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/[\s.,]/g, "")) : null;

      // Image
      const img = container ? container.querySelector("img[src]") : null;
      const imageUrl = img ? img.src : null;

      results.push({
        href,
        title: titleText,
        km,
        year,
        fuel,
        gearbox,
        location,
        saleDate,
        price,
        imageUrl,
      });
    }

    return results;
  });

  console.log(`[Aramis] ${cars.length} voitures preview trouvées`);
  return cars;
}

async function scrapeCarDetail(page, carHref) {
  const fullUrl = carHref.startsWith("http")
    ? carHref
    : `https://pro.aramisauto.com${carHref}`;

  console.log(`[Aramis] Détail: ${fullUrl}`);
  await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(3000);

  const detail = await page.evaluate(() => {
    const text = document.body.innerText;

    // Points forts
    let pointsForts = [];
    const pfSection = text.match(/Points?\s+forts?\s*[:\n]([\s\S]*?)(?:Commentaire|Détails|Description|$)/i);
    if (pfSection) {
      pointsForts = pfSection[1]
        .split("\n")
        .map((l) => l.replace(/^[\s*•-]+/, "").trim())
        .filter((l) => l.length > 2 && l.length < 100);
    }

    // Commentaire expert - extract the quoted expert text only
    let commentaire = "";
    // Match the quoted block that starts with " and contains ETAT sections
    const quotedMatch = text.match(/"([^"]*ETAT\s+CARROSSERIE[^"]*)"/);
    if (quotedMatch) {
      commentaire = quotedMatch[1].replace(/\s+/g, " ").trim();
    } else {
      // Fallback: extract from ETAT CARROSSERIE up to Mise en circulation or Kilométrage
      const etatMatch = text.match(/((?:\*\*.*?\*\*\s*)?ETAT\s+CARROSSERIE[\s\S]*?)(?:Mise en circulation|Kilométrage|IDENTIFICATION)/i);
      if (etatMatch) {
        commentaire = etatMatch[1].replace(/\s+/g, " ").trim();
      }
    }
    // Clean up: remove trailing technical data
    commentaire = commentaire.replace(/\s*Mise en circulation[\s\S]*$/, "").trim();

    // Extract title: Marque + Modèle + Variante
    let title = "";
    const marqueMatch = text.match(/Marque\s+([A-Z\s]+?)(?:\n|Modèle)/);
    const modeleMatch = text.match(/Modèle\s+(.+?)(?:\n|Variante)/);
    const varianteMatch = text.match(/Variante\s+(.+?)(?:\n|Moteur)/);
    if (marqueMatch) title = marqueMatch[1].trim();
    if (modeleMatch) title += " " + modeleMatch[1].trim();
    if (varianteMatch) title += " " + varianteMatch[1].trim();
    title = title.trim();

    // Price (might be visible after login)
    const priceMatch = text.match(/(\d[\d\s.,]*)\s*€/);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/[\s.,]/g, "")) : null;

    // Get main image
    const img = document.querySelector('img[src*="aramisauto"], img[src*="cdn-cgi"]');
    const imageUrl = img ? img.src : null;

    return { pointsForts, commentaire, price, imageUrl, title };
  });

  return detail;
}

function formatAramisMessage(car, detail) {
  const lines = [];
  const title = detail.title || car.title || "Véhicule";
  lines.push(`🏎️ *${title}*`);
  lines.push("");

  // Date de vente
  if (car.saleDate) {
    lines.push(`📅 *Vente: ${car.saleDate}*`);
    lines.push("");
  }

  // Prix
  const price = detail.price || car.price;
  if (price) {
    lines.push(`💰 *${price.toLocaleString("fr-FR")}€*`);
  }

  // Infos techniques
  const infos = [];
  if (car.km) infos.push(`${car.km.toLocaleString("fr-FR")} km`);
  if (car.year) infos.push(car.year);
  if (car.fuel) infos.push(car.fuel);
  if (car.gearbox) infos.push(car.gearbox);
  if (infos.length > 0) lines.push(`📋 ${infos.join(" | ")}`);

  if (car.location) lines.push(`📍 ${car.location}`);

  // Points forts
  if (detail.pointsForts && detail.pointsForts.length > 0) {
    lines.push("");
    lines.push("*Les points forts*");
    for (const pf of detail.pointsForts) {
      lines.push(`✅ ${pf}`);
    }
  }

  // Commentaire expert
  if (detail.commentaire) {
    lines.push("");
    lines.push("*Commentaire de l'expert*");
    lines.push(`"${detail.commentaire}"`);
  }

  // Lien vers l'annonce
  if (car.href) {
    const link = car.href.startsWith("http") ? car.href : `https://pro.aramisauto.com${car.href}`;
    lines.push("");
    lines.push(`🔗 ${link}`);
  }

  lines.push("");
  lines.push("_Via Aramis Pro - Preview_");

  return lines.join("\n");
}

async function main() {
  console.log("=== TEST ARAMIS PREVIEW - 5 messages ===\n");
  console.log("Groupe WhatsApp ARAMIS:", ARAMIS_GROUP);

  const browser = await chromium.launchPersistentContext(AUTH_DIR, {
    headless: true,
    viewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  try {
    const loggedIn = await login(page);
    if (!loggedIn) {
      throw new Error("Connexion échouée");
    }

    // Scrape preview list
    const cars = await scrapePreviewList(page);
    if (cars.length === 0) {
      console.log("[Aramis] Aucune voiture trouvée, debug page...");
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
      console.log("[Debug] Page content:", bodyText);
      return;
    }

    // Take first 5
    const sample = cars.slice(0, 5);
    console.log(`\n[Aramis] Envoi de ${sample.length} messages au groupe ARAMIS...\n`);

    for (let i = 0; i < sample.length; i++) {
      const car = sample[i];
      console.log(`\n--- Voiture ${i + 1}/${sample.length}: ${car.title} ---`);

      // Get detail page for points forts + commentaire expert
      const detail = await scrapeCarDetail(page, car.href);

      const msg = formatAramisMessage(car, detail);
      console.log("\nMessage:\n" + msg + "\n");

      // Send to ARAMIS group
      const imgUrl = detail.imageUrl || car.imageUrl;
      if (imgUrl) {
        await sendWhatsAppWithImage(imgUrl, msg, ARAMIS_GROUP);
      } else {
        await sendWhatsApp(msg, ARAMIS_GROUP);
      }

      console.log(`✅ Message ${i + 1} envoyé`);

      // Wait 2s between messages
      if (i < sample.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    console.log("\n=== DONE: 5 messages envoyés au groupe ARAMIS ===");
  } catch (err) {
    console.error("[Aramis] Erreur:", err.message);
  } finally {
    await browser.close();
  }
}

main();
