// Portal data layer — the leads CRM database (SQLite via node:sqlite).
// Ported from the standalone Leads Manager server so the whole portal runs
// inside this one Next.js app. Node runtime only.
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DB_FILE = path.join(process.cwd(), "data", "leads.db");

const g = globalThis as unknown as { __portalDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (g.__portalDb) return g.__portalDb;
  const d = new DatabaseSync(DB_FILE);
  d.exec("PRAGMA journal_mode = WAL;");
  d.exec(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY, name TEXT, description TEXT, phone TEXT, website TEXT, email TEXT, address TEXT,
    owner TEXT, owner_link TEXT, image TEXT, main_category TEXT, categories TEXT, hours TEXT, closed_on TEXT,
    competitors TEXT, keywords TEXT, link TEXT, query TEXT, rating REAL, reviews INTEGER, ads INTEGER,
    can_claim INTEGER, closed_temp INTEGER, state TEXT, state_name TEXT, city TEXT, group_name TEXT, service TEXT,
    starred INTEGER DEFAULT 0, status TEXT DEFAULT '', wa TEXT DEFAULT '', wa_checked_at INTEGER,
    tags TEXT DEFAULT '', source TEXT DEFAULT 'seed', pitched INTEGER DEFAULT 0, pitched_at INTEGER,
    created_at INTEGER, updated_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, lead_id TEXT, body TEXT, created_at INTEGER);
  CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, lead_id TEXT, kind TEXT, detail TEXT, at INTEGER);
  CREATE INDEX IF NOT EXISTS idx_notes_lead ON notes(lead_id);
  CREATE INDEX IF NOT EXISTS idx_activity_at ON activity(at);`);
  g.__portalDb = d;
  return d;
}

/* ---------- helpers ---------- */
const s = (v: unknown) => (v == null ? "" : String(v));
const b = (v: unknown) => (v ? 1 : 0);
const toInt = (v: unknown) => { const n = parseInt(String(v ?? "").replace(/[^0-9]/g, ""), 10); return isNaN(n) ? 0 : n; };
const normTxt = (v: unknown) => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const phoneDigits = (v: unknown) => String(v || "").replace(/\D/g, "");
const normWeb = (v: unknown) => normTxt(String(v || "").replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, ""));
function hashStr(str: string) { let h = 5381, i = str.length; while (i) h = (h * 33) ^ str.charCodeAt(--i); return (h >>> 0).toString(36); }

export function leadKeys(d: any): string[] {
  const keys: string[] = [];
  const id = d.id || d.place_id || "";
  if (id && !/^lead-/.test(id) && !/^imp:/.test(id) && id.length > 6) keys.push("id:" + id);
  const n = normTxt(d.name);
  if (n) {
    const p = phoneDigits(d.phone), a = normTxt(d.address), w = normWeb(d.website);
    if (p.length >= 7) keys.push("np:" + n + "|" + p.slice(-10));
    if (a) keys.push("na:" + n + "|" + a);
    if (w) keys.push("nw:" + n + "|" + w);
    if (p.length < 7 && !a && !w) keys.push("n:" + n);
  }
  return keys;
}
function leadId(d: any) {
  const pid = d.id || d.place_id || "";
  if (pid && pid.length > 6 && !/^lead-/.test(pid)) return pid;
  return "imp:" + hashStr(normTxt(d.name) + "|" + phoneDigits(d.phone) + "|" + normTxt(d.address) + "|" + normTxt(d.city));
}

export function rowToLead(r: any) {
  if (!r) return null;
  return {
    id: r.id, name: r.name, description: r.description, phone: r.phone, website: r.website, email: r.email || "",
    address: r.address, owner: r.owner, owner_link: r.owner_link, image: r.image,
    main_category: r.main_category, categories: r.categories, hours: r.hours, closed_on: r.closed_on,
    competitors: r.competitors, keywords: r.keywords, link: r.link, query: r.query,
    rating: r.rating == null ? null : r.rating, reviews: r.reviews || 0,
    ads: !!r.ads, can_claim: !!r.can_claim, closed_temp: !!r.closed_temp,
    state: r.state, state_name: r.state_name, city: r.city, group: r.group_name, service: r.service,
    starred: !!r.starred, status: r.status || "", wa: r.wa || "", wa_checkedAt: r.wa_checked_at || 0,
    pitched: !!r.pitched, pitched_at: r.pitched_at || 0,
    tags: r.tags ? r.tags.split(",").filter(Boolean) : [],
    source: r.source, created_at: r.created_at, updated_at: r.updated_at,
  };
}

const INSERT_SQL = `INSERT OR IGNORE INTO leads
 (id,name,description,phone,website,email,address,owner,owner_link,image,main_category,categories,hours,closed_on,
  competitors,keywords,link,query,rating,reviews,ads,can_claim,closed_temp,state,state_name,city,group_name,service,
  starred,status,wa,wa_checked_at,tags,source,created_at,updated_at)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

export function insertLead(d: any, source?: string) {
  const now = Date.now();
  const id = leadId(d);
  db().prepare(INSERT_SQL).run(
    id, s(d.name), s(d.description), s(d.phone), s(d.website), s(d.email), s(d.address), s(d.owner), s(d.owner_link), s(d.image),
    s(d.main_category), s(d.categories), s(d.hours), s(d.closed_on), s(d.competitors), s(d.keywords), s(d.link), s(d.query),
    d.rating == null || d.rating === "" ? null : Number(d.rating), toInt(d.reviews),
    b(d.ads), b(d.can_claim), b(d.closed_temp), s(d.state), s(d.state_name), s(d.city), s(d.group), s(d.service),
    b(d.starred), s(d.status), s(d.wa), d.wa_checkedAt || null, Array.isArray(d.tags) ? d.tags.join(",") : s(d.tags),
    source || "import", now, now
  );
  return id;
}

export function logActivity(leadId: string, kind: string, detail?: string) {
  db().prepare("INSERT INTO activity (lead_id,kind,detail,at) VALUES (?,?,?,?)").run(leadId, kind, detail || "", Date.now());
}

export function allLeads() {
  const rows = db().prepare("SELECT * FROM leads").all();
  const leads = rows.map(rowToLead) as any[];
  const notesByLead: Record<string, any[]> = {};
  db().prepare("SELECT id,lead_id,body,created_at FROM notes ORDER BY created_at ASC").all().forEach((n: any) => {
    (notesByLead[n.lead_id] = notesByLead[n.lead_id] || []).push({ id: n.id, body: n.body, at: n.created_at });
  });
  leads.forEach((l) => { l.notes = notesByLead[l.id] || []; });
  return leads;
}
export function getLead(id: string) {
  const l = rowToLead(db().prepare("SELECT * FROM leads WHERE id=?").get(id)) as any;
  if (!l) return null;
  l.notes = db().prepare("SELECT id,body,created_at FROM notes WHERE lead_id=? ORDER BY created_at ASC").all(id)
    .map((n: any) => ({ id: n.id, body: n.body, at: n.created_at }));
  return l;
}

const PATCHABLE: Record<string, 1> = { starred: 1, status: 1, wa: 1, wa_checkedAt: 1, tags: 1, pitched: 1, pitched_at: 1, phone: 1, website: 1, email: 1, name: 1, address: 1, owner: 1, main_category: 1, hours: 1 };
export function patchLead(id: string, patch: any) {
  if (!db().prepare("SELECT id FROM leads WHERE id=?").get(id)) return null;
  const sets: string[] = [], vals: any[] = [];
  for (const k in patch) {
    if (!Object.prototype.hasOwnProperty.call(PATCHABLE, k)) continue;
    let col = k, v = patch[k];
    if (k === "starred") v = v ? 1 : 0;
    else if (k === "pitched") v = v ? 1 : 0;
    else if (k === "pitched_at") v = v || null;
    else if (k === "wa_checkedAt") { col = "wa_checked_at"; v = v || null; }
    else if (k === "tags") v = Array.isArray(v) ? v.join(",") : String(v || "");
    else v = v == null ? "" : String(v);
    sets.push(col + "=?"); vals.push(v);
  }
  if (!sets.length) return getLead(id);
  sets.push("updated_at=?"); vals.push(Date.now()); vals.push(id);
  db().prepare("UPDATE leads SET " + sets.join(",") + " WHERE id=?").run(...vals);
  if ("status" in patch) logActivity(id, "status", patch.status || "cleared");
  if ("wa" in patch) logActivity(id, "wa", patch.wa || "cleared");
  if ("starred" in patch) logActivity(id, "star", patch.starred ? "marked" : "unmarked");
  if ("pitched" in patch) logActivity(id, "pitch", patch.pitched ? "pitched on WhatsApp" : "unmarked pitch");
  return getLead(id);
}

let noteSeq = 0;
export function addNote(leadId: string, body: string) {
  if (!db().prepare("SELECT 1 FROM leads WHERE id=?").get(leadId)) return null;
  const id = "note:" + Date.now().toString(36) + "-" + (noteSeq++).toString(36) + "-" + hashStr(leadId + body).slice(0, 4);
  const at = Date.now();
  db().prepare("INSERT INTO notes (id,lead_id,body,created_at) VALUES (?,?,?,?)").run(id, leadId, String(body || ""), at);
  logActivity(leadId, "note", String(body || "").slice(0, 60));
  return { id, body: String(body || ""), at };
}
export function deleteNote(noteId: string) {
  const n = db().prepare("SELECT lead_id FROM notes WHERE id=?").get(noteId);
  db().prepare("DELETE FROM notes WHERE id=?").run(noteId);
  return !!n;
}

export function bulkInsert(leads: any[]) {
  const seen = new Set<string>();
  db().prepare("SELECT id,name,phone,address,website FROM leads").all().forEach((r: any) => leadKeys(r).forEach((k) => seen.add(k)));
  let added = 0, dupes = 0;
  db().exec("BEGIN");
  for (const d of leads) {
    const keys = leadKeys(d);
    if (keys.some((k) => seen.has(k))) { dupes++; continue; }
    keys.forEach((k) => seen.add(k));
    insertLead(d, "import"); added++;
  }
  db().exec("COMMIT");
  return { added, dupes };
}

export function count() { return (db().prepare("SELECT COUNT(*) c FROM leads").get() as any).c; }
export function deleteImported() { const info = db().prepare("DELETE FROM leads WHERE source='import'").run(); return { removed: info.changes, total: count() }; }
export function recentActivity(limit = 40) {
  return db().prepare("SELECT a.*, l.name FROM activity a LEFT JOIN leads l ON l.id=a.lead_id ORDER BY a.at DESC LIMIT ?").all(limit);
}

/* ---------- WhatsApp results ---------- */
export function waDigits(p: unknown) { let d = phoneDigits(p); if (d.length === 10) d = "1" + d; return d; }
function normalizeWa(v: any) {
  if (v === true) return "yes"; if (v === false) return "no";
  const t = String(v == null ? "" : v).trim().toLowerCase().replace(/\s+/g, "");
  if (/^(yes|y|1|true|has|haswhatsapp|onwhatsapp|whatsappavailable|registered|valid|active|available|on)$/.test(t)) return "yes";
  if (/^(no|n|0|false|not|notavailable|whatsappnotavailable|unavailable|nowhatsapp|unregistered|invalid|inactive|off)$/.test(t)) return "no";
  return "";
}
export function applyWaResults(results: any[]) {
  const byPhone: Record<string, string> = {}, byId: Record<string, boolean> = {};
  db().prepare("SELECT id,phone FROM leads").all().forEach((r: any) => { byId[r.id] = true; if (r.phone) { const k = waDigits(r.phone); if (!byPhone[k]) byPhone[k] = r.id; } });
  let n = 0; const now = Date.now(); const done = new Set<string>();
  db().exec("BEGIN");
  for (const r of results) {
    const wa = normalizeWa(r.wa !== undefined ? r.wa : (r.hasWhatsapp !== undefined ? r.hasWhatsapp : r.whatsapp));
    if (wa !== "yes" && wa !== "no") continue;
    const id = (r.id && byId[r.id]) ? r.id : ((r.phone || r.number) ? byPhone[waDigits(r.phone || r.number)] : null);
    if (!id || done.has(id)) continue;
    done.add(id);
    db().prepare("UPDATE leads SET wa=?, wa_checked_at=?, updated_at=? WHERE id=?").run(wa, r.checkedAt || now, now, id);
    n++;
  }
  db().exec("COMMIT");
  return n;
}
function parseCsvWa(text: string) {
  text = String(text).replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const parseLine = (line: string) => { const out: string[] = []; let cur = "", q = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; } else { if (c === '"') q = true; else if (c === ",") { out.push(cur); cur = ""; } else cur += c; } } out.push(cur); return out; };
  const header = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const iId = header.indexOf("id");
  const iPhone = header.findIndex((h) => h === "phone" || h === "phone number" || h === "number");
  const iWa = header.findIndex((h) => h === "whatsapp" || h === "wa" || h === "whatsapp_status" || h === "status");
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) { const c = parseLine(lines[i]); rows.push({ id: iId >= 0 ? c[iId] : undefined, phone: iPhone >= 0 ? c[iPhone] : undefined, wa: iWa >= 0 ? c[iWa] : undefined }); }
  return rows;
}
export function loadWaFromDisk() {
  const dir = path.join(process.cwd(), "wa-checker");
  let results: any[] = [];
  try { const j = JSON.parse(fs.readFileSync(path.join(dir, "wa-results.json"), "utf8")); if (Array.isArray(j.results)) results = j.results; } catch { /* */ }
  try { const csv = parseCsvWa(fs.readFileSync(path.join(dir, "wa-results.csv"), "utf8")); if (csv.length) results = results.concat(csv); } catch { /* */ }
  if (!results.length) return 0;
  return applyWaResults(results);
}

/* ---------- collect: map scraped row -> lead ---------- */
export function mapScraped(row: any, city: string, query: string) {
  return {
    name: row.name || "", description: row.description || "", phone: row.phone || "",
    website: row.website || "", email: row.email || "", address: row.address || "",
    main_category: row.main_category || "", categories: row.main_category || "",
    hours: row.hours || "", link: row.link || "", city, query, service: query,
    rating: row.rating === "" || row.rating == null ? null : row.rating, reviews: row.reviews || 0,
  };
}
