// Leads Portal plans as shown on the website. Source of truth is leads-manager/plans.cjs —
// keep the two in step when a plan changes.
const INF = Infinity;

export type Plan = {
  id: string; name: string; price: number | null; blurb: string; leads: number; countries: number;
  waChecks: number; speed: "Slow" | "Standard" | "Fast"; sitesPerDay: number; emails: boolean; csv: boolean; board: boolean; team: boolean;
  features: string[]; plus?: string; featured?: boolean; custom?: boolean;
};

export const PLANS: Plan[] = [
  { id: "free", name: "Free", price: 0, blurb: "Try the portal on real leads.", leads: 1000, countries: 3, waChecks: 25, speed: "Slow", sitesPerDay: 1, emails: false, csv: false, board: false, team: false,
    features: ["1,000 leads", "3 countries, every category", "Search, filters, tags & notes", "Star leads and track status", "One-tap WhatsApp pitch", "WhatsApp check · 25 / day", "Browser extension collector", "One-click demo website · 1 / day", "Website SEO audit · 1 / day", "Step-by-step video guides"] },
  { id: "starter", name: "Starter", price: 19, blurb: "For your first steady pipeline.", leads: 5000, countries: 5, waChecks: 500, speed: "Standard", sitesPerDay: 0, emails: true, csv: true, board: false, team: false,
    features: ["5,000 leads", "5 countries", "Emails + social links", "Edit contact details", "Email pitches from your own mailbox", "WhatsApp check · 500 / day", "Standard scraper speed", "CSV export", "Website SEO audits · 5 / day"], plus: "Free" },
  { id: "growth", name: "Growth", price: 39, blurb: "More markets, more replies.", leads: 15000, countries: 15, waChecks: 2000, speed: "Standard", sitesPerDay: 0, emails: true, csv: true, board: true, team: false,
    features: ["15,000 leads", "15 countries", "WhatsApp check · 2,000 / day", "Pitch & status board", "Follow-up tracking", "Website SEO audits · 15 / day", "Full site audit (100 pages) · 1 / day"], plus: "Starter" },
  { id: "pro", name: "Pro", price: 69, blurb: "Pitch with a ready demo website.", leads: 30000, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 3, emails: true, csv: true, board: true, team: false, featured: true,
    features: ["30,000 leads", "All countries & categories", "Unlimited WhatsApp checks", "Fast scraper", "One-click demo websites · 3 / day", "AI site editor", "Restaurant ordering pages", "AI voice receptionist on every demo", "SEO audits · 40 / day, in your own brand", "Full site audits (300 pages) · 5 / day"], plus: "Growth" },
  { id: "scale", name: "Scale", price: 129, blurb: "For teams pitching every day.", leads: 75000, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 10, emails: true, csv: true, board: true, team: true,
    features: ["75,000 leads", "One-click demo websites · 10 / day", "SEO audits · 100 / day", "Full site audits (500 pages) · 20 / day", "Team seats"], plus: "Pro" },
  { id: "enterprise", name: "Enterprise", price: null, blurb: "The full database, run for you.", leads: INF, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 50, emails: true, csv: true, board: true, team: true, custom: true,
    features: ["The full lead database", "Dedicated scraping runs", "Demo websites · 50 / day", "WhatsApp outreach automation", "Priority support & onboarding"], plus: "Scale" },
];

export const fmt = (n: number) => (n === INF ? "Unlimited" : n.toLocaleString("en-US"));
