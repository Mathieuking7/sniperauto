/**
 * Ad Validator — Filters out irrelevant listings before WhatsApp dispatch
 * Ensures only real vehicle ads are sent (not parts, accessories, etc.)
 */

// Keywords that indicate the listing is NOT a real car
const BLACKLIST_KEYWORDS = [
  // Parts
  "boîte de vitesse", "boite de vitesse", "boîte vitesse", "boite vitesse",
  "moteur", "pare-choc", "pare choc", "parechoc",
  "capot", "aile avant", "aile arrière", "portière", "porte avant", "porte arrière",
  "rétroviseur", "retroviseur", "phare", "feu arrière", "feu avant",
  "radiateur", "alternateur", "démarreur", "demarreur",
  "turbo", "injecteur", "pompe injection", "pompe à eau",
  "embrayage", "volant moteur", "arbre de transmission", "cardan",
  "amortisseur", "ressort", "bras de suspension", "rotule",
  "étrier de frein", "disque de frein", "plaquette",
  "pot d'échappement", "catalyseur", "fap", "filtre à particule",
  "tableau de bord", "compteur", "autoradio", "gps",
  "siège", "siege", "banquette", "moquette", "tapis",
  "jante", "roue", "pneu", "enjoliveur",
  "vitre", "pare-brise", "parebrise", "lunette arrière",
  "serrure", "poignée", "neiman", "barillet",
  "faisceau", "calculateur", "ecu", "bsi",
  "réservoir", "pompe carburant",
  // Accessories
  "attelage", "barre de toit", "coffre de toit", "galerie",
  "housse", "tapis de sol", "antivol",
  // Not cars
  "moto", "scooter", "quad", "vélo", "velo", "trottinette",
  "caravane", "remorque", "bateau", "jet ski",
  "tondeuse", "tracteur",
  // Misc
  "pièce", "piece", "pièces détachées", "pieces detachees",
  "casse", "épave", "epave", "pour pièce", "pour piece",
  "lot de", "kit de",
];

// Car brands — if title contains one of these, it's more likely a real car
const CAR_BRANDS = [
  "renault", "peugeot", "citroën", "citroen", "dacia", "alpine",
  "volkswagen", "audi", "bmw", "mercedes", "opel", "seat", "skoda", "porsche", "mini",
  "toyota", "nissan", "honda", "mazda", "mitsubishi", "suzuki", "hyundai", "kia",
  "ford", "chevrolet", "jeep", "dodge", "tesla",
  "fiat", "alfa romeo", "lancia", "maserati", "ferrari", "lamborghini",
  "volvo", "saab", "jaguar", "land rover", "range rover",
  "ds", "smart", "cupra",
];

/**
 * Validate if a deal is a real vehicle ad
 * @param {Object} deal - The deal object
 * @returns {{ valid: boolean, reason: string }}
 */
function validateDeal(deal) {
  const title = (deal.title || "").toLowerCase();
  const fullText = `${deal.title || ""} ${deal.location || ""}`.toLowerCase();

  // 1. Must have a title
  if (!title || title.length < 3) {
    return { valid: false, reason: "Pas de titre" };
  }

  // 2. Check blacklist keywords
  for (const kw of BLACKLIST_KEYWORDS) {
    if (title.includes(kw)) {
      return { valid: false, reason: `Mot-clé exclu: "${kw}"` };
    }
  }

  // 3. Must have a price
  const price = deal.price_auto1 || deal.price || deal.current_bid || 0;
  if (!price || price <= 0) {
    return { valid: false, reason: "Pas de prix" };
  }

  // 4. Price sanity check — disabled, send all deals regardless of price

  // 5. Must have a valid URL
  if (!deal.url || deal.url.length < 10) {
    return { valid: false, reason: "Pas d'URL" };
  }

  // 6. URL must not be fake/placeholder
  if (deal.url.match(/\/0{5,}/) || deal.url.includes("placeholder")) {
    return { valid: false, reason: "URL invalide" };
  }

  // 7. For LeBonCoin: verify it's in the vehicles category
  if (deal.url && deal.url.includes("leboncoin.fr")) {
    if (!deal.url.includes("/voitures/") && !deal.url.includes("category=2")) {
      return { valid: false, reason: "Pas dans la catégorie voitures LeBonCoin" };
    }
  }

  // 8. Bonus confidence: has a known car brand in title
  const hasBrand = CAR_BRANDS.some((b) => title.includes(b));

  // 9. Has basic car attributes (year OR km)
  const hasYear = deal.year || title.match(/\b(19|20)\d{2}\b/);
  const hasKm = deal.km || title.match(/\d+\s*km/i);

  // If no brand AND no year AND no km, it's suspicious
  if (!hasBrand && !hasYear && !hasKm) {
    return { valid: false, reason: "Pas de marque, année ou km — probablement pas un véhicule" };
  }

  return { valid: true, reason: "OK" };
}

/**
 * Filter an array of deals, keeping only valid vehicle ads
 * @param {Array} deals - Array of deal objects
 * @param {string} source - Source name for logging
 * @returns {Array} Filtered deals
 */
function filterValidDeals(deals, source = "unknown") {
  const valid = [];
  const rejected = [];

  for (const deal of deals) {
    const result = validateDeal(deal);
    if (result.valid) {
      valid.push(deal);
    } else {
      rejected.push({ title: deal.title, reason: result.reason });
    }
  }

  if (rejected.length > 0) {
    console.log(`[Validator][${source}] ${rejected.length} annonces rejetées:`);
    for (const r of rejected) {
      console.log(`  ❌ "${r.title}" — ${r.reason}`);
    }
  }
  console.log(`[Validator][${source}] ${valid.length}/${deals.length} annonces validées`);

  return valid;
}

module.exports = { validateDeal, filterValidDeals };
