// Collect (Google Maps scan) — job manager + single search + multi-city pipeline.
// Runs the Playwright scraper in the Node runtime; pushes results into the DB.
import path from "node:path";
import fs from "node:fs";
import { bulkInsert, mapScraped } from "./db";
import { startWaBackground } from "./wa";

type Job = {
  id: string; kind: "single" | "pipeline"; label: string; state: string; phase: string;
  log: string[]; results: any[]; citiesTotal: number; cityIndex: number; currentCity: string;
  perCity: { city: string; count: number }[]; pushed: number; waStatus: string;
  jsonPath: string | null; csvPath: string | null; stop: boolean;
};

const g = globalThis as unknown as { __collectJobs?: Map<string, Job> };
const jobs = () => (g.__collectJobs ||= new Map<string, Job>());

const EXPORT_DIR = path.join(process.cwd(), "portal-exports");
try { fs.mkdirSync(EXPORT_DIR, { recursive: true }); } catch { /* */ }

function clampInt(v: any, def: number, min: number, max: number) { let n = parseInt(v, 10); if (isNaN(n)) n = def; return Math.max(min, Math.min(n, max)); }
function newJob(kind: Job["kind"], label: string): Job {
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);
  const job: Job = { id, kind, label, state: "running", phase: "Starting…", log: [], results: [], citiesTotal: 0, cityIndex: 0, currentCity: "", perCity: [], pushed: 0, waStatus: "", jsonPath: null, csvPath: null, stop: false };
  jobs().set(id, job); return job;
}
const jlog = (j: Job, m: string) => { j.log.push(m); if (j.log.length > 1200) j.log.splice(0, 300); };
const pub = (r: any) => { const o: any = {}; for (const k in r) if (!k.startsWith("_")) o[k] = r[k]; return o; };

function saveExport(rows: any[], label: string) {
  const clean = rows.map(pub);
  const safe = String(label).replace(/[^a-z0-9]+/gi, "_").slice(0, 50);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const base = path.join(EXPORT_DIR, safe + "_" + stamp);
  fs.writeFileSync(base + ".json", JSON.stringify(clean, null, 2));
  let csvPath: string | null = null;
  if (clean.length) {
    const cols = Object.keys(clean[0]);
    const esc = (v: any) => { v = String(v == null ? "" : v).replace(/"/g, '""'); return /[",\n]/.test(v) ? '"' + v + '"' : v; };
    const lines = [cols.join(",")];
    clean.forEach((r) => lines.push(cols.map((c) => esc(r[c])).join(",")));
    csvPath = base + ".csv"; fs.writeFileSync(csvPath, "﻿" + lines.join("\n"));
  }
  return { jsonPath: base + ".json", csvPath };
}

async function getScrape() {
  const mod: any = await import("./scraper.js");
  return mod.scrape || mod.default?.scrape || mod.default;
}

async function runScrape(job: Job, opts: any) {
  try {
    job.phase = "Scraping Google Maps";
    const scrape = await getScrape();
    const rows = await scrape({ query: opts.query, maxResults: opts.maxResults, headless: opts.headless, crawlContacts: opts.crawlContacts, onLog: (m: string) => jlog(job, m), onResult: (r: any) => job.results.push(r), shouldStop: () => job.stop });
    const ex = saveExport(rows, opts.query); job.jsonPath = ex.jsonPath; job.csvPath = ex.csvPath;
    // Single searches now save to the database too, so found leads always land in All Leads.
    if (opts.pushDb && rows.length) {
      const r = bulkInsert(rows.map((x: any) => mapScraped(x, "", opts.query)));
      job.pushed += r.added; jlog(job, `-> DB: +${r.added} new, ${r.dupes} dupes`);
    }
    job.phase = "Completed"; job.state = job.stop ? "stopped" : "done";
  } catch (e) { job.state = "error"; job.phase = "Error"; jlog(job, "ERROR: " + ((e as any)?.message || e)); }
}

async function runPipeline(job: Job, opts: any, baseUrl: string) {
  try {
    job.citiesTotal = opts.cities.length;
    const scrape = await getScrape();
    const all: any[] = [];
    for (let idx = 0; idx < opts.cities.length; idx++) {
      if (job.stop) { jlog(job, "Stop requested — halting pipeline."); break; }
      const city = opts.cities[idx];
      job.cityIndex = idx + 1; job.currentCity = city; job.phase = `Scraping ${idx + 1}/${opts.cities.length}: ${city}`;
      jlog(job, `-- City ${idx + 1}/${opts.cities.length}: ${opts.query} in ${city}`);
      const before = all.length;
      const rows = await scrape({ query: `${opts.query} in ${city}`, maxResults: opts.maxResults, headless: true, crawlContacts: opts.crawlContacts, onLog: (m: string) => jlog(job, m), onResult: (r: any) => { all.push(r); job.results.push(r); }, shouldStop: () => job.stop });
      job.perCity.push({ city, count: all.length - before });
      if (opts.pushDb && rows.length) { const r = bulkInsert(rows.map((x: any) => mapScraped(x, city, opts.query))); job.pushed += r.added; jlog(job, `   -> DB: +${r.added} new, ${r.dupes} dupes`); }
    }
    const ex = saveExport(all, `${opts.query}_${opts.cities.length}cities`); job.jsonPath = ex.jsonPath; job.csvPath = ex.csvPath;
    if (opts.runWa && !job.stop && all.length) { job.state = "whatsapp"; job.phase = "Checking WhatsApp numbers"; const r = startWaBackground(baseUrl); if (r.started) { job.waStatus = "running"; jlog(job, "WhatsApp check started in the background."); } }
    job.phase = "Completed"; job.state = job.stop ? "stopped" : "done";
    jlog(job, `Pipeline finished — ${all.length} leads, ${job.pushed} new in database.`);
  } catch (e) { job.state = "error"; job.phase = "Error"; jlog(job, "ERROR: " + ((e as any)?.message || e)); }
}

export function startSingle(body: any) {
  const query = String(body.query || "").trim();
  if (!query) return { error: "Please enter a keyword and area." };
  const job = newJob("single", query);
  runScrape(job, { query, maxResults: clampInt(body.max_results, 40, 1, 500), headless: body.headless !== false, crawlContacts: body.crawl_contacts !== false, enrich: !!body.enrich, pushDb: body.push_db !== false });
  return { job_id: job.id };
}
export function startPipeline(body: any, baseUrl: string) {
  const query = String(body.query || "").trim();
  const cities = String(body.cities || "").split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  if (!query) return { error: "Please enter a query/category." };
  if (!cities.length) return { error: "Please enter at least one city." };
  const job = newJob("pipeline", query + " · " + cities.length + " cities");
  runPipeline(job, { query, cities, maxResults: clampInt(body.max_results, 60, 1, 500), crawlContacts: body.crawl_contacts !== false, pushDb: body.push_db !== false, runWa: !!body.run_wa }, baseUrl);
  return { job_id: job.id, cities: cities.length };
}
export function stopJob(id: string) { const j = jobs().get(id); if (j) j.stop = true; return { ok: !!j }; }
export function jobFile(id: string, fmt: string) { const j = jobs().get(id); return j && (fmt === "csv" ? j.csvPath : j.jsonPath); }
export function collectStatus(id: string) {
  const j = jobs().get(id); if (!j) return null;
  const rs = j.results;
  const withEmail = rs.filter((r) => r.email).length, withPhone = rs.filter((r) => r.phone).length, withSite = rs.filter((r) => r.website).length;
  const rates = rs.map((r) => parseFloat(r.rating)).filter((x) => !isNaN(x));
  const avg = rates.length ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10 : 0;
  return { id: j.id, kind: j.kind, state: j.state, phase: j.phase, count: rs.length, with_email: withEmail, with_phone: withPhone, with_site: withSite, avg_rating: avg, pushed: j.pushed, cities_total: j.citiesTotal, city_index: j.cityIndex, current_city: j.currentCity, per_city: j.perCity, wa_status: j.waStatus, log: j.log.slice(-45), results: rs.slice(-300).map(pub), has_csv: !!j.csvPath, has_json: !!j.jsonPath };
}
