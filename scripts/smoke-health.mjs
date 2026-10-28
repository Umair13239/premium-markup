#!/usr/bin/env node
// Smoke test for Website Health (PRODUCTS-PLAN.md §10). Exits 1 on any failure.
//   node scripts/smoke-health.mjs [portal] [site]
//   defaults: http://localhost:3000 and http://localhost:3001
// Each run uses 2 of the day's guest checks on the portal it points at.
import { chromium } from "playwright";

const PORTAL = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const SITE = (process.argv[3] || "http://localhost:3001").replace(/\/$/, "");
let failed = 0;
const ok = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); if (!cond) failed++; };

// API
const bad = await fetch(`${PORTAL}/api/tools/check?site=nope`).then((r) => r.json());
ok("API rejects a bad address", /example\.com/.test(bad.error || ""));
const usage = await fetch(`${PORTAL}/api/tools/usage?product=health`).then((r) => r.json());
ok("usage endpoint answers", typeof usage.left === "number", `${usage.left}/${usage.limit} left`);
const cors = await fetch(`${PORTAL}/api/tools/check?site=nope`, { headers: { Origin: "https://premiummarkup.com" } });
ok("API allows the website origin", cors.headers.get("access-control-allow-origin") === "https://premiummarkup.com");

const browser = await chromium.launch();
const errors = [];
try {
  // the app
  const app = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  app.on("pageerror", (e) => errors.push("app: " + e.message));
  await app.goto(`${PORTAL}/health`, { waitUntil: "networkidle" });
  ok("app loads with the shell header", await app.locator("#tsProdBtn").isVisible());
  await app.fill("#hxSite", "example.com"); await app.click("#hxGo");
  await app.waitForSelector("#hxOut:not([hidden]) .hx-scores", { timeout: 60000 });
  ok("app shows a report", (await app.locator(".hx-card").count()) === 4);
  ok("app meter updates", /left today/.test((await app.textContent("#tsMeter")) || ""));

  // the product page and its on-page check
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  page.on("pageerror", (e) => errors.push("page: " + e.message));
  await page.goto(`${SITE}/products/website-health`, { waitUntil: "networkidle" });
  ok("product page has one H1", (await page.locator("h1").count()) === 1);
  const ld = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(" "));
  ok("structured data present", /SoftwareApplication/.test(ld) && /FAQPage/.test(ld));
  ok("every image has alt text", (await page.locator("img:not([alt])").count()) === 0);
  await page.fill("#try input", "example.com"); await page.click("#try button");
  await page.waitForSelector(".ht-done, .ht-err", { timeout: 60000 });
  ok("on-page check returns scores", (await page.locator(".ht-done .ht-score").count()) === 3);
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  mob.on("pageerror", (e) => errors.push("mobile: " + e.message));
  await mob.goto(`${SITE}/products/website-health`, { waitUntil: "networkidle" });
  ok("no sideways scroll on mobile", (await mob.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
} finally {
  await browser.close();
}
ok("no page errors", errors.length === 0, errors.join(" | "));
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
