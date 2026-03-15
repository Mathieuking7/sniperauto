/**
 * One-shot script to create Stripe Products and Prices
 * Run: node stripe-setup.js
 */
require("dotenv").config();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setup() {
  console.log("Creating SniperAuto products in Stripe...\n");

  // --- Product: Essentiel ---
  const essentiel = await stripe.products.create({
    name: "SniperAuto Essentiel",
    description: "1 alerte active, scan toutes les 30 min, Auto1, WhatsApp",
  });
  console.log(`Product Essentiel: ${essentiel.id}`);

  const essentielMonthly = await stripe.prices.create({
    product: essentiel.id,
    unit_amount: 2900, // 29 EUR
    currency: "eur",
    recurring: { interval: "month" },
  });

  const essentielAnnual = await stripe.prices.create({
    product: essentiel.id,
    unit_amount: 27800, // 278 EUR (2 mois offerts)
    currency: "eur",
    recurring: { interval: "year" },
  });

  // --- Product: Pro ---
  const pro = await stripe.products.create({
    name: "SniperAuto Pro",
    description: "10 alertes, scan en direct, nouvelles sources, support prioritaire",
  });
  console.log(`Product Pro: ${pro.id}`);

  const proMonthly = await stripe.prices.create({
    product: pro.id,
    unit_amount: 4900, // 49 EUR
    currency: "eur",
    recurring: { interval: "month" },
  });

  const proAnnual = await stripe.prices.create({
    product: pro.id,
    unit_amount: 47000, // 470 EUR (2 mois offerts)
    currency: "eur",
    recurring: { interval: "year" },
  });

  // --- Setup fee products ---
  const setupEssentiel = await stripe.prices.create({
    product_data: { name: "Frais de mise en service - Essentiel" },
    unit_amount: 5000, // 50 EUR
    currency: "eur",
  });

  const setupPro = await stripe.prices.create({
    product_data: { name: "Frais de mise en service - Pro" },
    unit_amount: 2000, // 20 EUR
    currency: "eur",
  });

  console.log("\n--- Add these to your .env ---\n");
  console.log(`STRIPE_PRICE_ESSENTIEL_MONTHLY=${essentielMonthly.id}`);
  console.log(`STRIPE_PRICE_ESSENTIEL_ANNUAL=${essentielAnnual.id}`);
  console.log(`STRIPE_PRICE_PRO_MONTHLY=${proMonthly.id}`);
  console.log(`STRIPE_PRICE_PRO_ANNUAL=${proAnnual.id}`);
  console.log(`STRIPE_PRICE_SETUP_ESSENTIEL=${setupEssentiel.id}`);
  console.log(`STRIPE_PRICE_SETUP_PRO=${setupPro.id}`);
  console.log("\nDone!");
}

setup().catch(console.error);
