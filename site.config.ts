// Central site configuration — brand, contact, socials, feature flags.
// Toggle a social `enabled: false` to hide it everywhere without touching components.

export const siteConfig = {
  name: "PremiumMarkup",
  legalName: "PremiumMarkup Ltd",
  domain: "premiummarkup.com",
  url: "https://premiummarkup.com",
  locale: "en_US",
  // Private Leads Portal (runs on the office PC, exposed over Tailscale — only
  // your signed-in devices can reach it). Update here if the tailnet URL changes.
  // Beta: shows a strip at the bottom of every page. Set to false at the full launch.
  beta: true,
  leadsPortalUrl: "https://leads.premiummarkup.com",
  tagline: "Find clients. Win them faster.",
  description:
    "Premium Markup is a Pakistan-based studio behind Leads Portal: 232,000+ unique local businesses checked for WhatsApp, with one-click demo work to pitch them. We also design and build premium websites and brand identities.",

  phone: {
    display: "+92 341 5481381",
    tel: "+923415481381",
    whatsapp: "https://wa.me/923415481381",
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
    region: "Pakistan",
    companiesHouse: "Company no. TODO",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Services", href: "/services" },
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],

  socials: [
    { name: "Instagram", href: "https://instagram.com/premiummarkup", handle: "@premiummarkup", enabled: true },
    { name: "TikTok", href: "https://tiktok.com/@premiummarkup", handle: "@premiummarkup", enabled: true },
    { name: "LinkedIn", href: "https://linkedin.com/company/premiummarkup", handle: "premiummarkup", enabled: false }, // page not created yet (404)
    { name: "Facebook", href: "https://facebook.com/premiummarkup", handle: "premiummarkup", enabled: true },
    { name: "X", href: "https://x.com/premiummarkup", handle: "@premiummarkup", enabled: true },
  ],
} as const;

export type SocialLink = (typeof siteConfig.socials)[number];
export const activeSocials = siteConfig.socials.filter((s) => s.enabled);
