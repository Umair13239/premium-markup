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
    name: "Website Health Checker",
    shortName: "Health check",
    eyebrow: "Find what is holding it back",
    description: "A clear read on the technical issues, friction and missed opportunities in a website.",
    detail: "Use the signal, not a wall of jargon, to decide what to fix first.",
    accent: "#683ce7",
    icon: Gauge,
    points: ["Performance signals", "Accessibility checks", "Prioritised fixes"],
    portalPath: "/?view=health",
    headline: "Know if a website",
    headlineEm: "is up and healthy.",
    lede: "Check whether a site loads, how fast, whether its certificate and domain are in order, and what breaks on a phone. Spot the businesses whose website is down before they do.",
    features: [
      { title: "Up or down", text: "Find sites that are offline, expired or suspended." },
      { title: "Speed and mobile", text: "See how fast it loads and whether it works on a phone." },
      { title: "Security basics", text: "Certificate and domain status at a glance." },
      { title: "Prioritised fixes", text: "The few things worth fixing first, in order." },
    ],
    steps: [
      { title: "Add websites", text: "One at a time or straight from your leads." },
      { title: "Run the check", text: "Results in seconds." },
      { title: "Act on it", text: "Pitch the fix, or fix your own site." },
    ],
    forWho: ["Agencies looking for businesses with broken sites", "Web designers offering maintenance", "Owners who want peace of mind"],
    faqs: [
      { q: "How is this different from the SEO report?", a: "Health is about whether the site works: online, fast, secure. The SEO report is about how well it ranks and reads." },
      { q: "Can it find leads?", a: "Yes. A business with a down or expired website is often the warmest lead in your list." },
    ],
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
