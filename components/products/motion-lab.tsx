"use client";
// Every motion primitive on one page (dev only, /products/motion-lab).
import { Gauge, Headset } from "lucide-react";
import { BigIcon, Count, DrawSteps, FadeUp, Marquee, Rise, ScrollFilm, Tilt, WordLight } from "./motion";
import "@/components/home/pp.css";

const LAB = "/products/website-health/film";

export function MotionLab() {
  return (
    <main className="pp">
      <section className="pp-wrap" style={{ padding: "150px 24px 80px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "center" }}>
        <div>
          <span className="pp-pill">Motion lab</span>
          <h1 className="pp-h1" style={{ marginTop: 24 }}><Rise text="Rise and" mount /> <Rise text="BigIcon." className="pp-brand" mount delay={0.2} /></h1>
          <FadeUp delay={0.4} className="pp-lede"><p>Every primitive the product pages use, on one page.</p></FadeUp>
        </div>
        <div style={{ display: "flex", gap: 40, justifyContent: "center" }}><BigIcon icon={Gauge} size={260} label="Website Health" /></div>
      </section>

      <ScrollFilm scrub={`${LAB}-scrub.mp4`} loop={{ webm: `${LAB}-loop.webm`, mp4: `${LAB}-loop.mp4` }} poster={`${LAB}-poster.webp`}
        alt="Website Health checking a site and showing its report"
        captions={[{ k: "Paste a link", t: "Any website, no sign-up." }, { k: "Checks run", t: "DNS, email, blacklists and SSL." }, { k: "Read the scores", t: "Authority and spam, at a glance." }, { k: "Fix what matters", t: "The few things worth doing first." }]} />

      <section className="pp-wrap" style={{ padding: "120px 24px" }}>
        <h2 className="pp-h2 big"><Rise text="DrawSteps" /></h2>
        <div style={{ marginTop: 60 }}>
          <DrawSteps steps={[{ k: "Paste", t: "A link or the business details." }, { k: "Run", t: "The tool does the work." }, { k: "Read", t: "Scores and fixes in plain words." }, { k: "Send", t: "A report the client understands." }]} />
        </div>
      </section>

      <section style={{ padding: "40px 0 100px" }}>
        <Marquee items={["Authority score", "Spam score", "SPF", "DKIM", "DMARC", "Blacklists", "SSL", "Domain age", "Tech stack", "Mail provider"]} />
      </section>

      <section className="pp-wrap" style={{ padding: "40px 24px 120px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[["Checks done", 1284], ["Sites in the top 1M", 312], ["Fixes found", 4096]].map(([k, v]) => (
          <Tilt key={k as string}><div style={{ padding: 30, borderRadius: 22, background: "#fff", boxShadow: "0 0 0 1px rgba(29,29,31,.08), 0 30px 60px -30px rgba(20,10,60,.3)" }}>
            <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-.04em", color: "var(--brand)" }}><Count to={v as number} /></div>
            <div style={{ color: "var(--ink-2)" }}>{k} (sample numbers)</div>
          </div></Tilt>
        ))}
      </section>

      <section className="pp-say"><WordLight className="pp-wrap" text="WordLight: a statement that lights up one word at a time as you scroll through it." /></section>
      <section className="pp-wrap" style={{ padding: "0 24px 160px", display: "flex", justifyContent: "center" }}><BigIcon icon={Headset} size={200} /></section>
    </main>
  );
}
