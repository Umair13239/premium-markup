/*
 * Generate photorealistic, on-brand imagery with Alibaba Qwen / DashScope (Wan)
 * and save to public/generated/. Run:  node scripts/gen-images.mjs
 * Optionally limit to some names:      node scripts/gen-images.mjs web-design seo
 *
 * Requires in .env: QWEN_API_KEY, QWEN_DASHSCOPE_BASE (…/api/v1)
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const env = {};
try {
  fs.readFileSync(path.join(process.cwd(), ".env"), "utf8").split("\n").forEach((l) => {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m) env[m[1]] = m[2];
  });
} catch { /* */ }

const KEY = process.env.QWEN_API_KEY || env.QWEN_API_KEY;
const BASE = (process.env.QWEN_DASHSCOPE_BASE || env.QWEN_DASHSCOPE_BASE || "").replace(/\/$/, "");
const MODEL = process.env.QWEN_IMAGE_MODEL || env.QWEN_IMAGE_MODEL || "wan2.2-t2i-plus";
const CF_ACC = process.env.CLOUDFLARE_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID;
const CF_TOK = process.env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_API_TOKEN;

// Provider: default Qwen/Wan (best photoreal here); pass --cf to use Cloudflare
// Flux instead. e.g.  node scripts/gen-images.mjs --cf service-seo
const rawArgs = process.argv.slice(2);
const PROVIDER = rawArgs.includes("--cf") ? "cloudflare" : "qwen";
if (PROVIDER === "qwen" && (!KEY || !BASE)) { console.error("Missing QWEN_API_KEY or QWEN_DASHSCOPE_BASE in .env"); process.exit(1); }
if (PROVIDER === "cloudflare" && (!CF_ACC || !CF_TOK)) { console.error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in .env"); process.exit(1); }

// Realistic photography style so images look real, not abstract — but still
// cohesive with the dark, premium, violet-accented brand.
const STYLE =
  "photorealistic, cinematic professional photography, moody dark tones, dramatic soft lighting, " +
  "shallow depth of field, subtle cool violet ambient light, premium high-end, ultra-detailed, realistic, " +
  "no text, no watermark, no logo";
const NEG = "text, watermark, logo, letters, words, lowres, blurry, distorted, deformed hands, extra fingers, cartoon, illustration, cgi, oversaturated, cheap stock photo";
// Flux over-applies an explicit colour cue, so its style drops the violet mention.
const STYLE_CF = "photorealistic, cinematic professional photography, moody dark tones, dramatic soft lighting, shallow depth of field, premium high-end, ultra-detailed, realistic, no text, no watermark, no logo";

const SIZE = "1280*720";
const SPECS = [
  // brand / social
  { name: "og", prompt: "a sleek modern creative web design studio workspace, a large monitor showing an elegant website, moody premium lighting, wide banner" },
  // case studies
  { name: "work-north-oak-joinery", prompt: "a master carpenter's hands planing a smooth oak plank in a modern joinery workshop, fine wood shavings, warm rim light, dark background" },
  { name: "work-harbour-dental", prompt: "a modern minimalist dental clinic reception, clean white and light-wood surfaces, calm, soft daylight, pristine and empty" },
  { name: "work-meridian-lettings", prompt: "a modern residential apartment building exterior at blue-hour dusk, warm-lit windows, quiet city street, estate agency" },
  // blog covers
  { name: "blog-what-a-500-website", prompt: "an open laptop on a tidy wooden desk showing a clean modern website, coffee cup and notebook, warm window light, minimal" },
  { name: "blog-why-your-wix-site", prompt: "close-up of hands on a laptop keyboard in a dim room, glowing screen, focused small-business owner in the evening" },
  // about
  { name: "about", prompt: "a web designer's workspace with dual monitors showing code and a design layout, dark room, warm desk-lamp glow, plants, cinematic, no people" },
  // services (slug-matched: /generated/service-<slug>.png)
  { name: "service-web-design", prompt: "a designer refining a website layout on a large monitor, colour swatches and sketches on the desk, moody studio" },
  { name: "service-web-development", prompt: "a software developer's dark workspace, a code editor glowing on a widescreen monitor, mechanical keyboard, night" },
  { name: "service-animated-websites", prompt: "a motion designer's studio, a screen showing an animation timeline and flowing graphics, creative dark space with soft light" },
  { name: "service-ecommerce", prompt: "an online store checkout open on a laptop beside neatly packaged premium product boxes, warm retail lighting" },
  { name: "service-website-redesign", prompt: "a large monitor showing a sleek redesigned website in a minimalist modern office, moody, high-end" },
  { name: "service-landing-pages", prompt: "a single focused landing page on a laptop screen with a small analytics uptick, clean desk, directional spotlight" },
  { name: "service-ui-ux-design", prompt: "UX wireframes and sticky notes on a glass wall, a designer prototyping on a tablet, studio lighting" },
  { name: "service-seo", prompt: "an analyst reviewing a search-analytics dashboard with rising line graphs on a monitor, dark focused office" },
  { name: "service-website-maintenance", prompt: "a clean data-centre server aisle with softly glowing blue-violet indicator lights, deep perspective, cinematic" },
  { name: "service-graphic-design", prompt: "top-down of a graphic designer's desk: tablet, stylus, colour-palette prints and brand materials, moody premium" },
];

function req(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const r = https.request({ hostname: u.hostname, path: u.pathname + u.search, method, headers: { ...headers, ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}) } },
      (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve({ status: res.statusCode, json: (() => { try { return JSON.parse(d); } catch { return d; } })() })); });
    r.on("error", reject); if (data) r.write(data); r.end();
  });
}
const download = (url, dest) => new Promise((resolve, reject) => {
  const f = fs.createWriteStream(dest);
  https.get(url, (res) => { res.pipe(f); f.on("finish", () => f.close(() => resolve())); }).on("error", reject);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(spec) {
  const submit = await req("POST", `${BASE}/services/aigc/text2image/image-synthesis`,
    { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", "X-DashScope-Async": "enable" },
    { model: MODEL, input: { prompt: `${spec.prompt}. ${STYLE}`, negative_prompt: NEG }, parameters: { size: SIZE, n: 1, prompt_extend: true } });
  const taskId = submit.json?.output?.task_id;
  if (!taskId) return { name: spec.name, ok: false, err: JSON.stringify(submit.json).slice(0, 180) };
  for (let i = 0; i < 60; i++) {
    await sleep(3000);
    const poll = await req("GET", `${BASE}/tasks/${taskId}`, { Authorization: `Bearer ${KEY}` });
    const st = poll.json?.output?.task_status;
    if (st === "SUCCEEDED") {
      const url = poll.json.output.results?.[0]?.url;
      if (!url) return { name: spec.name, ok: false, err: "no url" };
      const dir = path.join(process.cwd(), "public", "generated");
      fs.mkdirSync(dir, { recursive: true });
      await download(url, path.join(dir, `${spec.name}.png`));
      return { name: spec.name, ok: true };
    }
    if (st === "FAILED") return { name: spec.name, ok: false, err: poll.json.output?.message || "failed" };
  }
  return { name: spec.name, ok: false, err: "timeout" };
}

// Cloudflare Workers AI (Flux) — synchronous, returns base64.
async function genCloudflare(spec) {
  const res = await req("POST", `https://api.cloudflare.com/client/v4/accounts/${CF_ACC}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    { Authorization: `Bearer ${CF_TOK}`, "Content-Type": "application/json" },
    { prompt: `${spec.prompt}. ${STYLE_CF}`, steps: 8 });
  const img = res.json?.result?.image;
  if (!img) return { name: spec.name, ok: false, err: JSON.stringify(res.json?.errors || res.json).slice(0, 160) };
  const dir = path.join(process.cwd(), "public", "generated");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${spec.name}.png`), Buffer.from(img, "base64"));
  return { name: spec.name, ok: true };
}

// Try the chosen provider; if it errors, automatically fall back to the other so
// generation keeps working even if one service is down or out of quota.
async function runOne(spec) {
  const primary = PROVIDER === "cloudflare" ? genCloudflare : generate;
  const secondary = PROVIDER === "cloudflare" ? generate : genCloudflare;
  const canSecondary = PROVIDER === "cloudflare" ? !!(KEY && BASE) : !!(CF_ACC && CF_TOK);
  const safe = (fn) => fn(spec).catch((e) => ({ name: spec.name, ok: false, err: String(e?.message || e) }));
  const r = await safe(primary);
  if (r.ok || !canSecondary) return r;
  const r2 = await safe(secondary);
  return r2.ok ? { ...r2, via: "fallback" } : r2;
}

(async () => {
  const only = rawArgs.filter((a) => !a.startsWith("--"));
  const list = only.length ? SPECS.filter((s) => only.includes(s.name)) : SPECS;
  const primaryName = PROVIDER === "cloudflare" ? "Cloudflare Flux" : MODEL;
  const fallbackName = PROVIDER === "cloudflare" ? MODEL : "Cloudflare Flux";
  console.log(`Generating ${list.length} images — primary: ${primaryName}, fallback: ${fallbackName} …`);
  for (const spec of list) {
    const r = await runOne(spec);
    console.log(r.ok ? `✓ ${r.name}${r.via ? " (via fallback)" : ""}` : `✗ ${r.name} — ${r.err}`);
  }
  console.log("Done. Images in public/generated/");
})();
