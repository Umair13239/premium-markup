import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: { absolute: "How it works | Leads Portal by Premium Markup" },
  description: "Step by step: how Leads Portal finds businesses, checks their WhatsApp numbers, audits their websites, builds demo work and tracks every pitch. Plus how it compares.",
  alternates: { canonical: "/how-it-works" },
};

const PORTAL = siteConfig.leadsPortalUrl;

const TOPICS = [
  {
    id: "find",
    title: "1. Find businesses",
    summary: "Pick a category and a city, and the portal shows the businesses that match.",
    steps: [
      "Open Collect leads from the sidebar.",
      "Type a category, for example dentist or security company.",
      "Add one or more cities, one per line.",
      "Press Run Pipeline. Results are saved to your database as they come in.",
    ],
    shot: { src: "/home/feature-collect.webp", alt: "Collect Leads screen: category, cities and pipeline options", w: 1800, h: 900 },
  },
  {
    id: "check",
    title: "2. Check WhatsApp",
    summary: "See which numbers are on WhatsApp before you spend time on them.",
    steps: [
      "Open WhatsApp Check and link your WhatsApp once.",
      "Press Check WhatsApp numbers. It runs in the background, so you can keep working.",
      "Each lead gets a clear status: on WhatsApp, not on WhatsApp, or not checked yet.",
      "Use the filters to show only the leads you can message on WhatsApp.",
    ],
    shot: { src: "/home/feature-whatsapp.webp", alt: "WhatsApp check progress and counts", w: 1472, h: 660 },
  },
  {
    id: "audit",
    title: "3. Audit their website",
    summary: "Each lead with a website gets a check: speed, SEO basics, and whether the site is down.",
    steps: [
      "Open Websites or SEO Audit from the sidebar.",
      "Run an audit on one site or on a whole list.",
      "Read the plain-language findings: what is wrong, why it matters, and how to fix it.",
      "Use the findings as the opening line of your message.",
    ],
    shot: null,
  },
  {
    id: "demo",
    title: "4. Build a demo for them",
    summary: "Make a quick demo website for a lead, so your pitch shows the work instead of promising it.",
    steps: [
      "Open the lead and press Build demo (uses your daily demo limit).",
      "Review the demo, then share its link in your message.",
      "Each plan has a daily limit, shown next to the button.",
    ],
    shot: null,
  },
  {
    id: "pitch",
    title: "5. Pitch and track",
    summary: "Send your message from the portal and follow every lead on one board.",
    steps: [
      "Write the message yourself, or start from a draft.",
      "Send by WhatsApp in one tap, or by email from your own mailbox.",
      "Move the lead across the status board: New, Contacted, In conversation, Won or Lost.",
      "Set a follow-up date, and the portal reminds you when it is due.",
    ],
    shot: null,
  },
  {
    id: "blog",
    title: "6. Publish a blog that ranks",
    summary: "Write blog posts in the portal, check their SEO score, and publish to the website.",
    steps: [
      "Open Blog & SEO and press New post.",
      "Write the article and upload images by dragging them in.",
      "Check the SEO panel: it shows what is missing, and why it matters, before you publish.",
      "Press Publish. The post goes live on the website within about a minute.",
    ],
    shot: null,
  },
];

const COMPARE: [string, string, string][] = [
  ["Business database", "Ready-made list from public listings in 25 countries", "Apollo.io, ZoomInfo, Lusha (B2B contacts); Outscraper, Apify (Google Maps scraping)"],
  ["WhatsApp number check", "Built in: runs in the background, status per lead", "No standard tool. WATI and Respond.io are messaging platforms, not list checkers"],
  ["Website audit per lead", "Built in: plain-language findings with a fix for each", "Ahrefs and SEMrush site audits, Screaming Frog (desktop), Google PageSpeed Insights (free)"],
  ["One-click demo website", "Built in, from the lead's own details", "Durable, Wix ADI, Framer AI (you build and set up each site)"],
  ["AI receptionist", "Built into every demo website", "Goodcall, Smith.ai"],
  ["Outreach and pipeline", "WhatsApp and email from the portal, with a status board", "HubSpot CRM, Pipedrive; Instantly or Lemlist for email sending"],
  ["Blog with SEO score", "Built in: live score, what is missing and why", "Yoast SEO and Rank Math (WordPress plugins); Surfer SEO for content scoring"],
  ["Free to start", "Free plan: 1,000 leads, 100 WhatsApp checks and 3 websites a day", "Most of these bill monthly per seat, with a short trial or none"],
];

export default function HowItWorksPage() {
  return (
    <main className="how">
      <section className="how-hero">
        <div className="eyebrow">How it works</div>
        <h1>From a city name to a paid client, in six steps.</h1>
        <p>Here is exactly what the portal does, topic by topic, so you can see it working before you sign up.</p>
        <div className="how-cta">
          <a className="pbtn ink" href={PORTAL}>Start free</a>
          <a className="how-link" href="#compare">See how it compares ↓</a>
        </div>
      </section>

      <section className="how-video" aria-label="Explainer video">
        <video controls playsInline preload="metadata" poster="/home/general-poster.webp">
          <source src="/home/general.webm" type="video/webm" />
          <source src="/home/general.mp4" type="video/mp4" />
        </video>
        <p>A 75-second overview: signing up, the dashboard, and every tool, from collecting leads to one-click websites, SEO and blogs.</p>
      </section>

      <section className="how-video" aria-label="Video tour">
        <video controls playsInline preload="metadata" poster="/home/portal-shot.png">
          <source src="/home/portal-tour.webm" type="video/webm" />
          <source src="/home/portal-tour.mp4" type="video/mp4" />
        </video>
        <p>A 36-second tour: the dashboard, collecting leads for a category and cities, and the blog editor with its SEO score.</p>
      </section>

      <nav className="how-toc" aria-label="Topics">
        {TOPICS.map((t) => (
          <a key={t.id} href={"#" + t.id}>{t.title}</a>
        ))}
      </nav>

      {TOPICS.map((t) => (
        <section key={t.id} id={t.id} className="how-topic">
          <h2>{t.title}</h2>
          <p className="how-sum">{t.summary}</p>
          <ol className="how-steps">
            {t.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {t.shot ? (
            <figure className="how-shot">
              <Image src={t.shot.src} alt={t.shot.alt} width={t.shot.w} height={t.shot.h} sizes="(max-width: 900px) 100vw, 900px" />
            </figure>
          ) : null}
        </section>
      ))}

      <section id="compare" className="how-compare">
        <h2>How it compares</h2>
        <p className="how-sum">Each row names the tools people usually pay for separately. Leads Portal does the same job in one place.</p>
        <div className="how-table-wrap">
          <table className="how-table">
            <thead>
              <tr><th scope="col">What you need</th><th scope="col">Leads Portal</th><th scope="col">Tools people use instead</th></tr>
            </thead>
            <tbody>
              {COMPARE.map(([a, b, c]) => (
                <tr key={a}><th scope="row">{a}</th><td>{b}</td><td>{c}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="how-note">Tool names are examples from each category, not a full list and not an endorsement. Check each tool&apos;s own pricing before you compare.</p>
      </section>

      <section className="how-end">
        <h2>Try the first step now.</h2>
        <p>Pick one category and one city. You will see real businesses in a few minutes.</p>
        <a className="pbtn ink" href={PORTAL}>Start free</a>
      </section>
    </main>
  );
}
