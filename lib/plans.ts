// Leads Portal plans as shown on the website. Source of truth is leads-manager/plans.cjs —
// keep the two in step when a plan changes.
const INF = Infinity;

export type Plan = {
  id: string; name: string; price: number | null; categories?: number | null; public?: boolean; pkr?: number; blurb: string; leads: number; countries: number;
  waChecks: number; speed: "Slow" | "Standard" | "Fast"; sitesPerDay: number; emails: boolean; csv: boolean; board: boolean; team: boolean;
  features: string[]; plus?: string; featured?: boolean; custom?: boolean;
};

export const PLANS: Plan[] = [
  { id: "free", name: "Free", price: 0, blurb: "Try the portal on real leads.", leads: 350, countries: 1, categories: 2, waChecks: 100, speed: "Slow", sitesPerDay: 3, emails: false, csv: false, board: false, team: false,
    features: ["350 business leads (name, phone, address, website)", "Get leads from 1 country you pick, in 2 industries", "Search, filter, tag and add notes to each lead", "Save favourites and mark each lead: contacted, replied, won", "Send a ready-made WhatsApp message in one tap", "Check 100 phone numbers a day to see who is on WhatsApp", "Chrome add-on to save leads while you browse", "Build 3 demo websites a day in one click", "Website health reports for businesses, 3 a day", "Step-by-step video guides"] },
  { id: "starter", name: "Starter", price: 12, pkr: 2500, blurb: "For your first steady pipeline.", leads: 2000, countries: 3, categories: 5, waChecks: 1000, speed: "Standard", sitesPerDay: 5, emails: true, csv: true, board: false, team: false,
    features: ["2,000 business leads (name, phone, address, website)", "Get leads from 3 countries you pick", "Up to 5 industries of your choice", "Email addresses and social media links for each lead", "Fix or add contact details yourself", "Send pitch emails from your own email address", "Check 1,000 phone numbers a day to see who is on WhatsApp", "Normal lead-collection speed", "Download your leads as an Excel/CSV file", "Build 5 demo websites a day in one click", "Website health reports for businesses, 10 a day"], plus: "Free" },
  { id: "growth", name: "Growth", price: 29, pkr: 3500, blurb: "More markets, more replies.", leads: 5000, countries: 10, categories: 15, waChecks: 3000, speed: "Standard", sitesPerDay: 10, emails: true, csv: true, board: true, team: false,
    features: ["5,000 business leads (name, phone, address, website)", "Get leads from 10 countries you pick", "Up to 15 industries of your choice", "Check 3,000 phone numbers a day to see who is on WhatsApp", "Board view to see who you pitched and who replied", "Reminders to follow up with each lead", "Build 10 demo websites a day in one click", "Website health reports for businesses, 25 a day", "Deep website check up to 200 pages, 5 a day"], plus: "Starter" },
  { id: "pro", name: "Pro", price: 59, pkr: 7500, blurb: "Pitch with a ready demo website.", leads: 10000, countries: INF, categories: null, waChecks: INF, speed: "Fast", sitesPerDay: 25, emails: true, csv: true, board: true, team: false, featured: true,
    features: ["10,000 business leads (name, phone, address, website)", "Get leads from every country and every industry", "Unlimited checks of who is on WhatsApp", "Fast lead collection", "Build 25 demo websites a day in one click", "AI editor to change the demo website by typing", "Online food-ordering pages for restaurants", "AI voice assistant on every demo website that answers visitors", "Website health reports, 60 a day, with your own branding", "Deep website check up to 300 pages, 10 a day"], plus: "Growth" },
  { id: "scale", public: false, name: "Scale", price: 119, pkr: 15000, blurb: "For teams pitching every day.", leads: 75000, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 50, emails: true, csv: true, board: true, team: true,
    features: ["75,000 business leads (name, phone, address, website)", "Build 50 demo websites a day in one click", "Website health reports for businesses, 150 a day", "Deep website check up to 500 pages, 30 a day", "Add team members to your account"], plus: "Pro" },
  { id: "enterprise", public: false, name: "Enterprise", price: null, blurb: "The full database, run for you.", leads: INF, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 100, emails: true, csv: true, board: true, team: true, custom: true,
    features: ["Access to the whole lead database", "Collection runs set up just for you", "Build 100 demo websites a day in one click", "Automatic WhatsApp messaging to your leads", "Priority support and setup help"], plus: "Scale" },
];
// Plans shown on the website and at signup (Scale and Enterprise are hidden; existing accounts keep them).
export const PUBLIC_PLANS = PLANS.filter((p) => p.public !== false);

export const fmt = (n: number) => (n === INF ? "Unlimited" : n.toLocaleString("en-US"));

const EUR = "AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK".split(" ");
const CUR: Record<string, [string, string, number]> = { PK: ["PKR", "Rs ", 1], IN: ["INR", "₹", 84], BD: ["BDT", "৳", 120], LK: ["LKR", "Rs ", 300], NP: ["NPR", "Rs ", 135], AE: ["AED", "AED ", 3.67], SA: ["SAR", "SAR ", 3.75],
  QA: ["QAR", "QAR ", 3.64], KW: ["KWD", "KWD ", 0.31], OM: ["OMR", "OMR ", 0.385], BH: ["BHD", "BHD ", 0.377], JO: ["JOD", "JOD ", 0.71], EG: ["EGP", "E£", 49], TR: ["TRY", "₺", 34],
  GB: ["GBP", "£", 0.78], CH: ["CHF", "CHF ", 0.88], SE: ["SEK", "SEK ", 10.5], NO: ["NOK", "NOK ", 10.8], DK: ["DKK", "DKK ", 6.9], PL: ["PLN", "PLN ", 4], CA: ["CAD", "C$", 1.37], AU: ["AUD", "A$", 1.52],
  NZ: ["NZD", "NZ$", 1.65], SG: ["SGD", "S$", 1.34], MY: ["MYR", "RM ", 4.4], ID: ["IDR", "Rp ", 15800], PH: ["PHP", "₱", 57], JP: ["JPY", "¥", 150], ZA: ["ZAR", "R ", 18], NG: ["NGN", "₦", 1500],
  KE: ["KES", "KSh ", 129], MX: ["MXN", "MX$", 18], BR: ["BRL", "R$", 5.5], US: ["USD", "$", 1] };
EUR.forEach((c) => { CUR[c] = ["EUR", "€", 0.92]; });
function niceRound(x: number) { return x >= 10000 ? Math.round(x / 1000) * 1000 : x >= 1000 ? Math.round(x / 100) * 100 : x >= 100 ? Math.round(x / 10) * 10 : x >= 10 ? Math.round(x) : Math.round(x * 2) / 2; }
/* What one visitor should see for a plan: { amount, currency, label, usd, local } */
export function priceFor(plan: Plan, country: string) {
  const cc = String(country || "").toUpperCase(), c: [string, string, number] = CUR[cc] || ["USD", "$", 1], usd = plan.price || 0;
  if (!usd) return { amount: 0, currency: c[0], label: c[1] + "0", usd: 0, local: cc === "PK" };
  const amount = cc === "PK" && plan.pkr ? plan.pkr : c[0] === "USD" ? usd : niceRound(usd * c[2]);
  return { amount, currency: c[0], label: c[1] + amount.toLocaleString("en-US"), usd, local: c[0] !== "USD" };
}

export function currencyOf(country: string) { const c = CUR[String(country || "").toUpperCase()] || ["USD", "$", 1]; return { currency: c[0], symbol: c[1] }; }
