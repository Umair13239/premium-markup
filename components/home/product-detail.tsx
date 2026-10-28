"use client";
// One product page (/products/[slug]), the template from PRODUCTS-PLAN.md §5: hero with a big drawn icon,
// the free tool where there is one, a scroll film of the real app, features beside real UI shots, steps,
// who it is for, pricing, FAQ, the other products and a closing CTA. Products whose media is not made
// yet show their animated preview instead of the film and shots.
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { products, portalLink, productBySlug } from "@/lib/products";
import { BigIcon, DrawSteps, FadeUp, Marquee, Rise, ScrollFilm, Tilt } from "@/components/products/motion";
import { HealthTry } from "@/components/products/health-try";
import { Magnetic } from "@/components/site/magnetic";
import { siteConfig } from "@/site.config";
import { ProductPreview } from "./product-previews";
import "./pp.css";
import "@/components/products/product-page.css";

export function ProductDetail({ slug }: { slug: string }) {
  const p = productBySlug(slug);
  if (!p) return null;
  const m = p.media;
  const others = products.filter((x) => x.id !== p.id);
  const app = portalLink(p);

  return (
    <main className="pp pd">
      {/* 1. hero */}
      <section className="pd-hero pp-wrap">
        <div className="pd-hero-copy">
          <FadeUp><Link href="/products" className="pd-back"><ArrowLeft size={15} /> All products</Link></FadeUp>
          <FadeUp delay={0.05}><span className="pp-pill">{p.name}</span></FadeUp>
          <h1 className="pp-h1 pd-h1"><Rise text={p.headline} mount delay={0.1} /> <Rise text={p.headlineEm} className="pp-brand" mount delay={0.3} /></h1>
          <FadeUp delay={0.45} className="pp-lede"><p>{p.lede}</p></FadeUp>
          <FadeUp delay={0.55} className="pp-actions">
            <Magnetic><a className="pp-btn" href={p.freeTool ? "#try" : app} {...(p.freeTool ? {} : { target: "_blank", rel: "noopener" })}>{p.freeTool ? "Try it free" : `Open ${p.shortName}`} <ArrowRight size={17} /></a></Magnetic>
            <a className="pp-link" href={app} target="_blank" rel="noopener">{p.freeTool ? "Open the full app" : "See pricing"} <ArrowRight size={15} /></a>
          </FadeUp>
          <FadeUp delay={0.65}><ul className="pd-points">{p.points.map((x) => <li key={x}><Check size={15} /> {x}</li>)}</ul></FadeUp>
        </div>
        <div className="pd-hero-art"><BigIcon icon={p.icon} size={300} label={p.name} /></div>
      </section>

      {/* 2. the free tool, right here */}
      {p.freeTool === "health" && (
        <section className="pd-try pp-wrap">
          <FadeUp><h2 className="pp-h2"><Rise text="Check a website" /> <Rise text="right now." className="pp-brand" delay={0.12} /></h2></FadeUp>
          <FadeUp delay={0.1}><HealthTry /></FadeUp>
        </section>
      )}

      {/* 3. scroll film of the real app, or the animated preview until it is recorded */}
      {m?.film ? (
        <>
          <div className="pd-film-head pp-wrap"><span className="pp-pill">See it work</span><h2 className="pp-h2 big"><Rise text="Watch it" /> <Rise text="do the work." className="pp-brand" delay={0.12} /></h2></div>
          <ScrollFilm scrub={`${m.dir}/film-scrub.mp4`} loop={{ webm: `${m.dir}/film-loop.webm`, mp4: `${m.dir}/film-loop.mp4` }} poster={`${m.dir}/film-poster.webp`} alt={m.film.alt} captions={m.film.captions} />
        </>
      ) : (
        <section className="pd-preview pp-wrap"><Tilt><ProductPreview id={p.id} /></Tilt></section>
      )}

      {p.marquee && <section className="pd-marquee"><Marquee items={p.marquee} /></section>}

      {/* 4. features, each beside the real piece of UI it describes */}
      <section className="pd-features pp-wrap">
        <span className="pp-pill">Features</span>
        <h2 className="pp-h2 big"><Rise text="Everything you need." /> <Rise text="Nothing you don't." className="pp-brand" delay={0.12} /></h2>
        <div className="pd-feat-list">
          {p.features.map((f, i) => {
            const shot = m?.shots[i];
            return (
              <div key={f.title} className={"pd-feat" + (shot ? " has-shot" : "") + (i % 2 ? " flip" : "")}>
                <FadeUp className="pd-feat-copy"><span className="pd-feat-n">{String(i + 1).padStart(2, "0")}</span><h3>{f.title}</h3><p>{f.text}</p></FadeUp>
                {shot && <FadeUp delay={0.1} className="pd-feat-shot"><Tilt max={5}><Image src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} sizes="(max-width: 900px) 92vw, 600px" /></Tilt></FadeUp>}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. how it works */}
      <section className="pd-steps pp-wrap">
        <span className="pp-pill">How it works</span>
        <h2 className="pp-h2 big"><Rise text="Three steps." /></h2>
        <div className="pd-steps-in"><DrawSteps steps={p.steps.map((s) => ({ k: s.title, t: s.text }))} /></div>
      </section>

      {/* 6. who it is for */}
      <section className="pd-who pp-wrap">
        <h2 className="pp-h2"><Rise text="Made for" /> <Rise text="people like you." className="pp-brand" delay={0.12} /></h2>
        <div className="pd-who-grid">{p.forWho.map((w, i) => <FadeUp key={w} delay={i * 0.08}><Tilt max={6} className="pd-who-card"><span>{String(i + 1).padStart(2, "0")}</span><p>{w}</p></Tilt></FadeUp>)}</div>
      </section>

      {/* 7. pricing */}
      {p.pricing && (
        <section className="pd-price pp-wrap">
          <h2 className="pp-h2"><Rise text="Start free." /> <Rise text="Grow when you need to." className="pp-brand" delay={0.12} /></h2>
          <div className="pd-price-grid">
            <FadeUp className="pd-plan"><b>Free</b><small>No card needed</small><ul>{p.pricing.free.map((x) => <li key={x}><Check size={15} /> {x}</li>)}</ul><a className="pp-btn sm" href={p.freeTool ? "#try" : app}>Start free <ArrowRight size={15} /></a></FadeUp>
            <FadeUp delay={0.08} className="pd-plan on"><b>{p.name} paid</b><small>For daily work</small><ul>{p.pricing.paid.map((x) => <li key={x}><Check size={15} /> {x}</li>)}</ul><Link className="pp-btn sm" href="/pricing">See plans <ArrowRight size={15} /></Link></FadeUp>
            <FadeUp delay={0.16} className="pd-plan"><b>Leads Portal</b><small>Every tool, plus leads</small><ul><li><Check size={15} /> All five tools</li><li><Check size={15} /> Local business leads to use them on</li><li><Check size={15} /> Outreach and WhatsApp checks</li></ul><Link className="pp-btn sm ghost" href="/pricing">Compare plans <ArrowRight size={15} /></Link></FadeUp>
          </div>
        </section>
      )}

      {/* 8. FAQ */}
      <section className="pd-faq pp-wrap">
        <h2 className="pp-h2"><Rise text="Questions" /></h2>
        <div className="pd-faq-list">{p.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      </section>

      {/* 9. the other products */}
      <section className="pd-more pp-wrap">
        <h2 className="pp-h2"><Rise text="More tools in" /> <Rise text="the same account." className="pp-brand" delay={0.12} /></h2>
        <div className="pd-more-grid">{others.map((o, i) => { const Icon = o.icon; return (
          <FadeUp key={o.id} delay={i * 0.06}><Link href={`/products/${o.slug}`} className="pd-more-card"><span className="pd-more-ic"><Icon size={22} strokeWidth={1.8} /></span><b>{o.name}</b><small>{o.description}</small><em>See it <ArrowRight size={14} /></em></Link></FadeUp>
        ); })}</div>
      </section>

      {/* 10. CTA */}
      <section className="pp-end">
        <div className="pp-wrap">
          <h2 className="pp-h2 big"><Rise text={p.freeTool ? "Check your first" : "Try it on your"} /><br /><Rise text={p.freeTool ? "website free." : "first client."} className="pp-brand" delay={0.15} /></h2>
          <FadeUp delay={0.3} className="pp-actions center">
            <Magnetic><a className="pp-btn" href={p.freeTool ? "#try" : app}>{p.freeTool ? "Check a website" : `Open ${p.shortName}`} <ArrowRight size={17} /></a></Magnetic>
            <a className="pp-link" href={siteConfig.leadsPortalUrl} target="_blank" rel="noopener">Open the Leads Portal <ArrowRight size={15} /></a>
          </FadeUp>
        </div>
      </section>
    </main>
  );
}
