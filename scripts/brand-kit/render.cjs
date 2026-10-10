// Brand kit renderer: node scripts/brand-kit/render.cjs scripts/brand-kit/<client>.json [only-id ...]
// 1) artwork (lockup, envelope, ID card, phone screen) as HTML from the brand config;
// 2) mockups: artwork placed on photo scenes with a true perspective transform (homography → matrix3d),
//    then the scene's own light/texture re-applied through the artwork's alpha so it sits *in* the photo;
// 3) boards: flat presentation slides (app icons, social, stationery, pattern) at 1920×1080 @1.5x.
const fs = require("fs"), path = require("path");
const sharp = require("sharp");
const { chromium } = require("../../../leads-manager/node_modules/playwright");

const [cfgPath, ...only] = process.argv.slice(2);
const C = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const ROOT = path.resolve(__dirname, "../.."), ASSETS = path.join(ROOT, C.assets), SCENES = path.join(ROOT, C.scenes);
const url = (f) => "file:///" + f.replace(/\\/g, "/");
const A = (f) => url(path.join(ASSETS, f));
const k = C.colors, ct = C.contact, F = C.font;
const HEAD = `<link href="https://fonts.googleapis.com/css2?family=${F}:wght@300;400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}body{margin:0;font-family:Inter}.j{font-family:'${F}'}</style>`;

// small social tiles (phone grid + social board)
function tile(i, s) {
  const bg = [k.graphite, k.gold, k.stone][i % 3], fg = i % 3 === 0 ? k.gold : k.graphite;
  const words = ["Plan.", "Design.", "Build.", "Interiors", "3D", "Planning", "Landscape", "Lighting", "Sahiwal"];
  const icon = i % 3 === 1 ? "icon-black.png" : i % 3 === 0 ? "icon-reversed.png" : "icon-color.png";
  return `<div style="width:100%;aspect-ratio:1;background:${bg};position:relative;overflow:hidden">
    ${i % 2 ? `<img src="${A(icon)}" style="position:absolute;right:-8%;bottom:-6%;width:70%;opacity:.9">` : `<div style="position:absolute;left:-30%;top:-30%;width:120%;aspect-ratio:1;border-radius:50%;border:${s / 60}px solid ${i % 3 === 0 ? k.gold : k.graphite};opacity:.35"></div>`}
    <div class="j" style="position:absolute;left:8%;top:8%;font:500 ${s / 7}px '${F}';color:${fg}">${words[i]}</div></div>`;
}

// ---------- artwork (rendered once, then placed on scenes) ----------
const ART = {
  "lockup-h": [2400, 760, `<div style="width:2400px;height:760px;display:flex;align-items:center;gap:90px;padding:0 40px">
    <img src="${A("icon-reversed.png")}" style="height:700px"><img src="${A("word-reversed.png")}" style="height:520px"></div>`, true],
  envelope: [1200, 1230, `<div style="width:1200px;height:1230px;position:relative;background:#fff">
    <img src="${A("logo-color.png")}" style="position:absolute;left:70px;top:70px;height:230px">
    <div style="position:absolute;left:70px;top:330px;font:400 22px/1.6 Inter;color:#666;max-width:520px">${ct.address}<br>${ct.web}</div></div>`],
  "id-card": [640, 1010, `<div style="width:640px;height:1010px;position:relative;background:${k.graphite};overflow:hidden;color:${k.stone}">
    <div style="position:absolute;inset:0;background:radial-gradient(80% 50% at 50% 0%,#2a2216,transparent 70%)"></div>
    <img src="${A("logo-reversed.png")}" style="position:absolute;left:50%;top:70px;transform:translateX(-50%);height:330px">
    <div style="position:absolute;left:50%;top:470px;transform:translateX(-50%);width:230px;height:230px;border-radius:50%;border:4px solid ${k.gold};background:#26292c"></div>
    <div class="j" style="position:absolute;left:0;right:0;top:740px;text-align:center;font:500 46px '${F}';letter-spacing:.02em">${C.person.name}</div>
    <div style="position:absolute;left:0;right:0;top:805px;text-align:center;font:500 22px Inter;letter-spacing:.2em;text-transform:uppercase;color:${k.gold}">${C.person.role}</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:80px;background:${k.gold}"></div></div>`],
  "phone-profile": [800, 1580, `<div style="width:800px;height:1580px;background:#0B0B0C;color:#F4F1EA;font-family:Inter;padding:70px 40px 0;overflow:hidden">
    <div style="display:flex;justify-content:space-between;font:600 30px Inter;margin-bottom:40px"><span>${ct.handle.slice(1)}</span><span style="color:${k.gold}">•••</span></div>
    <div style="display:flex;align-items:center;gap:44px"><div style="width:190px;height:190px;border-radius:50%;padding:6px;background:conic-gradient(${k.gold},${k.goldLight},${k.goldDeep},${k.gold})"><div style="width:100%;height:100%;border-radius:50%;background:${k.graphite};display:grid;place-items:center"><img src="${A("icon-reversed.png")}" style="width:120px"></div></div>
      <div style="display:flex;gap:46px;text-align:center;font:600 34px Inter">${["48|posts", "2.1k|followers", "120|following"].map((x) => `<div>${x.split("|")[0]}<div style="font:400 24px Inter;color:#9a9a9a">${x.split("|")[1]}</div></div>`).join("")}</div></div>
    <div class="j" style="font:500 36px '${F}';margin-top:30px">${C.name}</div>
    <div style="font:400 26px/1.5 Inter;color:#cfcfcf;margin-top:8px">${C.services.slice(0, 3).join(" · ")}<br>${C.tagline}<br><span style="color:${k.gold}">${ct.web}</span></div>
    <div style="display:flex;gap:14px;margin:34px 0"><div style="flex:1;padding:18px;text-align:center;border-radius:14px;background:${k.gold};color:#111;font:600 26px Inter">Follow</div><div style="flex:1;padding:18px;text-align:center;border-radius:14px;background:#222;font:600 26px Inter">Message</div></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 -40px">${[...Array(9)].map((_, i) => tile(i, 254)).join("")}</div></div>`],
};

// phone home screen with the brand's app icon among neutral placeholder apps, and the app's splash screen
const appIcon = (sz, r) => `<div style="width:${sz}px;height:${sz}px;border-radius:${r}px;background:${k.graphite};display:grid;place-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 6px 14px rgba(0,0,0,.35)"><img src="${A("icon-reversed.png")}" style="width:68%"></div>`;
const blank = (i) => { const c = ["#3a3f47", "#4b4f57", "#2f3540", "#5a5650", "#3d4650", "#46413b"][i % 6];
  return `<div style="text-align:center"><div style="width:150px;height:150px;border-radius:36px;background:linear-gradient(160deg,${c},#1c1f24);box-shadow:inset 0 1px 0 rgba(255,255,255,.12)"></div><div style="width:90px;height:12px;border-radius:6px;background:rgba(255,255,255,.35);margin:14px auto 0"></div></div>`; };
ART["phone-home"] = [800, 1580, `<div style="width:800px;height:1580px;position:relative;overflow:hidden;font-family:Inter;color:#fff;background:radial-gradient(90% 60% at 30% 20%,#5a4520,transparent 60%),radial-gradient(80% 60% at 80% 90%,#3a2a12,transparent 60%),#121316">
  <div style="display:flex;justify-content:space-between;padding:40px 56px 0;font:600 30px Inter"><span>9:41</span><span>●●● ▮</span></div>
  <div style="display:grid;grid-template-columns:repeat(4,150px);gap:56px 34px;justify-content:center;margin-top:90px">
    ${[...Array(5)].map((_, i) => blank(i)).join("")}
    <div style="text-align:center">${appIcon(150, 36)}<div style="font:500 22px Inter;margin-top:10px">TriArc</div></div>
    ${[...Array(6)].map((_, i) => blank(i + 5)).join("")}</div>
  <div style="position:absolute;left:30px;right:30px;bottom:40px;height:210px;border-radius:60px;background:rgba(255,255,255,.14);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:space-around">
    ${[0, 1, 2].map((i) => `<div style="width:150px;height:150px;border-radius:36px;background:linear-gradient(160deg,#4b4f57,#1c1f24)"></div>`).join("")}${appIcon(150, 36)}</div></div>`];
ART["phone-splash"] = [800, 1580, `<div style="width:800px;height:1580px;position:relative;overflow:hidden;background:radial-gradient(70% 45% at 50% 42%,#2a2216,${k.graphite} 75%)">
  <img src="${A("icon-reversed.png")}" style="position:absolute;left:50%;top:560px;transform:translateX(-50%);width:380px">
  <img src="${A("word-reversed.png")}" style="position:absolute;left:50%;bottom:180px;transform:translateX(-50%);width:420px"></div>`];

// ---------- boards (flat presentation slides) ----------
const ios = (bg, inner, label) => `<div style="text-align:center;width:250px"><div style="width:250px;height:250px;border-radius:58px;background:${bg};display:grid;place-items:center;overflow:hidden;box-shadow:inset 0 2px 0 rgba(255,255,255,.25)">${inner}</div><div style="font:500 40px -apple-system,Inter;color:#fff;margin-top:22px">${label}</div></div>`;
const paper = (x, y, w, h, rot, inner) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:#FDFCF9;transform:rotate(${rot}deg);overflow:hidden;
  box-shadow:0 1px 1px rgba(60,45,20,.12),0 4px 8px rgba(60,45,20,.10),0 18px 30px -6px rgba(60,45,20,.18),0 40px 60px -20px rgba(60,45,20,.22)">${inner}</div>`;
const BOARDS = {
  "app-home": `<div style="width:1920px;height:1080px;position:relative;overflow:hidden;background:linear-gradient(160deg,#e9e9ea,#cfcfd2)">
    <div style="position:absolute;left:330px;top:120px;width:2100px;height:2400px;border-radius:330px;background:linear-gradient(135deg,#9a9a9e,#3b3b3f 30%,#79797d 55%,#2a2a2d);padding:26px;transform:rotate(-8deg);box-shadow:-40px 60px 120px rgba(0,0,0,.35)">
      <div style="width:100%;height:100%;border-radius:306px;background:#000;padding:16px"><div style="width:100%;height:100%;border-radius:292px;background:#050505;position:relative;overflow:hidden">
        <div style="position:absolute;left:230px;top:90px;font:600 64px -apple-system,Inter;color:#fff">9:41</div>
        <div style="position:absolute;left:820px;top:60px;width:430px;height:120px;border-radius:60px;background:#000;box-shadow:0 0 0 2px #111"></div>
        <div style="position:absolute;left:170px;top:300px;display:grid;grid-template-columns:repeat(4,250px);gap:90px 110px">
          ${ios(k.graphite, `<img src="${A("icon-reversed.png")}" style="width:74%">`, "TriArc")}
          ${ios("#fff", `<div style="text-align:center;line-height:1"><div style="font:600 40px Inter;color:#ff3b30">MON</div><div style="font:300 120px Inter;color:#111">6</div></div>`, "Calendar")}
          ${ios("#fff", `<div style="width:170px;height:170px;border-radius:50%;background:conic-gradient(#ff9500,#ffcc00,#34c759,#5ac8fa,#007aff,#af52de,#ff2d55,#ff9500);-webkit-mask:radial-gradient(circle,transparent 18%,#000 19%)"></div>`, "Photos")}
          ${ios("linear-gradient(#5ac8fa,#007aff)", `<svg width="160" height="110" viewBox="0 0 160 110"><rect x="4" y="4" width="152" height="102" rx="12" fill="#fff"/><path d="M8 10 L80 66 L152 10" fill="none" stroke="#3d8ef7" stroke-width="7"/></svg>`, "Mail")}
          ${ios("#fff", `<div style="width:100%;height:100%;background:linear-gradient(#ffd60a 0 28%,#fff 28%);position:relative">${[0, 1, 2, 3].map((i) => `<div style="position:absolute;left:36px;right:36px;top:${110 + i * 34}px;height:3px;background:#ddd"></div>`).join("")}</div>`, "Notes")}
          ${ios("linear-gradient(#ff5e3a,#ff2a68)", `<div style="font:700 120px Inter;color:#fff">&#9835;</div>`, "Music")}
          ${ios("#1c1c1e", `<div style="width:150px;height:150px;border-radius:50%;border:10px solid #fff;position:relative"><div style="position:absolute;left:61px;top:16px;width:8px;height:56px;background:#fff"></div><div style="position:absolute;left:61px;top:64px;width:46px;height:8px;background:#ff9500"></div></div>`, "Clock")}
          ${ios("linear-gradient(#8e8e93,#636366)", `<div style="width:150px;height:150px;border-radius:50%;border:22px dotted #d1d1d6"></div>`, "Settings")}
        </div></div></div></div></div>`,

  "app-icons": `<div style="width:1920px;height:1080px;position:relative;background:linear-gradient(135deg,#2a2c2f,#16181a);display:flex;align-items:center;justify-content:center;gap:120px">
    ${[[k.graphite, "icon-reversed.png"], [k.stone, "icon-color.png"]].map(([bg, ic], i) => `<div style="text-align:center">
      <div style="width:340px;height:340px;border-radius:78px;background:${bg};display:grid;place-items:center;box-shadow:0 60px 90px -30px rgba(0,0,0,.8),inset 0 2px 0 rgba(255,255,255,.25),inset 0 0 0 2px rgba(255,255,255,.06)">
        <img src="${A(ic)}" style="width:66%"></div>
      <div style="margin-top:34px;font:500 26px Inter;color:#cfcfcf">${["Dark", "Light"][i]}</div></div>`).join("")}
    <div class="j" style="position:absolute;left:90px;top:80px;font:500 30px '${F}';color:${k.gold};letter-spacing:.1em">APP ICON</div></div>`,
  social: `<div style="width:1920px;height:1080px;background:${k.stone};display:flex;align-items:center;justify-content:center;gap:40px">
    ${[0, 1, 2].map((i) => `<div style="width:520px;border-radius:24px;overflow:hidden;background:#fff;box-shadow:0 50px 80px -40px rgba(0,0,0,.45)">
      <div style="display:flex;align-items:center;gap:14px;padding:18px 20px"><div style="width:52px;height:52px;border-radius:50%;background:${k.graphite};display:grid;place-items:center"><img src="${A("icon-reversed.png")}" style="width:34px"></div><b style="font:600 20px Inter">${ct.handle.slice(1)}</b></div>
      ${tile([0, 4, 2][i], 520)}
      <div style="padding:16px 20px 22px;font:400 18px Inter;color:#444">${["Every project starts with a line.", "See it before it's built.", "Spaces made to be lived in."][i]}</div></div>`).join("")}</div>`,
  "flat-stationery": `<div style="width:1920px;height:1080px;position:relative;overflow:hidden;background:#E9E4D9">
    <svg width="1920" height="1080" style="position:absolute;inset:0;opacity:.5"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 .35 0"/></filter><rect width="1920" height="1080" filter="url(#n)"/></svg>
    <div style="position:absolute;inset:0;background:radial-gradient(80% 70% at 30% 20%,rgba(255,255,255,.55),transparent 60%)"></div>
    ${paper(440, 90, 640, 905, -3, `<img src="${A("logo-color.png")}" style="position:absolute;left:56px;top:54px;height:150px">
      <div style="position:absolute;right:56px;top:70px;text-align:right;font:400 13px/1.7 Inter;color:#777">${ct.address.replace(", Church", "<br>Church")}<br>${ct.phones}<br>${ct.email}</div>
      <div style="position:absolute;left:56px;right:56px;top:240px;height:1.5px;background:${k.gold}"></div>
      <div style="position:absolute;left:56px;top:290px;font:500 15px Inter;color:#333">Dear Client,</div>
      ${[...Array(9)].map((_, i) => `<div style="position:absolute;left:56px;right:${i % 3 === 2 ? 190 : 56}px;top:${336 + i * 30}px;height:6px;border-radius:3px;background:#EEECE8"></div>`).join("")}
      <div style="position:absolute;left:56px;bottom:46px;font:500 11px '${F}';letter-spacing:.32em;color:${k.gold}">${ct.web.toUpperCase()}</div>`)}
    ${paper(1180, 150, 420, 240, 4, `<div style="width:100%;height:100%;background:${k.graphite};display:grid;place-items:center"><img src="${A("logo-reversed.png")}" style="height:180px"></div>`)}
    ${paper(1220, 440, 420, 240, -2, `<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 34px">
      <div class="j" style="font:500 26px '${F}';color:#222">${C.person.name}</div><div style="font:500 11px Inter;letter-spacing:.2em;text-transform:uppercase;color:${k.gold};margin-top:4px">${C.person.role}</div>
      <div style="margin-top:22px;font:400 11px/1.7 Inter;color:#777">${ct.phones}<br>${ct.email}<br>${ct.web}</div></div>`)}
    ${paper(1140, 740, 520, 260, 2, `<div style="position:absolute;inset:0;background:linear-gradient(to bottom right,transparent 49.7%,rgba(0,0,0,.05) 50%,transparent 50.4%) left/50% 55% no-repeat,linear-gradient(to bottom left,transparent 49.7%,rgba(0,0,0,.05) 50%,transparent 50.4%) right/50% 55% no-repeat"></div>
      <img src="${A("icon-color.png")}" style="position:absolute;left:36px;bottom:30px;height:56px">`)}
    <div style="position:absolute;left:1690px;top:170px;width:14px;height:640px;border-radius:7px;background:linear-gradient(90deg,#7a5b17,${k.goldLight} 45%,#8a6a1f);transform:rotate(9deg);box-shadow:14px 18px 18px rgba(60,45,20,.28)"></div></div>`,
  pattern: `<div style="width:1920px;height:1080px;position:relative;overflow:hidden;background:${k.stone}">
    ${[...Array(9)].map((_, r) => [...Array(17)].map((_, c) => `<img src="${A((r + c) % 4 ? "icon-color.png" : "icon-gold.png")}" style="position:absolute;width:74px;left:${c * 124 - (r % 2 ? 0 : 62) - 20}px;top:${r * 130 - 20}px;opacity:${(r + c) % 4 ? 0.9 : 0.55}">`).join("")).join("")}</div>`,
};

// ---------- perspective ----------
const adj = (m) => [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]];
const mm = (a, b) => { const c = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let x = 0; x < 3; x++) s += a[3 * i + x] * b[3 * x + j]; c[3 * i + j] = s; } return c; };
const mv = (m, v) => [0, 1, 2].map((i) => m[3 * i] * v[0] + m[3 * i + 1] * v[1] + m[3 * i + 2] * v[2]);
const basis = (p) => { const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1]; const v = mv(adj(m), [p[3][0], p[3][1], 1]); return mm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]); };
const matrix3d = (w, h, q) => { const t = mm(basis(q), adj(basis([[0, 0], [w, 0], [w, h], [0, h]]))); for (let i = 0; i < 9; i++) t[i] /= t[8];
  return `matrix3d(${[t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]].join(",")})`; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const want = (id) => !only.length || only.includes(id);

(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const page = async (html, w, h) => {
    const tmp = path.join(ASSETS, "_tmp.html"); fs.writeFileSync(tmp, `<html><head>${HEAD}</head><body>${html}</body></html>`);
    await p.setViewportSize({ width: w, height: h }); await p.goto(url(tmp), { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(250);
  };
  for (const [name, [w, h, html, transparent]] of Object.entries(ART)) {
    await page(html, w, h); await p.screenshot({ path: path.join(ASSETS, "art-" + name + ".png"), omitBackground: !!transparent, clip: { x: 0, y: 0, width: w, height: h } });
  }
  const sizeOf = async (f) => { const m = await sharp(f).metadata(); return [m.width, m.height]; };
  for (const m of C.mockups.filter((x) => want(x.id))) {
    const scene = path.join(SCENES, m.scene), [SW, SH] = await sizeOf(scene);
    const layers = m.layers || [m]; let body = `<img src="${url(scene)}" style="position:absolute;inset:0;width:${SW}px;height:${SH}px">`;
    for (const [li, L] of layers.entries()) {
      const file = L.art.startsWith("@") ? path.join(ASSETS, "art-" + L.art.slice(1) + ".png") : path.join(ASSETS, L.art);
      const [aw, ah] = await sizeOf(file);
      let quad = L.quad, W = aw, H = ah, inner = `<img src="${url(file)}" style="width:${aw}px;height:${ah}px;display:block">`;
      if (L.box) { const [cx, cy, bw] = L.box, bh = bw * ah / aw; quad = [[cx - bw / 2, cy - bh / 2], [cx + bw / 2, cy - bh / 2], [cx + bw / 2, cy + bh / 2], [cx - bw / 2, cy + bh / 2]]; }
      else if (L.pad) {
        const asp = (dist(quad[0], quad[1]) + dist(quad[3], quad[2])) / (dist(quad[0], quad[3]) + dist(quad[1], quad[2]));
        H = 1000; W = Math.round(1000 * asp); const s = Math.min(W / aw, H / ah) * (1 - 2 * L.pad);
        inner = `<div style="width:${W}px;height:${H}px;display:grid;place-items:center"><img src="${url(file)}" style="width:${aw * s}px;height:${ah * s}px"></div>`;
      }
      const tf = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0;transform:${matrix3d(W, H, quad)}`;
      const depth = L.depth ?? m.depth, sc = W / Math.max(1, dist(quad[0], quad[1]));
      const shadow = depth ? [...Array(depth)].map(() => `drop-shadow(${(1.1 * sc).toFixed(2)}px ${(1.1 * sc).toFixed(2)}px 0 rgba(48,36,14,.92))`).join(" ") + ` drop-shadow(${10 * sc}px ${18 * sc}px ${14 * sc}px rgba(0,0,0,.6))`
        : (L.shadow ?? m.shadow) ? "drop-shadow(10px 18px 14px rgba(0,0,0,.55))" : "";
      body += `<div style="${tf};mix-blend-mode:${L.blend || "normal"};filter:blur(.3px) ${shadow}">${inner}</div>`;
      const light = L.light ?? (layers.length === 1 ? m.light : 0);
      if (light) { // scene light through the artwork's own alpha
        await page(`<div style="position:relative;width:${SW}px;height:${SH}px"><div style="${tf}">${inner}</div></div>`, SW, SH);
        const mk = path.join(ASSETS, `_mask-${m.id}-${li}.png`);
        await p.screenshot({ path: mk, omitBackground: true, clip: { x: 0, y: 0, width: SW, height: SH } });
        body += `<img src="${url(scene)}" style="position:absolute;inset:0;width:${SW}px;height:${SH}px;-webkit-mask-image:url('${url(mk)}');mix-blend-mode:soft-light;opacity:${light}">`;
      }
    }
    await page(`<div style="position:relative;width:${SW}px;height:${SH}px;overflow:hidden">${body}</div>`, SW, SH);
    await p.screenshot({ path: path.join(ASSETS, "mock-" + m.id + ".jpg"), type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: SW, height: SH } });
    console.log("mock", m.id, SW + "x" + SH);
  }
  await p.close(); const p2 = await b.newPage({ deviceScaleFactor: 1.5 });
  for (const id of (C.boards || []).filter(want)) {
    const tmp = path.join(ASSETS, "_tmp.html"); fs.writeFileSync(tmp, `<html><head>${HEAD}</head><body>${BOARDS[id]}</body></html>`);
    await p2.setViewportSize({ width: 1920, height: 1080 }); await p2.goto(url(tmp), { waitUntil: "load" }); await p2.evaluate(() => document.fonts.ready); await p2.waitForTimeout(300);
    await p2.screenshot({ path: path.join(ASSETS, "board-" + id + ".jpg"), type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    console.log("board", id);
  }
  for (const f of fs.readdirSync(ASSETS)) if (/^(mock|board)-.*\.jpg$/.test(f)) {
    const src = path.join(ASSETS, f); await sharp(src).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(src.replace(/\.jpg$/, ".webp")); fs.rmSync(src);
  }
  for (const f of fs.readdirSync(ASSETS)) if (f.startsWith("_")) fs.rmSync(path.join(ASSETS, f), { force: true });
  await b.close();
})();
