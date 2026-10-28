"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { CSSProperties } from "react";
import { ProductPreview } from "@/components/home/products-page";
import { products, portalLink, productBySlug } from "@/lib/products";

// One product's page: what it does, how it works, who it's for, then straight into the portal.
// Takes the slug (not the product) because the product holds an icon component, which a server
// page can't pass to a client component.
export function ProductDetail({ slug }: { slug: string }) {
  const reducedMotion = useReducedMotion() ?? false;
  const product = productBySlug(slug);
  if (!product) return null;
  const Icon = product.icon;
  const others = products.filter((p) => p.id !== product.id);
  const rise = (delay = 0) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 18 },
    whileInView: reducedMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <main className="products-page pd-page" style={{ "--product-accent": product.accent } as CSSProperties}>
      <section className="products-hero pd-hero" aria-labelledby="pd-title">
        <div className="products-container products-hero-grid">
          <motion.div className="products-hero-copy" {...rise()}>
            <Link href="/products" className="pd-back"><ArrowLeft size={15} /> All products</Link>
            <p className="products-kicker"><span /> {product.number} / {product.name}</p>
            <h1 id="pd-title">{product.headline} <em>{product.headlineEm}</em></h1>
            <p className="products-hero-lede">{product.lede}</p>
            <div className="products-hero-actions">
              <a className="products-button products-button-dark" href={portalLink(product)} target="_blank" rel="noopener"><span>Open {product.shortName}</span><ArrowRight size={17} /></a>
              <Link className="products-text-link" href="/pricing">See pricing <ArrowRight size={15} /></Link>
            </div>
            <div className="products-proof-row">{product.points.map((pt) => <span key={pt}><Check size={15} /> {pt}</span>)}</div>
          </motion.div>
          <motion.div className="pd-preview" {...rise(0.1)}>
            <div className="pd-preview-head"><span className="product-icon"><Icon size={18} strokeWidth={1.8} /></span><b>{product.name}</b></div>
            <ProductPreview id={product.id} />
          </motion.div>
        </div>
      </section>

      <section className="pd-section" aria-labelledby="pd-features">
        <div className="products-container">
          <p className="products-section-kicker">01 / What it does</p>
          <h2 id="pd-features" className="pd-h2">{product.eyebrow}.</h2>
          <div className="pd-features">
            {product.features.map((f, i) => (
              <motion.div key={f.title} className="pd-feature" {...rise(i * 0.06)}>
                <span className="pd-feature-dot" aria-hidden="true" />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pd-section pd-steps-section" aria-labelledby="pd-steps">
        <div className="products-container">
          <p className="products-section-kicker">02 / How it works</p>
          <h2 id="pd-steps" className="pd-h2">Three steps, <em>no setup call.</em></h2>
          <ol className="pd-steps">
            {product.steps.map((s, i) => (
              <motion.li key={s.title} {...rise(i * 0.08)}>
                <span className="pd-step-n">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pd-section" aria-labelledby="pd-who">
        <div className="products-container pd-split">
          <div>
            <p className="products-section-kicker">03 / Who it&apos;s for</p>
            <h2 id="pd-who" className="pd-h2">Made for people who <em>sell good work.</em></h2>
            <ul className="pd-who">{product.forWho.map((w) => <li key={w}><Check size={16} /> {w}</li>)}</ul>
          </div>
          <div className="pd-faqs">
            {product.faqs.map((f) => (
              <details key={f.q} className="pd-faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pd-section pd-more" aria-labelledby="pd-more">
        <div className="products-container">
          <p className="products-section-kicker">04 / The rest of the suite</p>
          <h2 id="pd-more" className="pd-h2">Works alongside</h2>
          <div className="pd-more-grid">
            {others.map((p) => {
              const OIcon = p.icon;
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className="pd-more-card" style={{ "--product-accent": p.accent } as CSSProperties}>
                  <span className="product-icon"><OIcon size={17} strokeWidth={1.8} /></span>
                  <b>{p.name}</b>
                  <small>{p.description}</small>
                  <span className="pd-more-go">Learn more <ArrowRight size={14} /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="products-cta">
        <div className="products-container products-cta-inner">
          <div>
            <p className="products-section-kicker">Ready when you are</p>
            <h2>Try {product.name}<br /><em>with your own leads.</em></h2>
            <p>It runs inside your Leads Portal account, on the businesses you have already found.</p>
          </div>
          <div className="products-cta-actions">
            <a className="products-button products-button-light" href={portalLink(product)} target="_blank" rel="noopener"><span>Open {product.shortName}</span><ArrowRight size={17} /></a>
            <Link className="products-cta-contact" href="/contact">Talk to the team <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
