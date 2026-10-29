// Builds the 1200x630 social image for each page (Open Graph / Twitter). One template, so every card looks
// the same. Run: node scripts/og/make-og.cjs  (needs Playwright; writes into public/)
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

// lucide icon paths for each card, copied from the same library the pages use
const ICON = {
  headset: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  layout: '<rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  pen: '<path d="M15.7 21.3a1 1 0 0 1-1.4 0l-1.6-1.6a1 1 0 0 1 0-1.4l5.6-5.6a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4z"/><path d="m18 13-1.4-6.9a1 1 0 0 0-.7-.8L3.2 2a1 1 0 0 0-1.2 1.2l3.3 12.7a1 1 0 0 0 .8.7L13 18"/><circle cx="11" cy="11" r="2"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
};

const CARDS = [
  { out: "public/products/ai-receptionist/og.png", kicker: "AI receptionist", title: ["A receptionist that", "never leaves the desk."], sub: "Answers questions and takes bookings on the business's website, day or night.", icon: "headset" },
  { out: "public/products/website-builder/og.png", kicker: "Website builder", title: ["From a lead to a live site,", "before the first call."], sub: "A focused, on-brand website for a business in minutes.", icon: "layout" },
  { out: "public/products/seo-report/og.png", kicker: "SEO report", title: ["SEO findings a client", "actually reads."], sub: "Scores, Core Web Vitals and a report you can send as it is.", icon: "file" },
  { out: "public/products/mockup-designer/og.png", kicker: "Mockup designer", title: ["Show the brand", "in the real world."], sub: "A logo on signs, cups, shirts and cards, ready for the proposal.", icon: "pen" },
  { out: "public/og/home.png", kicker: "Premium Markup", title: ["Find clients.", "Win them faster."], sub: "Local businesses checked for WhatsApp, plus websites and tools to pitch them.", icon: "spark" },
  { out: "public/og/pricing.png", kicker: "Pricing", title: ["Start free.", "Grow when you need to."], sub: "Plans for the Leads Portal and for each tool, with a free tier.", icon: "spark" },
  { out: "public/og/how-it-works.png", kicker: "How it works", title: ["From a lead", "to a sent demo."], sub: "Find the business, build its demo, and pitch it on WhatsApp or email.", icon: "layout" },
  { out: "public/og/products.png", kicker: "Products", title: ["Five tools.", "One portal."], sub: "Answer every visitor, build the site, check what is broken and show the brand.", icon: "pen" },
  { out: "public/og/contact.png", kicker: "Contact", title: ["Talk to the team."], sub: "Email, WhatsApp or the contact form. We reply within one working day.", icon: "spark" },
];

const html = (c) => `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;800&display=swap" rel="stylesheet"><style>
body{margin:0;width:1200px;height:630px;background:#fff;font-family:Inter,system-ui,sans-serif;position:relative;overflow:hidden;color:#1D1D1F}
.k{position:absolute;left:72px;top:78px;display:inline-flex;align-items:center;gap:8px;padding:8px 16px 8px 12px;border-radius:99px;background:#C5F541;color:#0C0819;font-weight:500;font-size:20px}
.k:before{content:"";width:8px;height:8px;border-radius:50%;background:#0C0819}
h1{position:absolute;left:72px;top:140px;width:640px;margin:0;font-size:70px;line-height:1;letter-spacing:-.05em;font-weight:800}
h1 em{font-style:normal;color:#683CE7}
.s{position:absolute;left:72px;top:440px;width:600px;font-size:24px;line-height:1.4;color:#6E6E73}
.b{position:absolute;left:72px;bottom:52px;font-weight:800;font-size:24px}
.b span{color:#683CE7}
.card{position:absolute;right:72px;top:120px;width:380px;height:380px;border-radius:44px;background:#fff;box-shadow:0 0 0 1px rgba(29,29,31,.08),0 60px 90px -40px rgba(20,10,60,.4);display:grid;place-items:center}
.ring{position:absolute;right:20px;top:60px;width:520px;height:520px;border-radius:50%;border:1.5px dashed rgba(104,60,231,.22)}
</style></head><body>
<span class="k">${c.kicker}</span>
<h1>${c.title.map((t, i) => (i === c.title.length - 1 && c.title.length > 1 ? `<em>${t}</em>` : t)).join("<br>")}</h1>
<p class="s">${c.sub}</p>
<div class="ring"></div><div class="card"><svg viewBox="0 0 24 24" width="170" height="170" fill="none" stroke="#683CE7" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${ICON[c.icon] || ICON.spark}</svg></div>
<div class="b">Premium Markup <span>·</span> ${c.kicker}</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const c of CARDS) {
    await page.setContent(html(c), { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const out = path.resolve(c.out);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out });
    console.log("wrote", c.out);
  }
  await browser.close();
})();
