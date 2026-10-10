// Generate blank product scenes for brand mockups with Cloudflare Workers AI (Leonardo Phoenix, up to 1920 px).
// Usage: node scripts/mockup-scenes.mjs <outDir> [name ...]   (keys come from .env, never printed)
import fs from "node:fs";
import path from "node:path";

const env = Object.fromEntries(fs.readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; }));
const ACC = env.CLOUDFLARE_ACCOUNT_ID, TOK = env.CLOUDFLARE_API_TOKEN;
if (!ACC || !TOK) throw new Error("Cloudflare not configured in .env");

const LOOK = "luxury architectural brand photography, cinematic moody lighting, warm accent light, dark tones, photorealistic, 8k detail, sharp focus, no text, no logo, no letters, no watermark";
// [prompt, width, height] — flat, front-facing blank surfaces so the mark can be placed precisely.
export const SCENES = {
  sign: ["a wide blank matte black metal sign panel mounted on a concrete architecture studio facade at dusk, warm hidden LED backlight, front view, empty panel", 1920, 1088],
  reception: ["a minimal luxury architecture office reception with a large blank dark walnut wood feature wall behind a stone reception desk, warm spotlights, front view, empty wall", 1920, 1088],
  stationery: ["top-down flat lay of blank white letterhead paper, blank white envelope and two blank white business cards on a dark charcoal stone table, brass pen, architect ruler, dramatic soft light", 1920, 1088],
  cards: ["two blank matte black business cards lying flat on dark slate stone, top-down view, soft dramatic side light, empty card surfaces", 1920, 1088],
  phone: ["a hand holding a black smartphone with a completely blank black screen facing the camera, front view, dark architectural interior background, cinematic", 1440, 1440],
  tote: ["a plain blank black canvas tote bag hanging on a hook against a raw concrete wall, front view, flat empty bag surface, soft warm light", 1440, 1440],
  hoodie: ["a plain blank black hoodie on a person, front chest view, dark studio, soft rim light, empty chest area", 1440, 1440],
  helmet: ["a glossy white construction safety helmet resting on architectural blueprints next to a scale model building, warm light, front side of helmet visible", 1440, 1440],
  badge: ["a blank white plastic ID card on a black lanyard lying on a dark desk, top-down, empty card", 1440, 1440],
  letterhead: ["top-down flat lay of a single blank white A4 letterhead paper and one blank white business card on a light warm beige linen surface, soft natural daylight, gentle shadow, minimal, clean, empty paper", 1920, 1088],
  hoarding: ["a long blank matte white construction site hoarding fence panel in front of a building under construction with a crane, daytime, front view, empty flat panel surface", 1920, 1088],
  drafting: ["an architect drafting table with a large blank white sheet of paper, drafting ruler, pencils and a small architectural scale model, soft warm studio light, top three-quarter view, empty paper", 1920, 1088],
  box: ["a blank closed matte black rectangular presentation box on dark stone, top lid facing camera at a slight angle, soft shadows, empty lid", 1440, 1440],
};

async function run(name, outDir) {
  const [prompt, width, height] = SCENES[name];
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACC}/ai/run/@cf/leonardo/phoenix-1.0`, {
    method: "POST", headers: { Authorization: `Bearer ${TOK}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: `${prompt}, ${LOOK}`, width, height }),
  });
  if (!res.ok || !(res.headers.get("content-type") || "").startsWith("image")) throw new Error(name + ": " + (await res.text()).slice(0, 200));
  fs.writeFileSync(path.join(outDir, name + ".jpg"), Buffer.from(await res.arrayBuffer()));
  console.log("ok", name);
}

const [outDir, ...names] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
for (const n of names.length ? names : Object.keys(SCENES)) { try { await run(n, outDir); } catch (e) { console.log("ERR", e.message); } }
