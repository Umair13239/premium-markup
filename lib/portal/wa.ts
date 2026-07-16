// WhatsApp checker orchestration.
//
// whatsapp-web.js needs a *visible* browser + console the first time so you can
// scan the QR to link your phone. The Next server runs headless with no console,
// so we can't pipe the checker through it. Instead we:
//   1) export the lead phone numbers to wa-checker/wa-numbers.json (no auth needed),
//   2) launch the checker in its OWN terminal window (you scan the QR there),
//   3) ingest its wa-results.json from disk on every progress poll.
// This avoids the auth-gated /api/wa/* endpoints the spawned process can't reach.
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { db, loadWaFromDisk } from "./db";

const g = globalThis as unknown as { __waLaunchedAt?: number; __waErr?: string };

const checkerDir = () => path.join(process.cwd(), "wa-checker");
const resultsFile = () => path.join(checkerDir(), "wa-results.json");

// The checker is "running" if it wrote results very recently, or we launched it
// in the last 90s and there is still work to do (covers the QR-scan warm-up).
export function waRunning() {
  try {
    const m = fs.statSync(resultsFile()).mtimeMs;
    if (Date.now() - m < 45_000) return true;
  } catch { /* no results file yet */ }
  return !!g.__waLaunchedAt && Date.now() - g.__waLaunchedAt < 90_000;
}

// Write the current phone numbers to a file the checker reads without the API.
function exportNumbers() {
  const rows = db().prepare("SELECT id,name,phone FROM leads WHERE phone <> ''").all();
  fs.writeFileSync(path.join(checkerDir(), "wa-numbers.json"),
    JSON.stringify({ type: "whatsapp-numbers", updatedAt: Date.now(), numbers: rows }, null, 1));
  return rows.length;
}

export function startWaBackground(_baseUrl?: string) {
  const cwd = checkerDir();
  if (!fs.existsSync(path.join(cwd, "check.js"))) return { started: false, reason: "checker not found" };
  if (waRunning()) return { started: false, reason: "already running" };
  try {
    const total = exportNumbers();
    if (!total) return { started: false, reason: "No phone numbers in the database yet." };
    // Visible terminal window so the QR is scannable and progress is watchable.
    // WA_HEADLESS is intentionally NOT set so the linking QR is shown.
    const env = { ...process.env, API: "" };
    if (process.platform === "win32") {
      spawn("cmd.exe", ["/c", "start", "WhatsApp Checker", "cmd", "/k", "node", "check.js"],
        { cwd, env, detached: true, stdio: "ignore", windowsHide: false });
    } else {
      // mac/linux: try to open a terminal; fall back to a detached headless run.
      const child = spawn("node", ["check.js"], { cwd, env, detached: true, stdio: "ignore" });
      child.unref();
    }
    g.__waLaunchedAt = Date.now(); g.__waErr = "";
    return { started: true };
  } catch (e) { g.__waErr = String((e as any)?.message || e); return { started: false, reason: g.__waErr }; }
}

export function waProgress() {
  // Pull in whatever the checker has written to disk so the dashboard fills in live.
  try { loadWaFromDisk(); } catch { /* */ }
  const d = db();
  const num = (sql: string) => (d.prepare(sql).get() as any).c as number;
  const total = num("SELECT COUNT(*) c FROM leads WHERE phone <> ''");
  const yes = num("SELECT COUNT(*) c FROM leads WHERE wa='yes'");
  const no = num("SELECT COUNT(*) c FROM leads WHERE wa='no'");
  const checked = yes + no;
  return { running: waRunning(), total, checked, yes, no, unchecked: Math.max(0, total - checked), error: g.__waErr || "" };
}

export function waNumbers() {
  return db().prepare("SELECT id,name,phone FROM leads WHERE phone <> ''").all();
}
