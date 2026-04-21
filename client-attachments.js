/**
 * Generates PDF + CSV attachments for client setup admin email.
 * Uses pdfkit (pure Node.js, no browser required).
 */
const PDFDocument = require("pdfkit");

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
  return "\uFEFF" + rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
}

function generatePdfBuffer(d) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const join = (arr) => Array.isArray(arr) ? arr.join(", ") : (arr || "—");
    const val = (v) => (v !== null && v !== undefined && v !== "") ? String(v) : "—";

    const BLUE = "#007AFF";
    const DARK = "#1a1a1a";
    const GREY = "#666666";
    const W = 515;

    // Header box
    doc.rect(40, 40, W, 60).fill(BLUE);
    doc.fillColor("white").fontSize(18).font("Helvetica-Bold")
      .text("SniperAuto — Fiche client", 55, 55);
    doc.fontSize(11).font("Helvetica")
      .text(`Nouveau client à activer — ${d.firstName || ""} ${d.lastName || ""}`, 55, 78);

    doc.moveDown(3.5);

    function section(title) {
      doc.fillColor(BLUE).fontSize(11).font("Helvetica-Bold").text(title.toUpperCase());
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(BLUE).lineWidth(1.5).stroke();
      doc.moveDown(0.4);
    }

    function row(label, value) {
      const y = doc.y;
      doc.fillColor(GREY).fontSize(10).font("Helvetica").text(label, 40, y, { width: 180 });
      doc.fillColor(DARK).fontSize(10).font("Helvetica").text(val(value), 230, y, { width: 325 });
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#eeeeee").lineWidth(0.5).stroke();
      doc.moveDown(0.35);
    }

    // Identité
    section("Identité");
    row("Prénom", d.firstName);
    row("Nom", d.lastName);
    row("Téléphone WhatsApp", d.phone);
    row("Email", d.email);
    row("Type de profil", d.sellerType);
    doc.moveDown(0.8);

    // Zone & Budget
    section("Zone & Budget");
    row("Ville de référence", d.city);
    row("Rayon", d.radius ? `${d.radius} km` : "");
    row("Budget", `${d.minPrice || 0} → ${d.maxPrice || "—"} €`);
    row("Kilométrage", `${d.minKm || 0} → ${d.maxKm || "—"} km`);
    row("Année", `${d.minYear || "—"} → ${d.maxYear || "—"}`);
    doc.moveDown(0.8);

    // Véhicule
    section("Véhicule");
    row("Types", join(d.vehicleType));
    row("Carburant", join(d.fuel));
    row("Boîte de vitesses", d.gearbox);
    row("Nombre de portes", d.numDoors);
    row("Puissance", (d.minCv || d.maxCv) ? `${d.minCv || 0} → ${d.maxCv || "—"} CV` : "");
    row("Couleurs", join(d.colors));
    row("Options", join(d.options));
    doc.moveDown(0.8);

    // Qualité
    const qualityFlags = [
      d.firstOwner && "1ère main",
      d.noAccident && "Sans accident",
      d.ctValid && "CT valide",
      d.zeroDefects && "Zéro défaut",
    ].filter(Boolean).join(" · ") || "—";
    section("Vendeur & Qualité");
    row("Type de vendeur", d.sellerType);
    row("Critères qualité", qualityFlags);
    row("Note min Auto1", d.minAutoScore);
    doc.moveDown(0.8);

    // Sources & Marques
    section("Sources & Marques");
    row("Plateformes", join(d.platforms));
    row("Villes Enchères VO", join(d.evoCities));
    row("Marques préférées", join(d.preferredBrands));
    row("Marques exclues", join(d.excludedBrands));
    row("Mots-clés inclus", join(d.keywords));
    row("Mots-clés exclus", join(d.excludeKeywords));
    doc.moveDown(0.8);

    // Notes
    if (d.notes) {
      section("Notes");
      doc.fillColor(DARK).fontSize(10).font("Helvetica").text(d.notes, { width: W });
      doc.moveDown(0.8);
    }

    // Warning banner
    doc.moveDown(0.5);
    const warnY = doc.y;
    doc.rect(40, warnY, W, 30).fill("#fffbeb");
    doc.fillColor("#92400e").fontSize(10).font("Helvetica-Bold")
      .text("À activer sous 24h — contacter le client sur WhatsApp", 40, warnY + 9, { align: "center", width: W });

    // Footer
    doc.moveDown(3);
    doc.fillColor(GREY).fontSize(9).font("Helvetica")
      .text(`Généré le ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} · SniperAuto`, { align: "center" });

    doc.end();
  });
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

module.exports = { generateClientAttachments, buildCsv };
