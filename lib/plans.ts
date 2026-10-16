// Leads Portal plans as shown on the website. Source of truth is leads-manager/plans.cjs —
// keep the two in step when a plan changes.
const INF = Infinity;

export type Plan = {
  id: string; name: string; price: number | null; blurb: string; leads: number; countries: number;
  waChecks: number; speed: "Slow" | "Standard" | "Fast"; sitesPerDay: number; emails: boolean; csv: boolean; board: boolean; team: boolean;
  features: string[]; plus?: string; featured?: boolean; custom?: boolean;
};

export const PLANS: Plan[] = [
  { id: "free", name: "Free", price: 0, blurb: "Try the portal on real leads.", leads: 1000, countries: 3, waChecks: 100, speed: "Slow", sitesPerDay: 3, emails: false, csv: false, board: false, team: false,
    features: ["1,000 leads", "3 countries, every category", "Search, filters, tags & notes", "Star leads and track status", "One-tap WhatsApp pitch", "WhatsApp check · 100 / day", "Browser extension collector", "One-click demo website · 3 / day", "Website SEO audit · 3 / day", "Step-by-step video guides"] },
  { id: "starter", name: "Starter", price: 9, blurb: "For your first steady pipeline.", leads: 5000, countries: 5, waChecks: 1000, speed: "Standard", sitesPerDay: 5, emails: true, csv: true, board: false, team: false,
    features: ["5,000 leads", "5 countries", "Emails + social links", "Edit contact details", "Email pitches from your own mailbox", "WhatsApp check · 1,000 / day", "Standard scraper speed", "CSV export", "One-click demo website · 5 / day", "Website SEO audits · 10 / day"], plus: "Free" },
  { id: "growth", name: "Growth", price: 19, blurb: "More markets, more replies.", leads: 15000, countries: 15, waChecks: 3000, speed: "Standard", sitesPerDay: 10, emails: true, csv: true, board: true, team: false,
    features: ["15,000 leads", "15 countries", "WhatsApp check · 3,000 / day", "Pitch & status board", "Follow-up tracking", "One-click demo websites · 10 / day", "Website SEO audits · 25 / day", "Full site audit (200 pages) · 5 / day"], plus: "Starter" },
  { id: "pro", name: "Pro", price: 39, blurb: "Pitch with a ready demo website.", leads: 30000, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 25, emails: true, csv: true, board: true, team: false, featured: true,
    features: ["30,000 leads", "All countries & categories", "Unlimited WhatsApp checks", "Fast scraper", "One-click demo websites · 25 / day", "AI site editor", "Restaurant ordering pages", "AI voice receptionist on every demo", "SEO audits · 60 / day, in your own brand", "Full site audits (300 pages) · 10 / day"], plus: "Growth" },
  { id: "scale", name: "Scale", price: 79, blurb: "For teams pitching every day.", leads: 75000, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 50, emails: true, csv: true, board: true, team: true,
    features: ["75,000 leads", "One-click demo websites · 50 / day", "SEO audits · 150 / day", "Full site audits (500 pages) · 30 / day", "Team seats"], plus: "Pro" },
  { id: "enterprise", name: "Enterprise", price: null, blurb: "The full database, run for you.", leads: INF, countries: INF, waChecks: INF, speed: "Fast", sitesPerDay: 100, emails: true, csv: true, board: true, team: true, custom: true,
    features: ["The full lead database", "Dedicated scraping runs", "Demo websites · 100 / day", "WhatsApp outreach automation", "Priority support & onboarding"], plus: "Scale" },
];

export const fmt = (n: number) => (n === INF ? "Unlimited" : n.toLocaleString("en-US"));
