import type { Metadata } from "next";
import { HomeMarkup } from "@/components/home/home-markup";
import { HomeFx } from "@/components/home/home-fx-client";

// Live numbers from the Leads Portal. Unique businesses, not duplicate copies.
// Refreshed every 5 minutes (the portal caches its count for the same time).
export const revalidate = 300;

type PublicStats = { businesses: number; countries: number; updatedAt: string };

async function getStats(): Promise<PublicStats | null> {
  try {
    const res = await fetch("https://leads.premiummarkup.com/api/public-stats", { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as PublicStats;
  } catch {
    return null;
  }
}

const fmt = (n: number) => n.toLocaleString("en-US");
// Round down to the nearest thousand so the number on Google is never more than the real count.
const floorK = (n: number) => Math.floor(n / 1000) * 1000;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStats();
  const headline = s ? `${fmt(floorK(s.businesses))}+ local businesses` : "Local businesses";
  return {
    title: { absolute: "Premium Markup | Leads Portal: find clients, win them faster" },
    description: `${headline} in our Leads Portal, checked for WhatsApp, with one-click demo work to pitch them: websites, SEO audits, UI designs and an AI receptionist. Built in Pakistan.`,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const s = await getStats();
  return (
    <>
      {s ? (
        <section aria-label="Leads Portal numbers" style={{ padding: "18px 20px", textAlign: "center", fontSize: 15, borderBottom: "1px solid var(--color-line, #e5e5ea)" }}>
          <strong>{fmt(s.businesses)}</strong> unique businesses · <strong>{s.countries}</strong> countries in the Leads Portal
          <span style={{ display: "block", fontSize: 12, opacity: 0.7 }}>
            Updated {new Date(s.updatedAt).toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC
          </span>
        </section>
      ) : null}
      <HomeMarkup />
      <HomeFx />
    </>
  );
}
