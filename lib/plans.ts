// Leads Portal plans as shown on the website. Source of truth is leads-manager/plans.cjs —
// keep the two in step when a plan changes.
const INF = Infinity;

export type Plan = {
  id: string; name: string; price: number | null; pkr?: number; blurb: string; leads: number; countries: number;
  waChecks: number; speed: "Slow" | "Standard" | "Fast"; sitesPerDay: number; emails: boolean; csv: boolean; board: boolean; team: boolean;
  features: string[]; plus?: string; featured?: boolean; custom?: boolean;
};

export const PLANS: Plan[] = [
  { id: "free", name: "Free", price: 0, blurb: "Try the portal on real leads.", leads: 1000, countries: 3, waChecks: 100, speed: "Slow", sitesPerDay: 3, emails: false, csv: false, board: false, team: false,
    features: ["1,000 leads", "3 countries, every category", "Search, filters, tags & notes", "Star leads and track status", "One-tap WhatsApp pitch", "WhatsApp check · 100 / day", "Browser extension collector", "One-click demo website · 3 / day", "Website SEO audit · 3 / day", "Step-by-step video guides"] },
  { id: "starter", name: "Starter", price: 12, pkr: 1500, blurb: "For your first steady pipeline.", leads: 5000, countries: 5, waChecks: 1000, speed: "Standard", sitesPerDay: 5, emails: true, csv: true, board: false, team: false,
    features: ["5,000 leads", "5 countries", "Emails + social links", "Edit contact details", "Email pitches from your own mailbox", "WhatsApp check · 1,000 / day", "Standard scraper speed", "CSV export", "One-click demo website · 5 / day", "Website SEO audits · 10 / day"], plus: "Free" },
  { id: "growth", name: "Growth", price: 29, pkr: 3500, blurb: "More markets, more replies.", leads: 15000, countries: 15, waChecks: 3000, speed: "Standard", sitesPerDay: 10, emails: true, csv: true, board: true, team: false,
    features: ["15,000 leads", "15 countries", "WhatsApp check · 3,000 / day", "Pitch & status board", "Follow-up tracking", "One-click demo websites · 10 / day", "Website SEO audits · 25 / day", "Full site audit (200 pages) · 5 / day"], plus: "Starter" },
  { id: "pro", name: "Pro", price: 59, pkr: 7500, blurb: "Pitch with a ready demo website.", leads: 30000, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 25, emails: true, csv: true, board: true, team: false, featured: true,
    features: ["30,000 leads", "All countries & categories", "Unlimited WhatsApp checks", "Fast scraper", "One-click demo websites · 25 / day", "AI site editor", "Restaurant ordering pages", "AI voice receptionist on every demo", "SEO audits · 60 / day, in your own brand", "Full site audits (300 pages) · 10 / day"], plus: "Growth" },
  { id: "scale", name: "Scale", price: 119, pkr: 15000, blurb: "For teams pitching every day.", leads: 75000, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 50, emails: true, csv: true, board: true, team: true,
    features: ["75,000 leads", "One-click demo websites · 50 / day", "SEO audits · 150 / day", "Full site audits (500 pages) · 30 / day", "Team seats"], plus: "Pro" },
  { id: "enterprise", name: "Enterprise", price: null, blurb: "The full database, run for you.", leads: INF, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 100, emails: true, csv: true, board: true, team: true, custom: true,
    features: ["The full lead database", "Dedicated scraping runs", "Demo websites · 100 / day", "WhatsApp outreach automation", "Priority support & onboarding"], plus: "Scale" },
];

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
