"use client";
// v2 site shell: liquid-glass nav, footer, cursor and the shared motion layer (Lenis,
// nav lens, magnetic buttons). Pages only add their own scenes.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/site.config";
import { initShellFx } from "./shell-fx";
import { PMLogo } from "@/components/brand/logo";
import { Socials } from "@/components/site/socials";

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
      {siteConfig.beta && <div className="beta-strip" role="note"><b>Beta</b> We are still testing the Leads Portal and Brand Mockups, so some things may change.</div>}
      <footer className="pfoot">
        <div className="fw">
          <div className="fbrand">
            <PMLogo className="flogo" />
            <p>Leads Portal and premium websites, built in Pakistan.</p>
            <Socials className="fsoc" iconClassName="h-[18px] w-[18px]" />
          </div>
          <nav aria-label="Product"><h3>Product</h3><a href={siteConfig.leadsPortalUrl}>Leads Portal</a><Link href="/how-it-works">How it works</Link><Link href="/pricing">Pricing</Link></nav>
          <nav aria-label="Company"><h3>Company</h3><Link href="/blog">Blog</Link><Link href="/contact">Contact</Link></nav>
          <nav aria-label="Legal"><h3>Legal</h3><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms &amp; Conditions</Link></nav>
          <div className="fcontact"><h3>Get in touch</h3><a href={"mailto:" + siteConfig.email.primary}>{siteConfig.email.primary}</a><a href={siteConfig.phone.whatsapp}>WhatsApp {siteConfig.phone.display}</a></div>
        </div>
        <div className="fbase"><small>© {new Date().getFullYear()} Premium Markup</small><small>Made in Pakistan</small></div>
      </footer>
    </>
  );
}
