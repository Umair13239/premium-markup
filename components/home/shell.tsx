"use client";
// v2 site shell: liquid-glass nav, footer, cursor and the shared motion layer (Lenis,
// nav lens, magnetic buttons). Pages only add their own scenes.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/site.config";
import { initShellFx } from "./shell-fx";
import { PMLogo } from "@/components/brand/logo";

const NAV = [
  { href: "https://leads.premiummarkup.com", label: "Leads Portal" },
  { href: "/how-it-works", label: "How it works", hs: true },
  { href: "/pricing", label: "Pricing", hs: true },
  { href: "/blog", label: "Blog" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pm2");
    return root ? initShellFx(root) : undefined;
  }, [path]);
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden><defs id="fx" /></svg>
      <nav className="gnav lg" data-s="70" data-b="7" aria-label="Main">
        <Link href="/" className="brandlink" aria-label="Premium Markup home"><PMLogo /></Link>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={[n.hs && "hs", path === n.href && "on"].filter(Boolean).join(" ") || undefined}>{n.label}</Link>
        ))}
        <a className="pbtn ink" href={siteConfig.leadsPortalUrl}>Start free</a>
        <button type="button" className={"mtoggle" + (menu ? " on" : "")} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} onClick={() => setMenu(!menu)}><i /><i /></button>
      </nav>
      <div className={"mmenu" + (menu ? " open" : "")} aria-hidden={!menu}>
        {[...NAV, { href: "/contact", label: "Contact" }].map((n, i) => (
          <Link key={n.href} href={n.href} style={{ "--i": i } as React.CSSProperties} className={path === n.href ? "on" : undefined} tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}>{n.label}</Link>
        ))}
        <a className="pbtn brand" href={siteConfig.leadsPortalUrl} tabIndex={menu ? 0 : -1}>Start free</a>
      </div>
      {children}
      <footer className="pfoot">
        <div className="fw">
          <div><PMLogo className="flogo" /><p>Leads Portal and premium websites, built in Pakistan.</p></div>
          <nav aria-label="Footer"><Link href="/pricing">Pricing</Link><Link href="/blog">Blog</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav>
          <div><a href={"mailto:" + siteConfig.email.primary}>{siteConfig.email.primary}</a><a href={siteConfig.phone.whatsapp}>WhatsApp {siteConfig.phone.display}</a></div>
        </div>
        <small>© {new Date().getFullYear()} Premium Markup</small>
      </footer>
    </>
  );
}
