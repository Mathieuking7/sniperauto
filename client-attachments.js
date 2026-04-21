/**
 * Generates PDF + CSV attachments for client setup admin email.
 * Uses playwright chromium (already installed) to render PDF from HTML.
 */
const { chromium } = require("playwright");

function escapeCsv(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsv(d) {
  const join = (arr) => Array.isArray(arr) ? arr.join(" | ") : (arr || "");
  const rows = [
    ["Champ", "Valeur"],
    ["Prénom", d.firstName || ""],
    ["Nom", d.lastName || ""],
    ["Téléphone WhatsApp", d.phone || ""],
    ["Email", d.email || ""],
    ["Type de profil", d.sellerType || ""],
    ["Ville", d.city || ""],
    ["Rayon (km)", d.radius || ""],
    ["Prix min (€)", d.minPrice ?? ""],
    ["Prix max (€)", d.maxPrice ?? ""],
    ["Km min", d.minKm ?? ""],
    ["Km max", d.maxKm ?? ""],
    ["Année min", d.minYear || ""],
    ["Année max", d.maxYear || ""],
    ["Types véhicule", join(d.vehicleType)],
    ["Carburant", join(d.fuel)],
    ["Boîte de vitesses", d.gearbox || ""],
    ["Nombre de portes", d.numDoors || ""],
    ["Puissance min (CV)", d.minCv || ""],
    ["Puissance max (CV)", d.maxCv || ""],
    ["Plateformes", join(d.platforms)],
    ["Villes Enchères VO", join(d.evoCities)],
    ["Marques préférées", join(d.preferredBrands)],
    ["Marques exclues", join(d.excludedBrands)],
    ["Mots-clés inclus", join(d.keywords)],
    ["Mots-clés exclus", join(d.excludeKeywords)],
    ["Couleurs", join(d.colors)],
    ["Options", join(d.options)],
    ["1ère main", d.firstOwner ? "Oui" : "Non"],
    ["Sans accident", d.noAccident ? "Oui" : "Non"],
    ["CT valide", d.ctValid ? "Oui" : "Non"],
    ["Zéro défaut", d.zeroDefects ? "Oui" : "Non"],
    ["Note min Auto1", d.minAutoScore || ""],
    ["Notes", d.notes || ""],
    ["Date de soumission", new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })],
  ];
  // BOM for Excel UTF-8 compatibility
  return "\uFEFF" + rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
}

function buildPdfHtml(d) {
  const join = (arr) => Array.isArray(arr) ? arr.join(", ") : (arr || "—");
  const yesNo = (v) => v ? "Oui" : "Non";
  const row = (label, value) => `<tr><td class="lbl">${label}</td><td>${value || "—"}</td></tr>`;
  const qualityFlags = [
    d.firstOwner && "1ère main",
    d.noAccident && "Sans accident",
    d.ctValid && "CT valide",
    d.zeroDefects && "Zéro défaut",
  ].filter(Boolean).join(" · ") || "—";

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 40px; font-size: 12px; }
  h1 { font-size: 22px; margin: 0 0 4px; color: #007AFF; }
  h2 { font-size: 14px; margin: 24px 0 10px; color: #007AFF; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #007AFF; padding-bottom: 4px; }
  .sub { color: #666; font-size: 12px; margin: 0 0 20px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  td.lbl { color: #666; width: 38%; }
  .header-box { background: #007AFF; color: white; padding: 18px 22px; border-radius: 10px; margin-bottom: 16px; }
  .header-box h1 { color: white; font-size: 20px; margin: 0; }
  .header-box p { margin: 4px 0 0; opacity: 0.85; font-size: 12px; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee; color: #999; font-size: 10px; text-align: center; }
  .warn { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; padding: 10px 14px; border-radius: 8px; margin-top: 14px; font-weight: 600; text-align: center; }
</style></head><body>
  <div class="header-box">
    <h1>SniperAuto — Fiche client</h1>
    <p>Nouveau client à activer — ${d.firstName || ""} ${d.lastName || ""}</p>
  </div>

  <h2>Identité</h2>
  <table>
    ${row("Prénom", d.firstName)}
    ${row("Nom", d.lastName)}
    ${row("Téléphone WhatsApp", d.phone)}
    ${row("Email", d.email)}
    ${row("Type de profil", d.sellerType)}
  </table>

  <h2>Zone & Budget</h2>
  <table>
    ${row("Ville de référence", d.city)}
    ${row("Rayon", d.radius ? `${d.radius} km` : "")}
    ${row("Prix", `${d.minPrice || 0} → ${d.maxPrice || "—"} €`)}
    ${row("Kilométrage", `${d.minKm || 0} → ${d.maxKm || "—"} km`)}
    ${row("Année", `${d.minYear || "—"} → ${d.maxYear || "—"}`)}
  </table>

  <h2>Véhicule</h2>
  <table>
    ${row("Types", join(d.vehicleType))}
    ${row("Carburant", join(d.fuel))}
    ${row("Boîte de vitesses", d.gearbox)}
    ${row("Nombre de portes", d.numDoors)}
    ${row("Puissance", (d.minCv || d.maxCv) ? `${d.minCv || 0} → ${d.maxCv || "—"} CV` : "")}
    ${row("Couleurs", join(d.colors))}
    ${row("Options", join(d.options))}
  </table>

  <h2>Vendeur & Qualité</h2>
  <table>
    ${row("Type de vendeur", d.sellerType)}
    ${row("Critères qualité", qualityFlags)}
    ${row("Note min Auto1", d.minAutoScore)}
  </table>

  <h2>Sources & Marques</h2>
  <table>
    ${row("Plateformes", join(d.platforms))}
    ${row("Villes Enchères VO", join(d.evoCities))}
    ${row("Marques préférées", join(d.preferredBrands))}
    ${row("Marques exclues", join(d.excludedBrands))}
    ${row("Mots-clés inclus", join(d.keywords))}
    ${row("Mots-clés exclus", join(d.excludeKeywords))}
  </table>

  ${d.notes ? `<h2>Notes</h2><p style="background:#f5f5f7;padding:12px;border-radius:8px;white-space:pre-wrap;">${d.notes}</p>` : ""}

  <div class="warn">À activer sous 24h — contacter le client sur WhatsApp</div>

  <div class="footer">Généré le ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} · SniperAuto</div>
</body></html>`;
}

async function generatePdfBuffer(data) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(buildPdfHtml(data), { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "12mm", right: "12mm" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

async function generateClientAttachments(data) {
  const safeName = `${data.firstName || "client"}-${data.lastName || ""}`
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "client";
  const date = new Date().toISOString().slice(0, 10);
  const pdfBuffer = await generatePdfBuffer(data);
  const csvString = buildCsv(data);
  return [
    {
      filename: `sniperauto-${safeName}-${date}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    },
    {
      filename: `sniperauto-${safeName}-${date}.csv`,
      content: Buffer.from(csvString, "utf-8"),
      contentType: "text/csv",
    },
  ];
}

module.exports = { generateClientAttachments, buildCsv, buildPdfHtml };
