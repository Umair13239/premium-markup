// Central site configuration — brand, contact, socials, feature flags.
// Toggle a social `enabled: false` to hide it everywhere without touching components.

export const siteConfig = {
  name: "PremiumMarkup",
  legalName: "PremiumMarkup Ltd",
  domain: "premiummarkup.com",
  url: "https://premiummarkup.com",
  locale: "en_GB",
  // Private Leads Portal (runs on the office PC, exposed over Tailscale — only
  // your signed-in devices can reach it). Update here if the tailnet URL changes.
  leadsPortalUrl: "https://umair.tail191f85.ts.net",
  tagline: "Hand-built websites that win customers.",
  description:
    "PremiumMarkup is a UK web development and social media agency. We hand-code fast, search-friendly websites for small businesses — no page builders, no bloat.",

  phone: {
    display: "+44 7451 296502",
    tel: "+447451296502",
    whatsapp: "https://wa.me/447451296502",
  },

  email: {
    // Primary public address (shown in the footer, contact, privacy, terms and
    // the structured-data schema).
    primary: "umair@premiummarkup.com",
    // Where contact-form notifications are sent (swappable via env at deploy).
    projects: "projects@premiummarkup.com",
    // Founder address, used on the About signature.
    founder: "umair@premiummarkup.com",
  },

  founder: {
    name: "Umair Abbas",
    role: "Founder & Lead Developer",
  },

  address: {
    // TODO: replace with registered business details.
    region: "United Kingdom",
    companiesHouse: "Company no. TODO",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],

  socials: [
    { name: "Instagram", href: "https://instagram.com/premiummarkup", handle: "@premiummarkup", enabled: true },
    { name: "TikTok", href: "https://tiktok.com/@premiummarkup", handle: "@premiummarkup", enabled: true },
    { name: "LinkedIn", href: "https://linkedin.com/company/premiummarkup", handle: "premiummarkup", enabled: true },
    { name: "Facebook", href: "https://facebook.com/premiummarkup", handle: "premiummarkup", enabled: true },
    { name: "X", href: "https://x.com/premiummarkup", handle: "@premiummarkup", enabled: true },
  ],
} as const;

export type SocialLink = (typeof siteConfig.socials)[number];
export const activeSocials = siteConfig.socials.filter((s) => s.enabled);
