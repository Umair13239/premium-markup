/*
 * wa-checker — auto-detect which lead numbers are on WhatsApp.
 *
 * Reads numbers from:
 *   1) wa-numbers.json in this folder  (exported from the dashboard → Import page), or
 *   2) ../data.js  (the built-in leads) as a fallback.
 *
 * Writes results to wa-results.json in this folder (incremental + resumable).
 * Import that file back into the dashboard (drop it on the Import drop zone).
 *
 * Config via environment variables:
 *   DELAY_MS=2500   delay between checks (ms). Higher = safer. Default 2500.
 *   LIMIT=100       only check this many un-checked numbers this run (0 = all). Default 0.
 *
 *   e.g.  DELAY_MS=4000 LIMIT=150 npm start     (mac/linux)
 *         set "DELAY_MS=4000" && set "LIMIT=150" && npm start     (Windows cmd)
 *         $env:DELAY_MS=4000; $env:LIMIT=150; npm start           (PowerShell)
 *
 * ⚠  Checking many numbers from a personal WhatsApp account can get it temporarily
 *    limited or banned. Go slow, check in batches, and use at your own risk.
 */
'use strict';

const fs = require('fs');
const path = require('path');

let Client, LocalAuth, qrcode;
try {
  const wweb = require('whatsapp-web.js');
  Client = wweb.Client;
  LocalAuth = wweb.LocalAuth;
  qrcode = require('qrcode-terminal');
} catch (e) {
  console.error('\nDependencies not installed. Run this first, inside the wa-checker folder:\n\n    npm install\n');
  process.exit(1);
}

/* ─── EASY SETTINGS — edit these two numbers if you like ─────────────────
 *  SECONDS_BETWEEN_CHECKS : how long to wait between each number (seconds).
 *                           Higher = slower & safer for your account.
 *  MAX_PER_RUN            : only check this many numbers each run (0 = all).
 *  (Environment variables DELAY_MS / LIMIT still override these if set.)
 * ───────────────────────────────────────────────────────────────────── */
const SECONDS_BETWEEN_CHECKS = 8;
const MAX_PER_RUN = 0;

const http = require('http');

const HERE = __dirname;
const NUMBERS_FILE = path.join(HERE, 'wa-numbers.json');
const RESULTS_FILE = path.join(HERE, 'wa-results.json');
const RESULTS_CSV = path.join(HERE, 'wa-results.csv');
// If the database server is running, the checker reads numbers from it and posts results back.
const API_BASE = process.env.API || 'http://localhost:3000';

function apiRequest(method, urlPath, body) {
  return new Promise(function (resolve, reject) {
    let u;
    try { u = new URL(API_BASE + urlPath); } catch (e) { return reject(e); }
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({ hostname: u.hostname, port: u.port || 80, path: u.pathname, method: method, headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {} },
      function (res) { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch (e) { resolve({}); } }); });
    req.on('error', reject);
    req.setTimeout(2500, function () { req.destroy(new Error('timeout')); });
    if (data) req.write(data);
    req.end();
  });
}
const DELAY = Math.max(500, parseInt(process.env.DELAY_MS || '', 10) || SECONDS_BETWEEN_CHECKS * 1000);
const LIMIT = parseInt(process.env.LIMIT || '', 10) || MAX_PER_RUN;

function label(wa) { return wa === 'yes' ? 'WhatsApp Available' : wa === 'no' ? 'Not Available' : 'Error'; }

function digits(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (d.length === 10) d = '1' + d; // assume US if no country code
  return d;
}

let USING_API = false;
function loadNumbersFromApi() {
  return apiRequest('GET', '/api/wa/numbers').then(function (j) {
    if (j && Array.isArray(j.numbers) && j.numbers.length) { USING_API = true; return j.numbers.map(function (x) { return { id: x.id || '', name: x.name || '', phone: x.phone || '' }; }); }
    return null;
  }).catch(function () { return null; });
}
function loadNumbers() {
  if (fs.existsSync(NUMBERS_FILE)) {
    const j = JSON.parse(fs.readFileSync(NUMBERS_FILE, 'utf8'));
    const arr = Array.isArray(j) ? j : (j.numbers || []);
    return arr
      .map(function (x) { return { id: x.id || '', name: x.name || '', phone: x.phone || x.number || '' }; })
      .filter(function (x) { return x.phone; });
  }
  const dataPath = path.join(HERE, '..', 'data.js');
  if (fs.existsSync(dataPath)) {
    console.log('wa-numbers.json not found — falling back to ../data.js (built-in leads only).');
    const code = fs.readFileSync(dataPath, 'utf8');
    const win = {};
    // eslint-disable-next-line no-new-func
    new Function('window', code)(win);
    const L = win.LEADS || [];
    return L.filter(function (d) { return d.phone; }).map(function (d) { return { id: d.id, name: d.name, phone: d.phone }; });
  }
  return [];
}

function loadResults() {
  if (fs.existsSync(RESULTS_FILE)) {
    try {
      const j = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
      const map = {};
      (j.results || []).forEach(function (r) { map[r.id || digits(r.phone)] = r; });
      return map;
    } catch (e) { /* ignore corrupt file */ }
  }
  return {};
}

function saveResults(map) {
  const results = Object.keys(map).map(function (k) { return map[k]; });
  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ type: 'whatsapp-results', updatedAt: Date.now(), results: results }, null, 1));
  // human-readable CSV you can open in Excel
  const esc = function (v) { v = String(v == null ? '' : v).replace(/"/g, '""'); return /[",\n]/.test(v) ? '"' + v + '"' : v; };
  const lines = ['name,phone,whatsapp,checked_at'];
  results.forEach(function (r) {
    lines.push([esc(r.name || ''), esc(r.phone || ''), esc(label(r.wa)), esc(r.checkedAt ? new Date(r.checkedAt).toISOString() : '')].join(','));
  });
  fs.writeFileSync(RESULTS_CSV, '﻿' + lines.join('\n'));
}

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function pushResultsToApi(map) {
  if (!USING_API) return Promise.resolve();
  const results = Object.keys(map).map(function (k) { return map[k]; });
  return apiRequest('POST', '/api/wa/results', { results: results }).catch(function () {});
}

(async function main() {
  let numbers = await loadNumbersFromApi();
  if (numbers) console.log('Loaded ' + numbers.length + ' numbers from the running database server.');
  if (!numbers) numbers = loadNumbers();
  if (!numbers.length) {
    console.error('\nNo numbers found.\nStart the database server (npm start in the main folder), OR export "wa-numbers.json"\nfrom the dashboard (WhatsApp Check → Export numbers) and put it in this folder.\n');
    process.exit(1);
  }

  const map = loadResults();
  const todo = numbers.filter(function (n) { return !map[n.id || digits(n.phone)]; });
  const batch = LIMIT > 0 ? todo.slice(0, LIMIT) : todo;

  console.log('\n────────────────────────────────────────────');
  console.log(' WhatsApp checker');
  console.log('────────────────────────────────────────────');
  console.log(' Total numbers : ' + numbers.length);
  console.log(' Already done  : ' + (numbers.length - todo.length));
  console.log(' To check now  : ' + batch.length + (LIMIT > 0 ? ' (LIMIT=' + LIMIT + ')' : ''));
  console.log(' Delay/number  : ' + DELAY + ' ms');
  console.log('────────────────────────────────────────────');
  console.log(' ⚠  Bulk checks from a personal number can get it temporarily limited.');
  console.log('    Go slow (raise DELAY_MS) and check in batches (LIMIT).');
  console.log('────────────────────────────────────────────\n');

  if (!batch.length) {
    console.log('Everything already checked. Import wa-results.json into the dashboard.\n');
    process.exit(0);
  }

  // Headless whatsapp-web.js often stalls with no output. Default to a VISIBLE
  // Chrome window so you can see the QR / loading. Set WA_HEADLESS=1 to hide it.
  const WA_HEADLESS = process.env.WA_HEADLESS === '1';
  console.log(WA_HEADLESS
    ? 'Connecting to WhatsApp (hidden window)...'
    : 'Opening WhatsApp - a Chrome window will appear shortly.\n  * If it shows a QR code, scan it: phone WhatsApp -> Settings -> Linked devices -> Link a device.\n  * If already linked, just wait while it loads.');
  console.log('First connection can take 20-60 seconds. Please wait...\n');

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(HERE, '.wwebjs_auth') }),
    puppeteer: { headless: WA_HEADLESS, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  });

  client.on('qr', function (qr) {
    console.log('\nScan this QR with WhatsApp on your phone (Settings -> Linked devices -> Link a device):\n');
    qrcode.generate(qr, { small: true });
  });
  client.on('loading_screen', function (percent, message) { console.log('Loading WhatsApp... ' + (percent || '') + '% ' + (message || '')); });
  client.on('change_state', function (s) { console.log('Connection state: ' + s); });
  client.on('authenticated', function () { console.log('\nAuthenticated - you will not need the QR next time.\n'); });
  client.on('auth_failure', function (m) { console.error('Auth failure:', m); process.exit(1); });
  client.on('disconnected', function (r) { console.error('Disconnected:', r); });

  client.on('ready', async function () {
    console.log('WhatsApp ready ✓  starting checks...\n');
    let n = 0, yes = 0, no = 0, err = 0;
    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      const key = item.id || digits(item.phone);
      const num = digits(item.phone);
      let wa = 'no';
      try {
        const numberId = await client.getNumberId(num);
        wa = numberId ? 'yes' : 'no';
      } catch (e) {
        wa = 'error';
      }
      if (wa === 'yes') yes++; else if (wa === 'no') no++; else err++;
      if (wa === 'yes' || wa === 'no') {
        map[key] = { id: item.id || '', name: item.name || '', phone: item.phone, wa: wa, status: label(wa), checkedAt: Date.now() };
        saveResults(map); // save after every check so progress is never lost
        // push to the live database every 10 results so the dashboard fills in as it runs
        if (USING_API && n % 10 === 0) pushResultsToApi(map);
      }
      n++;
      const mark = wa === 'yes' ? '✅ WhatsApp Available' : wa === 'no' ? '❌ Not Available' : '⚠ error (will retry next run)';
      const wait = (i < batch.length - 1) ? '   …waiting ' + Math.round(DELAY / 1000) + 's' : '';
      console.log('[' + n + '/' + batch.length + '] ' + (item.name || item.phone) + '  →  ' + mark + wait);
      if (i < batch.length - 1) await sleep(DELAY + Math.floor(Math.random() * DELAY * 0.4));
    }
    await pushResultsToApi(map);
    console.log('\n────────────────────────────────────────────');
    console.log(' Done.  ✅ ' + yes + ' on WhatsApp   ❌ ' + no + ' not' + (err ? '   ⚠ ' + err + ' errors' : ''));
    if (USING_API) console.log(' Results sent to the database — refresh the dashboard to see them.');
    else { console.log(' Saved to wa-results.json'); console.log(' → In the dashboard, go to WhatsApp Check → Load results file → pick wa-results.json.'); }
    console.log('────────────────────────────────────────────\n');
    try { await client.destroy(); } catch (e) { /* noop */ }
    process.exit(0);
  });

  client.initialize().catch(function (e) {
    console.error('\nCould not start WhatsApp: ' + (e && e.message || e));
    console.error('Fixes to try:');
    console.error('  1. Close this window, delete the ".wwebjs_cache" folder in wa-checker, and run again.');
    console.error('  2. Make sure Google Chrome is installed and up to date.');
    process.exit(1);
  });
})();
