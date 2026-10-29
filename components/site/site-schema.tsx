import { siteConfig, activeSocials } from "@/site.config";

// Organization + WebSite JSON-LD, rendered on every public page.
export function SiteSchema() {
  const base = siteConfig.url.replace(/\/$/, "");
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: base,
    image: `${base}/og/home.png`,
    description: siteConfig.description,
    email: siteConfig.email.primary,
    telephone: siteConfig.phone.tel,
    areaServed: ["Pakistan", "Worldwide"],
    address: { "@type": "PostalAddress", addressCountry: "PK", addressRegion: siteConfig.address.region },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone.tel,
      email: siteConfig.email.primary,
      contactType: "customer service",
      areaServed: "Worldwide",
      availableLanguage: ["English"],
    },
    sameAs: activeSocials.map((s) => s.href),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: base,
    publisher: { "@type": "Organization", name: siteConfig.name },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
