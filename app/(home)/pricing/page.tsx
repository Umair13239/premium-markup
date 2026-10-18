import type { Metadata } from "next";
import { PLANS, fmt, type Plan } from "@/lib/plans";
import { siteConfig } from "@/site.config";
import { JsonLd, breadcrumb, pageMeta } from "@/lib/seo";
import { RegionProvider, RegionToggle, Price } from "@/components/home/region";

export const metadata: Metadata = pageMeta({
  title: "Pricing | Leads Portal by Premium Markup",
  description: "Start free with 1,000 leads. Paid plans from Rs 1,500 a month in Pakistan or $12 elsewhere add more leads, unlimited WhatsApp checks and one-click demo websites.",
  path: "/pricing",
});

const PORTAL = siteConfig.leadsPortalUrl;
const yes = (b: boolean) => (b ? <span className="ck" aria-label="Included">✓</span> : <span className="no" aria-label="Not included">–</span>);
const ROWS: [string, (p: Plan) => React.ReactNode][] = [
  ["Leads", (p) => fmt(p.leads)],
  ["Countries", (p) => (p.countries === Infinity ? "All" : p.countries)],
  ["WhatsApp number checks / day", (p) => fmt(p.waChecks)],
  ["Lead collection speed", (p) => p.speed],
  ["Emails + social links", (p) => yes(p.emails)],
  ["CSV export", (p) => yes(p.csv)],
  ["Board to track pitches and replies", (p) => yes(p.board)],
  ["Demo websites per day", (p) => (p.sitesPerDay ? p.sitesPerDay : yes(false))],
  ["Team seats", (p) => yes(p.team)],
  ["Browser extension collector", () => yes(true)],
  ["One-tap WhatsApp pitch", () => yes(true)],
  ["Email from your own mailbox", (p) => yes(p.emails)],
  ["AI site editor", (p) => yes(p.sitesPerDay > 0)],
  ["WhatsApp outreach automation", (p) => yes(!!p.custom)],
];
const FAQ = [
  ["What counts as a lead?", "One local business in your portal: name, category, city, phone, and where we find them, email, website, rating and social links."],
  ["How does the WhatsApp check work?", "The portal checks each phone number and marks the ones on WhatsApp, so you only message people who can actually reply."],
  ["What is a one-click website?", "A demo site built from the business's own logo, photos and reviews in about 90 seconds. You send the link in your pitch."],
  ["Which currency do I pay in?", "Pakistan pays in PKR through local methods such as JazzCash and Easypaisa. Everywhere else, prices are shown in your own currency for reference and billed in US dollars at the listed USD price."],
  ["Can I try it before paying?", `Yes. The Free plan gives you ${fmt(PLANS[0].leads)} leads and ${fmt(PLANS[0].waChecks)} WhatsApp checks a day, no card needed.`],
];

export default function PricingPage() {
  const schema = [
    breadcrumb([{ name: "Pricing", path: "/pricing" }]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Leads Portal",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${siteConfig.url.replace(/\/$/, "")}/pricing`,
      description: "Find local businesses, check WhatsApp, audit their websites and pitch with a one-click demo website.",
      offers: PLANS.filter((p) => p.price !== null).map((p) => ({ "@type": "Offer", name: p.name, price: String(p.price), priceCurrency: "USD", url: `${siteConfig.url.replace(/\/$/, "")}/pricing` })),
    },
  ];
  return (
    <RegionProvider>
      <JsonLd data={schema} />
      <section className="pghead">
        <div className="eyebrow rv">Pricing</div>
        <h1 className="rv" style={{ "--i": 1 } as React.CSSProperties}>Start free.<br /><span style={{ color: "var(--brand)" }}>Grow when it pays.</span></h1>
        <p className="lede rv" style={{ "--i": 2 } as React.CSSProperties}>Every plan includes the full portal, billed monthly. Prices follow your location: local pricing in Pakistan, and your own currency elsewhere.</p>
      </section>

      <div className="rgwrap"><RegionToggle /></div>
      <section className="plans" aria-label="Plans">
        {PLANS.map((p, i) => (
          <div key={p.id} className="rv" style={{ "--i": i % 3 } as React.CSSProperties}>
            <article className={"plan" + (p.featured ? " ft" : "")} data-tilt>
              {p.featured && <span className="badge">Includes one-click websites</span>}
              <h2>{p.name}</h2>
              <p className="bl">{p.blurb}</p>
              <div className="pr"><Price plan={p} /></div>
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

      <section className="end in">
        <h2>Not sure yet?<br /><span style={{ color: "var(--brand)" }}>Start on Free.</span></h2>
        <p>1,000 leads and the full portal. Upgrade when your first client says yes.</p>
        <div className="row" style={{ position: "relative" }}><a className="pbtn brand" href={PORTAL}>Start free</a></div>
      </section>
    </RegionProvider>
  );
}
