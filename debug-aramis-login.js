const { chromium } = require("playwright");
const path = require("path");
require("dotenv").config();

const AUTH_DIR = path.join(__dirname, "auth-state-aramis");

async function main() {
  const browser = await chromium.launchPersistentContext(AUTH_DIR, {
    headless: true,
    viewport: { width: 1400, height: 900 },
  });

  const page = await browser.newPage();

  console.log("Navigating to login...");
  await page.goto("https://pro.aramisauto.com/login", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  console.log("URL:", page.url());
  console.log("Title:", await page.title());

  // Screenshot for debug
  await page.screenshot({ path: path.join(__dirname, "aramis-login-debug.png") });
  console.log("Screenshot saved: aramis-login-debug.png");

  // Get all input fields
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("input")).map((i) => ({
      type: i.type,
      name: i.name,
      id: i.id,
      placeholder: i.placeholder,
      className: i.className.substring(0, 100),
    }));
  });
  console.log("Inputs:", JSON.stringify(inputs, null, 2));

  // Get all buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, [type='submit'], a.btn")).map((b) => ({
      type: b.type || b.tagName,
      text: b.textContent.trim().substring(0, 50),
      className: b.className.substring(0, 100),
    }));
  });
  console.log("Buttons:", JSON.stringify(buttons, null, 2));

  // Get page text (first 1500 chars)
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log("\nPage text:\n", bodyText);

  // Try to fill and submit
  const email = process.env.ARAMIS_EMAIL;
  const password = process.env.ARAMIS_PASSWORD;
  console.log(`\nUsing: ${email} / ${password}`);

  // Try filling
  try {
    await page.fill('input[type="email"]', email);
    console.log("Email filled");
  } catch (e) {
    console.log("No email input, trying alternatives...");
    try {
      await page.fill('input[name="email"]', email);
      console.log("Filled by name=email");
    } catch (e2) {
      try {
        const firstInput = await page.$("input:first-of-type");
        if (firstInput) { await firstInput.fill(email); console.log("Filled first input"); }
      } catch (e3) {
        console.log("Cannot find email field:", e3.message);
      }
    }
  }

  try {
    await page.fill('input[type="password"]', password);
    console.log("Password filled");
  } catch (e) {
    console.log("No password field:", e.message);
  }

  // Click submit
  try {
    await page.click('button[type="submit"]');
    console.log("Clicked submit");
  } catch (e) {
    console.log("No submit button:", e.message);
    // Try clicking any button
    try {
      const btns = await page.$$("button");
      for (const btn of btns) {
        const txt = await btn.textContent();
        if (txt.match(/connexion|connect|login|sign|entr/i)) {
          await btn.click();
          console.log("Clicked:", txt.trim());
          break;
        }
      }
    } catch (e2) {
      console.log("No matching button");
    }
  }

  await page.waitForTimeout(5000);
  console.log("\nAfter submit URL:", page.url());
  await page.screenshot({ path: path.join(__dirname, "aramis-after-login.png") });
  console.log("Screenshot saved: aramis-after-login.png");

  const afterText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log("After page text:", afterText);

  await browser.close();
}

main().catch(console.error);
