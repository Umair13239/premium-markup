import { FileText, Gauge, Headset, LayoutTemplate, PenTool } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/site.config";

// The product suite. The /products overview and each /products/[slug] page read from here.
// Every product lives inside the Leads Portal; `portalPath` opens it there for the signed-in user.

export type ProductId = "receptionist" | "mockup" | "health" | "builder" | "seo";

export type Product = {
  id: ProductId;
  slug: string;
  number: string;
  name: string;
  shortName: string;
  eyebrow: string;
  description: string;
  detail: string;
  accent: string;
  icon: LucideIcon;
  points: string[];
  portalPath: string;
  // detail page
  headline: string;
  headlineEm: string;
  lede: string;
  features: { title: string; text: string }[];
  steps: { title: string; text: string }[];
  forWho: string[];
  faqs: { q: string; a: string }[];
  // Standalone product pages (PRODUCTS-PLAN.md). Optional until each product's step is done.
  seoTitle?: string;
  media?: {
    dir: string; // public/products/<slug>
    film?: { alt: string; captions: { k: string; t: string }[] };
    og?: string;
    shots: { src: string; alt: string; w: number; h: number }[]; // same order as `features`
  };
  freeTool?: "health";
  marquee?: string[];
  pricing?: { free: string[]; paid: string[] };
};

export const products: Product[] = [
  {
    id: "receptionist",
    slug: "ai-receptionist",
    number: "01",
    name: "AI Receptionist",
    shortName: "Receptionist",
    eyebrow: "Answer every visitor",
    description: "A voice receptionist on a business's website that answers questions and takes bookings, day or night.",
    detail: "Set it up from the business details, test it yourself, then send the client a demo link they can talk to.",
    accent: "#683ce7",
    icon: Headset,
    points: ["Talks in English, Urdu and Arabic", "Takes bookings by voice", "Shareable demo link"],
    portalPath: "/?view=receptionist",
    headline: "A receptionist that never",
    headlineEm: "leaves the desk.",
    lede: "Visitors tap the button on the website and ask out loud: opening hours, prices, location, a booking for Saturday. The receptionist answers from the business's own details and passes the booking on by WhatsApp, email or a call.",
    features: [
      { title: "Built from real details", text: "Services, prices, hours and FAQs come from what you enter, so it never invents an answer." },
      { title: "Books, then hands off", text: "It confirms the booking with the visitor, then sends it to the business on WhatsApp, by email, or asks them to call." },
      { title: "Speaks their language", text: "It answers in the language the visitor uses and switches with them mid-conversation." },
      { title: "Demo in one link", text: "Share a private demo link on WhatsApp or by email, straight from the portal, and turn it off any time." },
    ],
    steps: [
      { title: "Add the business", text: "Pick it from your leads or paste a few lines. AI fills the form." },
      { title: "Test the call", text: "Talk to it yourself before anyone else hears it." },
      { title: "Pitch the demo", text: "Send the link by WhatsApp or one-click email, from your own account." },
    ],
    forWho: ["Agencies selling to clinics, salons and restaurants", "Businesses that miss enquiries after hours", "Freelancers adding an AI service to their offer"],
    faqs: [
      { q: "Does it answer phone calls?", a: "No. It lives on the website: visitors talk to it from their browser. It does not pick up the business's phone line." },
      { q: "What happens to a booking?", a: "The visitor confirms it, then sends it to the business on WhatsApp. If the business isn't on WhatsApp it goes by email, or the visitor gets a call button." },
    ],
  },
  {
    id: "builder",
    slug: "website-builder",
    number: "02",
    name: "Website Builder",
    shortName: "Builder",
    eyebrow: "Move from blank page to live",
    description: "Build a focused, on-brand website for a business in minutes, with its logo, colours and photos.",
    detail: "A faster path from a lead in your list to a live demo site you can show the owner.",
    accent: "#683ce7",
    icon: LayoutTemplate,
    points: ["Uses their logo and colours", "Responsive by default", "Edit by chatting"],
    portalPath: "/?view=sites",
    headline: "From a lead to a live site,",
    headlineEm: "before the first call.",
    lede: "Pick a business from your leads and the builder researches it, takes its logo and colours, writes the copy and publishes a site on its own address. Change anything by asking the editor in plain words.",
    features: [
      { title: "Their brand, not a template", text: "Colours come from the business's own logo and photos, so the site looks like theirs." },
      { title: "Copy from real research", text: "Services, hours and reviews come from what the business has published." },
      { title: "Edit by chatting", text: "\"Make the hero darker\", \"add the menu\": the editor applies it and shows you the result." },
      { title: "AI receptionist included", text: "Every site carries the voice receptionist, so the demo answers questions on its own." },
    ],
    steps: [
      { title: "Pick a lead", text: "Any business in your list without a good website." },
      { title: "Build", text: "About two minutes from click to a live link." },
      { title: "Show the owner", text: "Send the link. Seeing their own site does the selling." },
    ],
    forWho: ["Web designers who pitch with a demo", "Agencies running outreach at volume", "Freelancers who want proof before the call"],
    faqs: [
      { q: "Whose photos does it use?", a: "The business's own: its logo and published photos, plus licensed stock where something is missing." },
      { q: "Is it included in every plan?", a: "One-click websites are part of the higher Leads Portal plans. See pricing for the details." },
    ],
  },
  {
    id: "seo",
    slug: "seo-report",
    number: "03",
    name: "SEO Checker & Report Maker",
    shortName: "SEO reports",
    eyebrow: "Make the work easy to understand",
    description: "Turn search findings into a report clients can scan, understand and act on.",
    detail: "A better way to connect technical recommendations to visible business outcomes.",
    accent: "#683ce7",
    icon: FileText,
    points: ["Readable scorecards", "Issue summaries", "Client-ready reports"],
    portalPath: "/?view=seo",
    headline: "SEO findings a client",
    headlineEm: "actually reads.",
    lede: "Run a check on any website and get scores for SEO, speed and accessibility, the issues behind them in plain words, and a report you can send as it is.",
    features: [
      { title: "Clear scores", text: "SEO, performance, accessibility and best practices, each out of 100." },
      { title: "Plain-language issues", text: "What is wrong and why it matters, without the jargon." },
      { title: "Quick wins first", text: "Fixes are ordered by effort and impact, so the next step is obvious." },
      { title: "Ready to send", text: "A clean report you can attach to a pitch or a proposal." },
    ],
    steps: [
      { title: "Enter a website", text: "Or run it from a lead in your list." },
      { title: "Read the scores", text: "See what holds the site back." },
      { title: "Send the report", text: "Lead the conversation with real findings." },
    ],
    forWho: ["SEO freelancers and agencies", "Web designers pitching a redesign", "Owners checking their own site"],
    faqs: [
      { q: "Where do the scores come from?", a: "From a live check of the page, the same kind of measurements search engines use for speed and quality." },
      { q: "Can I check sites from my leads?", a: "Yes. Any lead with a website can be checked from inside the portal." },
    ],
  },
  {
    id: "health",
    slug: "website-health",
    number: "04",
    name: "Website Health",
    shortName: "Health check",
    eyebrow: "Free website checker",
    description: "A free report on any website: spam score, email setup, blacklists, SSL and domain age.",
    detail: "Paste a link and see what is hurting the site and its email, in about 15 seconds.",
    accent: "#683ce7",
    icon: Gauge,
    points: ["Spam score and authority", "SPF, DKIM and DMARC", "Blacklists and SSL"],
    portalPath: "/health",
    seoTitle: "Free Website Health Check: Spam Score, SPF, DKIM, DMARC, Blacklists",
    headline: "Is this website",
    headlineEm: "healthy?",
    lede: "Paste a link and get one report: spam score, email setup (SPF, DKIM, DMARC), spam blacklists, SSL, domain age and tech stack. Free, in about 15 seconds.",
    features: [
      { title: "Spam score and authority", text: "Two scores from public data: how established the domain is, and how risky it looks to spam filters." },
      { title: "Email deliverability", text: "The mail provider, SPF, DKIM and DMARC: the records that decide whether its emails reach the inbox." },
      { title: "Spam blacklists", text: "The domain and its server checked against six blacklists, including Spamhaus, SpamCop and Barracuda." },
      { title: "SSL and domain", text: "Whether the certificate is valid and when it runs out, the registrar, and when the domain expires." },
      { title: "What to fix first", text: "The problems it found, listed in order and written in plain words." },
    ],
    steps: [
      { title: "Paste a link", text: "Any website, yours or a client's. No sign-up for the first three." },
      { title: "Seven checks run", text: "Mail setup, blacklists, SSL, domain records and the site itself." },
      { title: "Fix what matters", text: "Read the scores, then work down the short list." },
    ],
    forWho: ["Agencies checking a prospect before the first call", "Owners whose emails keep landing in spam", "Freelancers who want an easy way to open a conversation"],
    faqs: [
      { q: "What is the spam score?", a: "Our estimate from 0 to 100 of how risky a domain looks to spam filters, based on blacklists, domain age and DNS setup. Lower is better. It is not the Moz Spam Score." },
      { q: "What are SPF, DKIM and DMARC?", a: "Three DNS records that prove an email really comes from that domain. Without them, inboxes are more likely to send the mail to spam." },
      { q: "Is it free?", a: "Yes. Three checks a day without an account, fifteen a day with a free account." },
      { q: "How is this different from the SEO report?", a: "Health is about whether the site and its email are set up properly. The SEO report is about how well the site ranks and loads." },
      { q: "Can I check many sites at once?", a: "On the paid plan, yes: paste up to 20 websites and download the results as a CSV." },
    ],
    media: {
      dir: "/products/website-health",
      og: "/products/website-health/og.png",
      film: {
        alt: "Website Health checking example.com: seven checks run, then the scores and the full report",
        captions: [
          { k: "Paste a link", t: "Type any website and press Check." },
          { k: "Seven checks run", t: "Mail setup, blacklists, SSL and the domain, one after another." },
          { k: "Read the scores", t: "Health, authority and spam score at a glance." },
          { k: "See every detail", t: "Email, blacklists, security and the tech the site is built with." },
        ],
      },
      shots: [
        { src: "/products/website-health/ui-scores.webp", alt: "Score cards for example.com: health 82, authority 70, spam score 0 and a domain age of 31 years", w: 1600, h: 316 },
        { src: "/products/website-health/ui-email.webp", alt: "Email deliverability card showing SPF set, DMARC set to reject and DKIM found", w: 1050, h: 752 },
        { src: "/products/website-health/ui-blacklists.webp", alt: "Spam blacklist card with Spamhaus, SURBL, URIBL, SpamCop and Barracuda all clean", w: 1050, h: 752 },
        { src: "/products/website-health/ui-security.webp", alt: "Security and domain card showing a valid SSL certificate, its issuer and expiry, and the registrar", w: 1050, h: 582 },
        { src: "/products/website-health/ui-fix.webp", alt: "What to fix first: a numbered list of problems found on the site", w: 1600, h: 288 },
      ],
    },
    freeTool: "health",
    marquee: ["Authority score", "Spam score", "SPF", "DKIM", "DMARC", "Spamhaus", "SpamCop", "Barracuda", "SSL expiry", "Domain age", "Registrar", "Tech stack", "Mobile friendly"],
    pricing: {
      free: ["3 checks a day without an account", "15 a day with a free account", "The full report and a share link"],
      paid: ["200 checks a day", "Bulk checks with CSV export", "PDF reports"],
    },
  },
  {
    id: "mockup",
    slug: "mockup-designer",
    number: "05",
    name: "Mockup Designer",
    shortName: "Mockups",
    eyebrow: "Present the idea",
    description: "Turn a logo into polished, presentation-ready mockups in minutes.",
    detail: "For proposals, launches and the moment a client needs to see the idea in the real world.",
    accent: "#683ce7",
    icon: PenTool,
    points: ["Brand-ready scenes", "Fast visual variations", "Exportable client assets"],
    portalPath: "/brand-kit.html",
    headline: "Show the brand",
    headlineEm: "in the real world.",
    lede: "Upload a logo and see it on signs, cups, shirts and stationery, with light and texture that match each scene. Export the set and drop it straight into a proposal.",
    features: [
      { title: "Realistic scenes", text: "Logos sit on the surface with the right light, shadow and texture." },
      { title: "Reads the surface", text: "Light or dark logos adapt to the material so they stay visible." },
      { title: "Fine control", text: "Adjust light, shadow and texture per scene when you want to." },
      { title: "Export the set", text: "Download presentation-ready images in one go." },
    ],
    steps: [
      { title: "Upload a logo", text: "PNG or SVG, light or dark." },
      { title: "Pick scenes", text: "See it across the whole set at once." },
      { title: "Export", text: "Ready for the proposal or the launch post." },
    ],
    forWho: ["Graphic designers presenting a logo", "Agencies pitching a rebrand", "Owners launching a new brand"],
    faqs: [
      { q: "What logo files work?", a: "PNG with a transparent background or SVG work best." },
      { q: "Can I use the images commercially?", a: "Yes, for presenting your own or your client's brand." },
    ],
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const portalLink = (p: Product) => siteConfig.leadsPortalUrl.replace(/\/$/, "") + p.portalPath;
