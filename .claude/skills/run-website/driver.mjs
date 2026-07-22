#!/usr/bin/env node
// Driver for the Premium Markup website (Next.js 16, port 3001).
// Reuses a running server, or builds (if needed) + launches `next start`,
// then smoke-tests the key routes: marketing pages, /cv, /admin/login,
// the health API, an SSG service page, and a 404.
//
// Usage:
//   node .claude/skills/run-website/driver.mjs         # smoke test
//   node .claude/skills/run-website/driver.mjs --keep  # leave server up if we started it
//   node .claude/skills/run-website/driver.mjs --dev   # use `next dev` instead of prod start
//
// Exit 0 = all passed, 1 = a check failed, 2 = server never came up.
import { spawn, execSync } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const PORT = 3001;
const BASE = `http://${HOST}:${PORT}`;
const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const KEEP = process.argv.includes("--keep");
const DEV = process.argv.includes("--dev");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function get(p) {
  return new Promise((resolve) => {
    const req = http.get(BASE + p, (res) => {
      let d = "";
      res.on("data", (c) => (d += c.length < 1e6 ? c : ""));
      res.on("end", () => resolve({ code: res.statusCode, ct: res.headers["content-type"] || "", body: d }));
    });
    req.on("error", (e) => resolve({ err: e.message }));
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
  });
}
async function up() { const r = await get("/api/health"); return r.code === 200 || r.code === 404 ? r.code : (r.code || 0); }
async function waitUp(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const r = await get("/");
    if (r.code) return true;
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

// On Windows, shell:true wraps the child in cmd.exe; child.kill() would leave the
// real `next` process orphaned on the port. taskkill /T kills the whole tree.
function stop(child) {
  try {
    if (process.platform === "win32") execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: "ignore" });
    else child.kill();
  } catch {}
}

let checks = 0, failed = 0;
function ok(name, cond, detail) {
  checks++;
  if (cond) console.log(`  PASS  ${name}`);
  else { failed++; console.log(`  FAIL  ${name}${detail ? "  — " + detail : ""}`); }
}

async function main() {
  let child = null;
  const alreadyUp = (await get("/")).code;
  if (alreadyUp) {
    console.log(`Server already up at ${BASE} — reusing it.`);
  } else {
    if (!DEV && !fs.existsSync(path.join(APP_DIR, ".next", "BUILD_ID"))) {
      console.log("No .next build found — running `npm run build` (slow)…");
      execSync(`${npm} run build`, { cwd: APP_DIR, stdio: "inherit" });
    }
    const args = DEV ? ["run", "dev"] : ["start"];
    console.log(`Launching: npm ${args.join(" ")}  (cwd ${APP_DIR})`);
    // shell:true is required on Windows to spawn npm (a .cmd) since Node 20.
    child = spawn("npm", args, { cwd: APP_DIR, stdio: "ignore", windowsHide: true, shell: true });
    child.on("error", (e) => console.error("spawn error:", e.message));
    if (!(await waitUp(60000))) { console.error("Server did not come up within 60s."); if (child) stop(child); process.exit(2); }
    console.log("Server is up.");
  }

  console.log("\nSmoke checks:");
  for (const [p, want] of [["/", 200], ["/work", 200], ["/services", 200], ["/blog", 200], ["/contact", 200], ["/cv", 200], ["/admin/login", 200], ["/services/web-design", 200]]) {
    const r = await get(p);
    ok(`GET ${p} -> ${want}`, r.code === want, `code=${r.code}`);
  }
  const home = await get("/");
  ok("home has Premium Markup branding", /Premium\s*Markup|premiummarkup/i.test(home.body || ""), "no branding found");
  // Middleware (matcher /api/:path*) auth-gates every API route, so an unauthenticated
  // call is redirected (307) toward login. A 200 here would mean the API is unprotected.
  const health = await get("/api/health");
  ok("GET /api/health -> 307 (middleware gates /api/*)", health.code === 307, `code=${health.code}`);
  const miss = await get("/this-route-does-not-exist-xyz");
  ok("GET /missing -> 404", miss.code === 404, `code=${miss.code}`);

  console.log(`\n${checks - failed}/${checks} checks passed.`);
  if (child && !KEEP) { stop(child); console.log("Stopped the server we launched."); }
  else if (child) console.log(`Left server running (pid ${child.pid}).`);
  process.exit(failed ? 1 : 0);
}
main();
