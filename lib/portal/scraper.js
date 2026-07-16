/*
 * scraper.js — Google Maps business scraper (Playwright for Node).
 *
 * For a "keyword + area" query it opens Google Maps, scrolls the results feed to
 * collect every business, visits each for ~20 fields, then follows the business
 * website to harvest emails + social profiles.
 *
 * Node port of the original Python scraper, so the whole app is one project.
 */
'use strict';

const { chromium } = require('playwright');

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SOCIALS = {
  linkedin: /https?:\/\/([a-z]+\.)?linkedin\.com\/[^\s"'<>]+/i,
  facebook: /https?:\/\/([a-z]+\.)?facebook\.com\/[^\s"'<>]+/i,
  instagram: /https?:\/\/([a-z]+\.)?instagram\.com\/[^\s"'<>]+/i,
  twitter: /https?:\/\/([a-z]+\.)?(twitter|x)\.com\/[^\s"'<>]+/i,
  youtube: /https?:\/\/([a-z]+\.)?youtube\.com\/[^\s"'<>]+/i,
};
const EMAIL_BLOCK = ['sentry', 'example.', '@2x', '.png', '.jpg', '.gif', '.webp',
  'wixpress', '@sentry', 'domain.com', 'email.com', 'yourdomain'];

const sleep = ms => new Promise(r => setTimeout(r, ms));

function clean(s) {
  if (!s) return '';
  let out = '';
  for (const ch of s) { const c = ch.codePointAt(0); if (!(c >= 0xE000 && c <= 0xF8FF)) out += ch; }
  return out.replace(/\s+/g, ' ').trim();
}
async function text(page, sel) {
  try { const el = await page.$(sel); if (el) return clean(await el.innerText()); } catch (e) {}
  return '';
}
async function attr(page, sel, name) {
  try { const el = await page.$(sel); if (el) return clean((await el.getAttribute(name)) || ''); } catch (e) {}
  return '';
}
function coordsFromUrl(url) {
  let m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return [m[1], m[2]];
  m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return [m[1], m[2]];
  return ['', ''];
}
const goodEmail = e => { e = e.toLowerCase(); return !EMAIL_BLOCK.some(b => e.includes(b)); };

async function crawlWebsite(context, url) {
  const out = { email: '', socials: {}, snippet: '' };
  if (!url || !/^https?:/.test(url)) return out;
  const page = await context.newPage();
  const emails = new Set(); const socials = {}; let snippet = '';
  async function harvest() {
    const html = (await page.content()) || '';
    (html.match(EMAIL_RE) || []).forEach(e => { if (goodEmail(e)) emails.add(e); });
    for (const [name, re] of Object.entries(SOCIALS)) {
      if (!socials[name]) { const m = html.match(re); if (m) socials[name] = m[0].replace(/["'/)]+$/, ''); }
    }
    for (const a of await page.$$("a[href^='mailto:']")) {
      const href = ((await a.getAttribute('href')) || '').slice(7).split('?')[0];
      if (href && goodEmail(href)) emails.add(href);
    }
    if (!snippet) { try { snippet = clean(await page.innerText('body')).slice(0, 1600); } catch (e) {} }
  }
  try {
    await page.goto(url, { timeout: 22000, waitUntil: 'domcontentloaded' });
    await sleep(1000);
    await harvest();
    if (!emails.size) {
      for (const kw of ['contact', 'about']) {
        const link = await page.$(`a[href*='${kw}']`);
        if (link) {
          let href = (await link.getAttribute('href')) || '';
          if (href) {
            try {
              if (href.startsWith('/')) href = new URL(href, url).href;
              await page.goto(href, { timeout: 18000, waitUntil: 'domcontentloaded' });
              await sleep(800); await harvest(); break;
            } catch (e) {}
          }
        }
      }
    }
  } catch (e) {} finally { try { await page.close(); } catch (e) {} }
  out.email = emails.size ? [...emails].sort()[0] : '';
  out.socials = socials; out.snippet = snippet;
  return out;
}

async function extractPlace(page, url) {
  const p = { link: url };
  p.name = (await text(page, 'h1.DUwDvf')) || (await text(page, 'h1'));
  p.rating = await text(page, "div.F7nice span[aria-hidden='true']");
  const rev = await attr(page, "div.F7nice span[aria-label*='review']", 'aria-label');
  const m = rev.match(/([\d,]+)/); p.reviews = m ? m[1].replace(/,/g, '') : '';
  p.main_category = await text(page, 'button.DkEaL');
  p.address = (await attr(page, "button[data-item-id='address']", 'aria-label')).replace('Address: ', '');
  p.phone = (await attr(page, "button[data-item-id^='phone']", 'aria-label')).replace('Phone: ', '');
  p.website = await attr(page, "a[data-item-id='authority']", 'href');
  p.plus_code = (await attr(page, "button[data-item-id='oloc']", 'aria-label')).replace('Plus code: ', '');
  p.price_range = await text(page, "span[aria-label*='Price']");
  p.description = (await text(page, 'div.PYvSYb')) || (await text(page, 'div.WeS02d'));
  const hours = await text(page, "div[jsaction*='openhours']");
  p.hours = hours;
  const low = hours.toLowerCase();
  p.status = low.includes('closed') ? 'Closed' : (low.includes('open') ? 'Open' : '');
  const [lat, lng] = coordsFromUrl(page.url());
  p.latitude = lat; p.longitude = lng;
  return p;
}

async function collectPlaceLinks(page, maxResults, log) {
  const links = []; const seen = new Set(); const feed = "div[role='feed']";
  try { await page.waitForSelector(feed, { timeout: 15000 }); }
  catch (e) {
    if (page.url().includes('/maps/place/')) return [page.url()];
    log('No results feed appeared — Google may have returned nothing.'); return [];
  }
  let stale = 0;
  while (links.length < maxResults && stale < 6) {
    for (const a of await page.$$(`${feed} a[href*='/maps/place/']`)) {
      const href = await a.getAttribute('href');
      if (href && !seen.has(href)) { seen.add(href); links.push(href); }
    }
    log(`Discovered ${links.length} businesses…`);
    if (links.length >= maxResults) break;
    const before = links.length;
    try { await page.$eval(feed, el => el.scrollBy(0, el.scrollHeight)); } catch (e) {}
    await sleep(2000);
    if (((await page.content()) || '').includes("You've reached the end of the list.")) {
      log("Reached the end of Google's result list."); break;
    }
    stale = links.length === before ? stale + 1 : 0;
  }
  return links.slice(0, maxResults);
}

/**
 * scrape(opts) -> Promise<Array<lead>>
 * opts: { query, maxResults=40, headless=true, crawlContacts=true,
 *         onLog(msg), onResult(lead), shouldStop()=>bool }
 */
async function scrape(opts) {
  const { query, maxResults = 40, headless = true, crawlContacts = true } = opts;
  const log = opts.onLog || (() => {});
  const onResult = opts.onResult || (() => {});
  const shouldStop = opts.shouldStop || (() => false);
  const results = [];
  const searchUrl = 'https://www.google.com/maps/search/' + query.replace(/ /g, '+');

  const browser = await chromium.launch({ headless });
  try {
    const ctx = await browser.newContext({
      locale: 'en-US', viewport: { width: 1280, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    });
    const page = await ctx.newPage();
    log(`Opening Google Maps for: ${query}`);
    await page.goto(searchUrl, { timeout: 60000 });

    for (const lbl of ['Accept all', 'Reject all', 'I agree']) {
      try { const b = page.locator(`button:has-text("${lbl}")`).first(); if (await b.count()) { await b.click(); await sleep(1500); break; } } catch (e) {}
    }

    const linksList = await collectPlaceLinks(page, maxResults, log);
    log(`Collected ${linksList.length} businesses. Extracting details…`);

    for (let i = 0; i < linksList.length; i++) {
      if (shouldStop()) { log('Stop requested — finishing early.'); break; }
      const url = linksList[i];
      try {
        await page.goto(url, { timeout: 45000 });
        await page.waitForSelector('h1', { timeout: 15000 });
        await sleep(900);
        const place = await extractPlace(page, url);
        if (crawlContacts && place.website) {
          try {
            const info = await crawlWebsite(ctx, place.website);
            place.email = info.email;
            place.linkedin = info.socials.linkedin || '';
            place.facebook = info.socials.facebook || '';
            place.instagram = info.socials.instagram || '';
            place.twitter = info.socials.twitter || '';
            place.youtube = info.socials.youtube || '';
            place._siteSnippet = info.snippet;
          } catch (e) {}
        }
        results.push(place); onResult(place);
        log(`[${i + 1}/${linksList.length}] ${place.name || 'Unknown'}${place.email ? '  (email)' : ''}`);
      } catch (e) {
        log(`[${i + 1}/${linksList.length}] Skipped (${e.name || 'error'}).`);
      }
      await sleep(700);
    }
  } finally { try { await browser.close(); } catch (e) {} }
  log(`Scraping done — ${results.length} businesses extracted.`);
  return results;
}

module.exports = { scrape };
