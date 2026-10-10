// Work page media, grouped by type (logofolio, identity, posts, print, cards, certificates,
// websites). Every image's real size is read at build time so each one is shown in its own
// shape; reversed logos (DARK_TILE) sit on a dark tile so they stay visible.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getPortfolio } from "@/lib/portfolio";

const A = "/portfolio/assets/portfolio/";
export type Media = { src: string; w: number; h: number; title: string; brand: string; dark?: boolean; fill?: boolean; url?: string; zoom?: number; thumb: string; bg: string };
type In = [file: string, title: string, brand: string, url?: string, zoom?: number];

// Single marks only, trimmed to their content (public/portfolio/assets/logos/) so they can be sized evenly.
const LOGOS: In[] = [
  ["triarc-logo-dark.webp", "TriArc Consultant", "TriArc Consultant"],
  ["triarc-logo-light.webp", "TriArc Consultant, reversed", "TriArc Consultant", undefined, 1.45],
  ["tyde-logo-wide.webp", "Tyde Link", "Tyde Link"],
  ["tyde-logo-round.webp", "Tyde Link, round mark", "Tyde Link"],
  ["sca-logo.webp", "Security Compliance Academy", "Security Compliance Academy"],
  ["pila-logo.webp", "P.I. Leadership Academy", "P.I. Leadership Academy"],
  ["csi-logo-shield.webp", "Confidential Security & Investigations", "Confidential Security & Investigations"],
  ["triangle-logo.webp", "Triangle Fingerprinting", "Triangle Fingerprinting", undefined, 1.9],
  ["tracking-logo.webp", "Triangle Tracking", "Triangle Tracking"],
  ["tycoons-logo.webp", "Writing Tycoons", "Writing Tycoons"],
  ["nextnet-logo.webp", "NextNet", "NextNet", undefined, 1.2],
  ["tpf-logo.webp", "TPF", "TPF"],
  ["coacare.webp", "CoaCare", "CoaCare"],
];
const IDENTITY: In[] = [
  ["maeme-colors.webp", "Colour palette", "Maeme's Piri Piri Grill"],
  ["maeme-appicons.webp", "App icons", "Maeme's Piri Piri Grill"],
  ["maeme-bag.webp", "Takeaway bag", "Maeme's Piri Piri Grill"],
  ["maeme-bucket.webp", "Chicken bucket", "Maeme's Piri Piri Grill"],
  ["maeme-card.webp", "Loyalty card", "Maeme's Piri Piri Grill"],
  ["maeme-billboard.webp", "Billboard", "Maeme's Piri Piri Grill"],
  ["maeme-maeme-s-wall.webp", "Store wall graphic", "Maeme's Piri Piri Grill"],
  ["maeme-header-for-website.webp", "Website header", "Maeme's Piri Piri Grill"],
  ["maeme-youtube-banner.webp", "YouTube banner", "Maeme's Piri Piri Grill"],
  ["maeme-logos.webp", "Logo set", "Maeme's Piri Piri Grill"],
  ["fliqz-logo.webp", "Logo and applications", "Fliqz"],
  ["realestate-display-1.webp", "Realtor logo set I", "Real estate"],
  ["realestate-display-2.webp", "Realtor logo set II", "Real estate"],
  ["realestate-display-3.webp", "Realtor logo set III", "Real estate"],
  ["fliqz-branding.webp", "Brand system", "Fliqz"],
  ["fliqz-brandsheet.webp", "Brand sheet", "Fliqz"],
  ["triarc-logo-photo.webp", "Identity presentation", "TriArc Consultant"],
];
const PRINT: In[] = [
  ["maeme-aberdeen-menu-front.webp", "Aberdeen menu, front", "Maeme's Piri Piri Grill"],
  ["maeme-aberdeen-menu-back.webp", "Aberdeen menu, back", "Maeme's Piri Piri Grill"],
  ["maeme-maemes-manchester-menu-design.webp", "Manchester menu", "Maeme's Piri Piri Grill"],
  ["maeme-1-7m-x-3m.webp", "Shop sign, 1.7 m × 3 m", "Maeme's Piri Piri Grill"],
  ["maeme-5m-x-2-36m.webp", "Shop sign, 5 m × 2.36 m", "Maeme's Piri Piri Grill"],
  ["brisk-security.webp", "Service flyer", "Brisk Security Services"],
  ["sca-brochure-1.webp", "Course brochure", "Security Compliance Academy"],
  ["sca-brochure-2.webp", "Brochure, inside", "Security Compliance Academy"],
  ["sca-brochure-3.webp", "Brochure, cover", "Security Compliance Academy"],
];
const CARDS: In[] = [
  ["triarc-card-front.webp", "Business card, front", "TriArc Consultant"],
  ["triarc-card-back.webp", "Business card, back", "TriArc Consultant"],
  ["tpf-card.webp", "Business card", "TPF"],
  ["maeme-card.webp", "Loyalty card", "Maeme's Piri Piri Grill"],
];
const CERTS: In[] = [
  ["certificate2.webp", "Certificate of completion", "Security Compliance Academy"],
  ["pila-cert-close.webp", "Close Protection certificate", "P.I. Leadership Academy"],
  ["pila-cert-design.webp", "Certificate design", "P.I. Leadership Academy"],
];
// Order set by the owner; Azeura (link-only card) follows in the page.
const SITES: In[] = [
  ["triangle-site.webp", "briefcaseninja.com", "Triangle Fingerprinting", "https://briefcaseninja.com/"],
  ["csi-site.webp", "confidentialsecurityinvestigations.com", "Confidential Security & Investigations", "https://confidentialsecurityinvestigations.com/"],
  ["tyde-site.webp", "tyde-link.com", "Tyde Link", "https://tyde-link.com/"],
  ["sca-site.webp", "securitycomplianceacademy.com", "Security Compliance Academy", "https://securitycomplianceacademy.com/"],
];
// Reversed (light) marks that need a dark tile to be visible.
const DARK_TILE = new Set(["triarc-logo-light.webp", "triangle-logo.webp"]);
const SHEET: Record<string, "light" | "dark"> = { "maeme-logos.webp": "light", "realestate-display-1.webp": "dark", "realestate-display-2.webp": "dark", "realestate-display-3.webp": "dark" };
// The eight posts shown first on the Work page (owner's pick), in this order.
const FEATURED = ["sca-trust.webp", "sca-quiet.webp", "pila-someone.webp", "csi-newyear.webp", "tyde-post-10.webp", "tyde-post-3.webp", "pila-career-path.webp", "sca-being-seen.webp"];
// Captions that don't match their image in the portfolio DB.
const TITLE_FIX: Record<string, string> = { "tyde-post-10.webp": "Before you trust, verify", "tyde-post-3.webp": "The best security plan" };
// Projects whose posts aren't shown (azeura: owner's request; the rest: gig images, generic mockups, third-party offers).
const SKIP_POSTS = new Set(["azeura", "rizwa", "pieces", "tycoons"]);
// Individual weak or off-brand posts (hiring notices, closures, duplicates, a non-Maeme's piece).
// Display names where the portfolio DB uses a category label instead of the client.
const BRAND_NAME: Record<string, string> = { courses: "Nexera" };
const SKIP_FILES = new Set(["maeme-main-file.webp", "maeme-jamaica-street-staff-wanted.webp", "maeme-staff-hiring-maemes-aberdeen.webp", "maeme-staff-wanted-2.webp",
  "maeme-we-are-hiring.webp", "maeme-we-are-closed.webp", "maeme-royal-al-riyaz.webp", "maeme-maemes-thumbnails.webp", "maeme-maemes-aldershot-opening-thumbnail.webp",
  "maeme-smaller-heart.webp", "maeme-maemes-hearts.webp", "maeme-opening-soon-50-discount-2.webp", "maeme-lunch-offer-facebook-and-instagram-post-for-grilled.webp",
  "maeme-fillet-burger-a2.webp", "maeme-50-off-copy.webp", "maeme-freshly-prepared-for-you-copy.webp", "maeme-attention-drivers.webp"]);

const cache = new Map<string, Promise<Media | null>>();
function load(src: string, title: string, brand: string, url?: string, logo = false, zoom?: number): Promise<Media | null> {
  const key = src + logo;
  if (!cache.has(key)) cache.set(key, (async () => {
    try {
      const file = path.join(process.cwd(), "public", src);
      const img = sharp(file), m = await img.metadata();
      const dark = logo && DARK_TILE.has(path.basename(src)), fill = false;
      // pre-made 640px thumb (public/portfolio/assets/thumbs) for grids; the original opens in the preview
      const tn = src.startsWith(A) ? "/portfolio/assets/thumbs/" + path.basename(src).replace(/\.(png|jpe?g)$/i, ".webp") : src;
      const thumb = fs.existsSync(path.join(process.cwd(), "public", tn)) ? tn : src;
      const { dominant: d } = await img.stats();
      return { src, w: m.width ?? 1, h: m.height ?? 1, title, brand, dark, fill, url, zoom, thumb, bg: `rgb(${d.r},${d.g},${d.b})` };
    } catch { return null; }
  })());
  return cache.get(key)!;
}
const all = async (list: In[], logo = false) =>
  (await Promise.all(list.map(([f, t, b, u, z]) => load((logo ? "/portfolio/assets/logos/" : A) + f, t, b, u, logo, z)))).filter((x): x is Media => !!x);

export async function loadWork() {
  const { data } = await getPortfolio();
  const postsIn = data.projects.filter((p) => !SKIP_POSTS.has(p.id)).flatMap((p) => (p.posts ?? []).filter((x) => !SKIP_FILES.has(path.basename(x.src))).map((x) => [x.src, x.title || p.name, BRAND_NAME[p.id] ?? p.name] as const));
  const loaded = (await Promise.all(postsIn.map(([s, t, b]) => load(s, TITLE_FIX[path.basename(s)] ?? t, b)))).filter((x): x is Media => !!x);
  const rank = (m: Media) => { const i = FEATURED.indexOf(path.basename(m.src)); return i < 0 ? 99 : i; };
  const posts = loaded.map((m, i) => ({ m, i })).sort((a, b) => rank(a.m) - rank(b.m) || a.i - b.i).map((x) => x.m);
  const [logos, identity, print, cards, certs, sites] = await Promise.all([all(LOGOS, true), all(IDENTITY), all(PRINT), all(CARDS), all(CERTS), all(SITES)]);
  const brands = [...new Set([...logos, ...identity, ...posts, ...print, ...cards, ...sites].map((m) => m.brand))].filter((b) => b !== "Real estate" && b !== "Selected Pieces" && b !== "Courses & Mentorship" && b !== "Rizwa IT Solutions");
  return { logos, identity, posts, print, cards, certs, sites, brands };
}
