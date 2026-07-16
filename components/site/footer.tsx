import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { siteConfig } from "@/site.config";
import { Socials } from "./socials";

export function Footer() {
  const year = 2026; // static to avoid hydration mismatch; bump as needed

  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
            Premium<span className="text-cobalt">Markup</span>
          </Link>
          <p className="mt-4 max-w-xs text-muted">{siteConfig.tagline}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            A UK web development and social media agency for small businesses.
          </p>
          <Socials className="mt-6 -ml-2.5" />
        </div>

        <nav aria-label="Footer">
          <p className="tag-label mb-4">{"<!-- sitemap -->"}</p>
          <ul className="space-y-3">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline text-ink hover:text-cobalt">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="tag-label mb-4">{"<!-- contact -->"}</p>
          <ul className="space-y-3">
            <li>
              <a href={`tel:${siteConfig.phone.tel}`} className="flex items-center gap-2 hover:text-cobalt">
                <Phone className="h-4 w-4 text-muted" aria-hidden="true" />
                {siteConfig.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email.primary}`} className="flex items-center gap-2 hover:text-cobalt">
                <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
                {siteConfig.email.primary}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.phone.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-cobalt"
              >
                <MessageCircle className="h-4 w-4 text-muted" aria-hidden="true" />
                WhatsApp us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-editorial flex flex-col gap-3 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.legalName}. {siteConfig.address.region}. Serving the UK, USA &amp; worldwide.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-cobalt">Privacy</Link>
            <Link href="/terms" className="hover:text-cobalt">Terms</Link>
            <Link href="/admin" className="hover:text-cobalt">Sign in</Link>
            <span className="mono text-xs">{"<!-- hand-built -->"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
