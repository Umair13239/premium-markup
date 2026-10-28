#!/usr/bin/env node
// Media pipeline for the product pages (PRODUCTS-PLAN.md §3). Needs ffmpeg on PATH and Playwright.
//
//   node scripts/product-media.mjs record <config.json>
//       Plays a scripted flow in Chromium and records it, then encodes everything below.
//       config: { "url": "...", "out": "public/products/website-health", "name": "film",
//                 "viewport": [1600, 1000], "crop": "#selector" (optional),
//                 "steps": [ {"wait": 800}, {"click": "#go"}, {"type": ["#url", "example.com"]},
//                            {"scroll": 600}, {"hover": ".card"}, {"waitFor": ".report"} ] }
//   node scripts/product-media.mjs encode <video> <outDir> [name] [--crop=w:h:x:y] [--poster=2.5]
//       clip -> <name>-scrub.mp4 (all-intra, for ScrollFilm), <name>-loop.webm + .mp4, <name>-poster.webp
//   node scripts/product-media.mjs frames <url> <outDir> [name] --seconds=6 --fps=30 [--size=1200x1200]
//       For HTML/SVG animations: the page exposes window.__seek(t) (seconds); each frame is captured
//       and encoded the same way. Use it for the big-icon intro films.
//
// Outputs stay small: scrub < 2.5 MB, loop < 1 MB, poster < 120 KB (sizes are printed at the end).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const [cmd, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.filter((a) => a.startsWith("--")).map((a) => { const [k, v] = a.slice(2).split("="); return [k, v ?? true]; }));
const args = rest.filter((a) => !a.startsWith("--"));

const ff = (a) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" });
const kb = (f) => Math.round(statSync(f).size / 1024) + " KB";

function encode(input, outDir, name = "film", { crop, poster = 2.5, fps = 30 } = {}) {
  mkdirSync(outDir, { recursive: true });
  const base = join(outDir, name);
  const vf = [crop ? `crop=${crop}` : null, `fps=${fps}`, "scale='min(1600,iw)':-2:flags=lanczos"].filter(Boolean).join(",");
  const clip = join(tmpdir(), `pm-${name}-clip.mp4`);
  ff(["-i", input, "-vf", vf, "-an", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", clip]);
  // a keyframe every 4 frames: seeking decodes at most 3 frames, so scroll can drive it smoothly,
  // at about a quarter of the size of an every-frame keyframe file
  ff(["-i", clip, "-vf", "fps=24,scale='min(1280,iw)':-2:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", "27", "-g", "4", "-bf", "0", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", `${base}-scrub.mp4`]);
  ff(["-i", clip, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-an", `${base}-loop.webm`]);
  ff(["-i", clip, "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", `${base}-loop.mp4`]);
  ff(["-ss", String(poster), "-i", clip, "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", `${base}-poster.webp`]);
  rmSync(clip, { force: true });
  for (const f of ["-scrub.mp4", "-loop.webm", "-loop.mp4", "-poster.webp"]) console.log(`  ${name}${f}  ${kb(base + f)}`);
}

async function record(configPath) {
  const c = JSON.parse(readFileSync(configPath, "utf8"));
  const [w, h] = c.viewport || [1600, 1000];
  const dir = join(tmpdir(), "pm-rec-" + Date.now());
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, recordVideo: { dir, size: { width: w, height: h } } });
  const page = await ctx.newPage();
  await page.goto(c.url, { waitUntil: "networkidle" });
  for (const s of c.steps || []) {
    if (s.wait) await page.waitForTimeout(s.wait);
    if (s.click) await page.click(s.click);
    if (s.type) await page.locator(s.type[0]).pressSequentially(s.type[1], { delay: 70 });
    if (s.scroll) await page.mouse.wheel(0, s.scroll);
    if (s.hover) await page.hover(s.hover);
    if (s.waitFor) await page.waitForSelector(s.waitFor, { timeout: 60000 });
  }
  let crop = flags.crop;
  if (c.crop) {
    const b = await page.locator(c.crop).boundingBox();
    if (b) crop = [b.width, b.height, b.x, b.y].map((n) => Math.round(n / 2) * 2).join(":");
  }
  await ctx.close(); await browser.close();
  const raw = join(dir, readdirSync(dir).find((f) => f.endsWith(".webm")));
  console.log(`recorded ${raw}`);
  encode(raw, resolve(c.out), c.name || "film", { crop, poster: c.poster ?? 2.5 });
  rmSync(dir, { recursive: true, force: true });
}

async function frames(url, outDir, name = "intro") {
  const seconds = Number(flags.seconds || 6), fps = Number(flags.fps || 30);
  const [w, h] = String(flags.size || "1200x1200").split("x").map(Number);
  const dir = join(tmpdir(), "pm-frames-" + Date.now());
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url, { waitUntil: "networkidle" });
  const n = Math.round(seconds * fps);
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.__seek && window.__seek(t), i / fps);
    await page.screenshot({ path: join(dir, `f${String(i).padStart(4, "0")}.png`) });
  }
  await browser.close();
  const raw = join(dir, "raw.mp4");
  ff(["-framerate", String(fps), "-i", join(dir, "f%04d.png"), "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", raw]);
  encode(raw, resolve(outDir), name, { poster: flags.poster ?? seconds / 2, fps });
  rmSync(dir, { recursive: true, force: true });
}

if (cmd === "record") await record(args[0]);
else if (cmd === "encode") encode(args[0], resolve(args[1]), args[2], { crop: flags.crop, poster: flags.poster });
else if (cmd === "frames") await frames(args[0], args[1], args[2]);
else { console.log(readFileSync(new URL(import.meta.url)).toString().split("\n").slice(1, 19).join("\n")); process.exit(1); }
