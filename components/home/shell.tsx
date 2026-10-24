"use client";
// v2 site shell: liquid-glass nav, footer, cursor and the shared motion layer (Lenis,
// nav lens, magnetic buttons). Pages only add their own scenes.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig, activeSocials } from "@/site.config";
import { initShellFx } from "./shell-fx";
import { PMLogo } from "@/components/brand/logo";
import { Socials } from "@/components/site/socials";

const NAV = [
  { href: "https://leads.premiummarkup.com", label: "Leads Portal" },
  { href: "/products", label: "Products" },
  { href: "/how-it-works", label: "How it works", hs: true },
  { href: "/pricing", label: "Pricing", hs: true },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
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
        {NAV.map((n, i) => (
          <Link key={n.href} href={n.href} style={{ "--i": i } as React.CSSProperties} className={path === n.href ? "on" : undefined} tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}>{n.label}</Link>
        ))}
        <a className="pbtn brand" href={siteConfig.leadsPortalUrl} tabIndex={menu ? 0 : -1}>Start free</a>
      </div>
      {children}
      {siteConfig.beta && <div className="beta-strip" role="note"><b>Beta</b> We are still testing the Leads Portal and Brand Mockups, so some things may change.</div>}
      <footer className="pfoot">
        <div className="fw fw-top">
          <div className="fbrand">
            <PMLogo className="flogo" />
            <p>Leads Portal and premium websites, built in Pakistan. We help businesses find clients and look the part online.</p>
          </div>
          <NewsletterForm />
        </div>
        <div className="fw fw-cols">
          <nav aria-label="Main pages"><h3>Main pages</h3><Link href="/">Home</Link><Link href="/products">Products</Link><Link href="/how-it-works">How it works</Link><Link href="/pricing">Pricing</Link><Link href="/blog">Blog</Link><Link href="/contact">Contact</Link></nav>
          <nav aria-label="Product"><h3>Product</h3><a href={siteConfig.leadsPortalUrl}>Leads Portal</a><Link href="/pricing">Plans</Link><Link href="/how-it-works">Demo websites</Link></nav>
          <nav aria-label="Legal"><h3>Legal</h3><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms &amp; Conditions</Link></nav>
          <nav aria-label="Social links"><h3>Social links</h3>{activeSocials.map((x) => <a key={x.name} href={x.href} target="_blank" rel="noopener">{x.name}</a>)}</nav>
          <div className="fcontact">
            <h3>Have a question?</h3>
            <a href={siteConfig.phone.whatsapp} className="fc-item"><b>{siteConfig.phone.display}</b><small>Call or WhatsApp, Mon to Sat</small></a>
            <a href={"mailto:" + siteConfig.email.primary} className="fc-item"><b>{siteConfig.email.primary}</b><small>We reply within one working day</small></a>
          </div>
        </div>
        <div className="fbase"><small>© {new Date().getFullYear()} Premium Markup</small><small>Made in Pakistan</small></div>
      </footer>
    </>
  );
}

// Newsletter sign-up: saved in the Leads Portal list (with a one-click unsubscribe link in every email).
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setMsg({ ok: true, text: j.message || "Thanks! You are on the list." }); setEmail(""); }
      else setMsg({ ok: false, text: j.error || "Could not subscribe right now. Try again." });
    } catch {
      setMsg({ ok: false, text: "Connection problem. Try again." });
    } finally { setBusy(false); }
  }
  return (
    <form className="fnews" onSubmit={submit} noValidate>
      <h3>Subscribe to our newsletter</h3>
      <div className="fnews-row">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" aria-label="Email address" required disabled={busy} />
        <button type="submit" disabled={busy}>{busy ? "Sending…" : "Subscribe"}</button>
      </div>
      <small role="status" style={msg && !msg.ok ? { color: "#FCA5A5" } : undefined}>{msg ? msg.text : "No spam. Just useful notes for growing businesses. Unsubscribe any time."}</small>
    </form>
  );
}
