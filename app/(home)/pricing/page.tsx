import type { Metadata } from "next";
import { PLANS, fmt, type Plan } from "@/lib/plans";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: { absolute: "Pricing | Leads Portal by Premium Markup" },
  description: "Start free with 1,000 leads. Paid plans from $9 a month add more leads, unlimited WhatsApp checks and one-click demo websites.",
  alternates: { canonical: "/pricing" },
};

const PORTAL = siteConfig.leadsPortalUrl;
const yes = (b: boolean) => (b ? <span className="ck" aria-label="Included">✓</span> : <span className="no" aria-label="Not included">–</span>);
const ROWS: [string, (p: Plan) => React.ReactNode][] = [
  ["Leads", (p) => fmt(p.leads)],
  ["Countries", (p) => (p.countries === Infinity ? "All" : p.countries)],
  ["WhatsApp checks / day", (p) => fmt(p.waChecks)],
  ["Scraper speed", (p) => p.speed],
  ["Emails + social links", (p) => yes(p.emails)],
  ["CSV export", (p) => yes(p.csv)],
  ["Pitch & status board", (p) => yes(p.board)],
  ["One-click websites / day", (p) => (p.sitesPerDay ? p.sitesPerDay : yes(false))],
  ["Team seats", (p) => yes(p.team)],
  ["Browser extension collector", () => yes(true)],
  ["One-tap WhatsApp pitch", () => yes(true)],
  ["Email from your own mailbox", (p) => yes(p.emails)],
  ["AI site editor", (p) => yes(p.sitesPerDay > 0)],
  ["AI voice receptionist on demos", (p) => yes(p.sitesPerDay > 0)],
  ["WhatsApp outreach automation", (p) => yes(!!p.custom)],
];
const FAQ = [
  ["What counts as a lead?", "One local business in your portal: name, category, city, phone, and where we find them, email, website, rating and social links."],
  ["How does the WhatsApp check work?", "The portal checks each phone number and marks the ones on WhatsApp, so you only message people who can actually reply."],
  ["What is a one-click website?", "A demo site built from the business's own logo, photos and reviews in about 90 seconds. You send the link in your pitch."],
  ["Can I try it before paying?", "Yes. The Free plan gives you 1,000 leads and 25 WhatsApp checks a day, no card needed."],
];

export default function PricingPage() {
  return (
    <>
      <section className="pghead">
        <div className="eyebrow rv">Pricing</div>
        <h1 className="rv" style={{ "--i": 1 } as React.CSSProperties}>Start free.<br /><span style={{ color: "var(--brand)" }}>Grow when it pays.</span></h1>
        <p className="lede rv" style={{ "--i": 2 } as React.CSSProperties}>Every plan includes the full portal. Prices are in US dollars, billed monthly.</p>
      </section>

      <section className="plans" aria-label="Plans">
        {PLANS.map((p, i) => (
          <div key={p.id} className="rv" style={{ "--i": i % 3 } as React.CSSProperties}>
            <article className={"plan" + (p.featured ? " ft" : "")} data-tilt>
              {p.featured && <span className="badge">Includes one-click websites</span>}
              <h2>{p.name}</h2>
              <p className="bl">{p.blurb}</p>
              <div className="pr">{p.custom ? <b>Custom</b> : <><b>${p.price}</b><span>{p.price ? "/ month" : "forever"}</span></>}</div>
              <a className={"pbtn " + (p.featured ? "brand" : "ink")} href={p.custom ? siteConfig.phone.whatsapp : PORTAL}>{p.custom ? "Talk to us" : p.price ? `Choose ${p.name}` : "Start free"}</a>
              {p.plus && <p className="plus">Everything in {p.plus}, plus:</p>}
              <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </article>
          </div>
        ))}
      </section>

      <section className="cmp rv" aria-label="Compare plans">
        <h2>Compare plans</h2>
        <div className="tw">
          <table>
            <thead><tr><th scope="col"><span className="sr">Feature</span></th>{PLANS.map((p) => <th key={p.id} scope="col">{p.name}</th>)}</tr></thead>
            <tbody>{ROWS.map(([label, get]) => (
              <tr key={label}><th scope="row">{label}</th>{PLANS.map((p) => <td key={p.id}>{get(p)}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="faq" aria-label="Questions">
        <h2 className="rv">Questions</h2>
        {FAQ.map(([q, a], i) => (
          <details key={q} className="rv" style={{ "--i": i } as React.CSSProperties}><summary>{q}</summary><p>{a}</p></details>
        ))}
      </section>

      <section className="end in" data-dark>
        <h2>Not sure yet?<br /><span style={{ color: "var(--brand-l)" }}>Start on Free.</span></h2>
        <p>1,000 leads and the full portal. Upgrade when your first client says yes.</p>
        <div className="row" style={{ position: "relative" }}><a className="pbtn brand" href={PORTAL}>Start free</a></div>
      </section>
    </>
  );
}
