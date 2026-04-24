#!/usr/bin/env node
/**
 * Seed the 6 reservation pages.
 * Edit RESERVATIONS below, then run: node seed-reservations.js
 */
require("dotenv").config();
const Database = require("better-sqlite3");
const path = require("path");
const { createReservationsTable, upsertReservation } = require("./db");

// ── EDIT ME ──────────────────────────────────────────────────────────────────
const RESERVATIONS = [
  { slug: "cwauto83",           email: "cwauto83@gmail.com",               firstName: "CW Auto"    },
  { slug: "tlcmotors33",        email: "tlcmotors33@gmail.com",            firstName: "TLC Motors" },
  { slug: "robsmotorss",        email: "robsmotorss@gmail.com",            firstName: "Rob"        },
  { slug: "lleroy273",          email: "L.leroy273@gmail.com",             firstName: "L. Leroy"   },
  { slug: "guillaumeponton",    email: "guillaume.ponton@gmail.com",       firstName: "Guillaume"  },
  { slug: "rodolfofreitas2002", email: "rodolfofreitas2002@hotmail.com",   firstName: "Rodolfo"    },
];
const DURATION_HOURS = 48;
const BASE_URL = process.env.BASE_URL || "https://sniperauto.fr";
// ─────────────────────────────────────────────────────────────────────────────

const db = new Database(path.join(__dirname, "auto1.db"));
db.pragma("journal_mode = WAL");

createReservationsTable(db);

const deadline = Date.now() + DURATION_HOURS * 3600 * 1000;
const deadlineDate = new Date(deadline);

for (const r of RESERVATIONS) {
  upsertReservation(db, { ...r, deadline });
}

const pad = (n) => String(n).padStart(2, "0");
const deadlineStr = `${deadlineDate.toLocaleDateString("fr-FR")} à ${pad(deadlineDate.getHours())}h${pad(deadlineDate.getMinutes())} (heure locale)`;

console.log(`\n✅ ${RESERVATIONS.length} réservations créées`);
console.log(`⏰ Deadline : ${deadlineStr}\n`);
console.log("Liens à envoyer :\n");

for (const r of RESERVATIONS) {
  const padEmail = r.email.padEnd(42);
  console.log(`  ${padEmail} → ${BASE_URL}/r/${r.slug}`);
}

console.log("\nDone.\n");
db.close();
