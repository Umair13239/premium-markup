"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Check,
  Mic,
  MonitorSmartphone,
  MousePointer2,
  PenTool,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import { siteConfig } from "@/site.config";
import { products, portalLink, type Product, type ProductId } from "@/lib/products";

const workflow = [
  { label: "Create", text: "Make the visual proof, the first draft or the working site.", icon: PenTool },
  { label: "Inspect", text: "See the issues that matter before they become expensive.", icon: ScanSearch },
  { label: "Improve", text: "Use a clear next step instead of guessing what to change.", icon: Activity },
  { label: "Present", text: "Share work that looks finished and feels easy to trust.", icon: ShieldCheck },
];

export function ProductPreview({ id, compact = false }: { id: ProductId; compact?: boolean }) {
  if (id === "receptionist") {
    return (
      <div className={`product-preview product-preview-receptionist${compact ? " is-compact" : ""}`}>
        <div className="preview-toolbar"><span>Spice Route / receptionist</span><b className="status-live">Live</b></div>
        <div className="rcp-layout">
          <div className="rcp-bubble rcp-them">Are you open on Sunday evening?</div>
          <div className="rcp-bubble rcp-us">Yes, we&apos;re open until 11pm on Sundays. Would you like me to book a table?</div>
          <div className="rcp-bubble rcp-them">Table for four at 8, please.</div>
          <div className="rcp-booking"><Check size={13} /> Booking confirmed, sent on WhatsApp</div>
          <div className="rcp-mic"><Mic size={14} /> Tap to talk</div>
        </div>
      </div>
    );
  }

  if (id === "mockup") {
    return (
      <div className={`product-preview product-preview-mockup${compact ? " is-compact" : ""}`}>
        <div className="preview-toolbar"><span>Brand kit / scenes</span><b>Export</b></div>
        <div className="mockup-layout">
          <div className="mockup-canvas">
            <div className="mockup-window-card"><span>PM</span><small>STUDIO</small></div>
            <div className="mockup-shadow" />
          </div>
          <div className="mockup-controls">
            <span>Scene</span>
            <b>Desk / daylight</b>
            <i /><i className="short" /><i className="active" />
            <small>3 variations ready</small>
          </div>
        </div>
      </div>
    );
  }

  if (id === "health") {
    return (
      <div className={`product-preview product-preview-health${compact ? " is-compact" : ""}`}>
        <div className="preview-toolbar"><span>premiummarkup.com</span><b className="status-live">Live</b></div>
        <div className="health-layout">
          <div className="health-score"><small>Overall health</small><strong>88</strong><span>/ 100</span><em>Good foundation</em></div>
          <div className="health-list">
            <div><span>Performance</span><b>96</b><i><u style={{ width: "96%" }} /></i></div>
            <div><span>Accessibility</span><b>91</b><i><u style={{ width: "91%" }} /></i></div>
            <div><span>SEO</span><b>86</b><i><u style={{ width: "86%" }} /></i></div>
            <div><span>Best practices</span><b>79</b><i><u style={{ width: "79%" }} /></i></div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "builder") {
    return (
      <div className={`product-preview product-preview-builder${compact ? " is-compact" : ""}`}>
        <div className="preview-toolbar"><span>New project / North Oak</span><b>Publish</b></div>
        <div className="builder-layout">
          <aside><span className="builder-avatar">N</span><i /><i /><i /><i /></aside>
          <div className="builder-canvas">
            <div className="builder-nav"><b>North Oak</b><span>Work</span><span>About</span><span className="builder-button">Contact</span></div>
            <div className="builder-hero"><small>Crafted with care</small><strong>Good work<br />deserves a<br /><em>clear stage.</em></strong><button>Explore work <ArrowRight size={12} /></button></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-preview product-preview-seo${compact ? " is-compact" : ""}`}>
      <div className="preview-toolbar"><span>SEO report / North Oak</span><b>Download PDF</b></div>
      <div className="seo-layout">
        <div className="seo-head"><small>Visibility snapshot</small><strong>72<span>/100</span></strong><em>Room to grow</em></div>
        <div className="seo-bars"><div><span>Technical</span><i><u style={{ height: "78%" }} /></i></div><div><span>Content</span><i><u style={{ height: "62%" }} /></i></div><div><span>Local search</span><i><u style={{ height: "84%" }} /></i></div><div><span>Experience</span><i><u style={{ height: "70%" }} /></i></div></div>
        <div className="seo-note"><Check size={13} /> 4 quick wins found</div>
      </div>
    </div>
  );
}

function ProductCard({ product, index, reducedMotion }: { product: Product; index: number; reducedMotion: boolean }) {
  const Icon = product.icon;
  return (
    <motion.article
      className={`product-card product-card-${product.id}`}
      style={{ "--product-accent": product.accent } as CSSProperties}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reducedMotion ? undefined : { y: -7 }}
    >
      <div className="product-card-top">
        <span className="product-number">{product.number}</span>
        <span className="product-icon"><Icon size={19} strokeWidth={1.8} /></span>
      </div>
      <div className="product-card-copy">
        <p>{product.eyebrow}</p>
        <h3>{product.name}</h3>
        <div className="product-card-description">{product.description}</div>
        <p className="product-card-detail">{product.detail}</p>
      </div>
      <ProductPreview id={product.id} compact />
      <div className="product-card-bottom">
        <ul>{product.points.map((point) => <li key={point}><Check size={14} />{point}</li>)}</ul>
        <div className="product-card-actions">
          <Link href={`/products/${product.slug}`} className="product-card-link">See how it works <ArrowRight size={16} /></Link>
          <a href={portalLink(product)} target="_blank" rel="noopener" className="product-card-open">Open in portal</a>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductsPage() {
  const reducedMotion = useReducedMotion() ?? false;
  const [active, setActive] = useState<ProductId>("receptionist");
  const activeProduct = products.find((product) => product.id === active) ?? products[0];
  const ActiveIcon = activeProduct.icon;

  return (
    <main className="products-page">
      <section className="products-hero" aria-labelledby="products-title">
        <div className="products-container products-hero-grid">
          <motion.div className="products-hero-copy" initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            <p className="products-kicker"><span /> Premium Markup / Product suite</p>
            <h1 id="products-title">Tools that make good work <em>easier to ship.</em></h1>
            <p className="products-hero-lede">Five focused products for the moments that matter: answering every visitor, building the page, finding the issue and showing the idea, all inside one Leads Portal account.</p>
            <div className="products-hero-actions">
              <Link className="products-button products-button-dark" href="#products"><span>Explore products</span><ArrowRight size={17} /></Link>
              <a className="products-text-link" href={siteConfig.leadsPortalUrl} target="_blank" rel="noopener">Open Leads Portal <ArrowRight size={15} /></a>
            </div>
            <div className="products-proof-row"><span><Check size={15} /> Purpose-built workflows</span><span><Check size={15} /> Clear output, less noise</span></div>
          </motion.div>

          <motion.div className="suite-console-wrap" initial={reducedMotion ? false : { opacity: 0, x: 26 }} animate={reducedMotion ? undefined : { opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
            <div className="suite-console">
              <div className="suite-console-bar"><div className="window-dots"><i /><i /><i /></div><span>premium markup / products</span><b>{products.length} tools</b></div>
              <div className="suite-console-body">
                <div className="suite-sidebar">
                  <div className="suite-sidebar-brand"><span>PM</span><b>Workspace</b></div>
                  <div className="suite-tabs" role="tablist" aria-label="Product previews">
                    {products.map((product) => {
                      const Icon = product.icon;
                      return <button key={product.id} type="button" role="tab" aria-selected={active === product.id} className={active === product.id ? "is-active" : ""} onClick={() => setActive(product.id)}><Icon size={15} /><span>{product.shortName}</span><small>{product.number}</small></button>;
                    })}
                  </div>
                  <div className="suite-sidebar-foot"><span className="online-dot" /> Workspace ready</div>
                </div>
                <div className="suite-stage">
                  <div className="suite-stage-head"><div><span>Selected product</span><strong><ActiveIcon size={18} />{activeProduct.name}</strong></div><span className="suite-status">Live preview</span></div>
                  <AnimatePresence mode="wait">
                    <motion.div key={active} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                      <ProductPreview id={active} />
                    </motion.div>
                  </AnimatePresence>
                  <div className="suite-stage-foot"><span>Designed for momentum</span><span><MonitorSmartphone size={14} /> Desktop + mobile</span></div>
                </div>
              </div>
            </div>
            <div className="console-note"><MousePointer2 size={14} /> Select a product to preview the workflow</div>
          </motion.div>
        </div>
      </section>

      <section className="products-intro" aria-label="Product suite overview">
        <div className="products-container products-intro-grid">
          <p className="products-section-kicker">01 / The suite</p>
          <div><h2>Less hunting for the right tool.<br /><em>More time making the work count.</em></h2><p>Premium Markup products are designed as practical instruments, not feature piles. Each one has a clear job and a clean handoff to the next step.</p></div>
          <div className="products-intro-meta"><strong>{products.length}</strong><span>focused products<br />in one connected workflow</span></div>
        </div>
      </section>

      <section className="products-grid-section" id="products" aria-labelledby="products-grid-title">
        <div className="products-container">
          <div className="products-section-head"><div><p className="products-section-kicker">02 / Choose your instrument</p><h2 id="products-grid-title">One suite.<br /><em>Five useful starting points.</em></h2></div><p>Pick the part of the workflow you need to move forward. The rest stays close when you are ready for it.</p></div>
          <div className="products-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} reducedMotion={reducedMotion} />)}</div>
        </div>
      </section>

      <section className="products-workflow" aria-labelledby="workflow-title">
        <div className="products-container">
          <div className="workflow-heading"><p className="products-section-kicker">03 / A better sequence</p><h2 id="workflow-title">From first impression<br /><em>to final report.</em></h2><p>Good tools should remove the awkward gaps between making, checking and presenting. This is the sequence the suite is built around.</p></div>
          <div className="workflow-grid">{workflow.map((step, index) => { const Icon = step.icon; return <motion.div key={step.label} className="workflow-step" initial={reducedMotion ? false : { opacity: 0, y: 18 }} whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5, delay: index * 0.08 }}><div className="workflow-step-top"><span>0{index + 1}</span><Icon size={19} strokeWidth={1.8} /></div><h3>{step.label}</h3><p>{step.text}</p>{index < workflow.length - 1 && <span className="workflow-line" aria-hidden="true" />}</motion.div>; })}</div>
        </div>
      </section>

      <section className="products-cta">
        <div className="products-container products-cta-inner"><div><p className="products-section-kicker">04 / Ready when you are</p><h2>Make the next step<br /><em>feel obvious.</em></h2><p>Start with the tool that solves today&apos;s bottleneck. Add the rest when the work calls for it.</p></div><div className="products-cta-actions"><a className="products-button products-button-light" href={siteConfig.leadsPortalUrl} target="_blank" rel="noopener"><span>Open Leads Portal</span><ArrowRight size={17} /></a><Link className="products-cta-contact" href="/contact">Talk to the team <ArrowRight size={15} /></Link></div></div>
      </section>
    </main>
  );
}
