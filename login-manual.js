/**
 * Script de connexion manuelle à Auto1.
 * Lance un navigateur visible pour que tu puisses te connecter.
 * Les cookies seront sauvegardés dans auth-state/ pour le scraper automatique.
 *
 * Usage: node login-manual.js
 */
const { chromium } = require("playwright");
const path = require("path");

const AUTH_DIR = path.join(__dirname, "auth-state");

async function main() {
  console.log("Ouverture du navigateur...");
  console.log("Connecte-toi à Auto1, puis ferme le navigateur.");
  console.log("");

  const browser = await chromium.launchPersistentContext(AUTH_DIR, {
    headless: false,
    viewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto("https://www.auto1.com/fr/app/login");

  // Wait until user closes the browser
  await new Promise((resolve) => {
    browser.on("close", resolve);
  });

  console.log("Session sauvegardée dans auth-state/");
  console.log("Tu peux maintenant lancer: node index.js");
}

main().catch(console.error);
