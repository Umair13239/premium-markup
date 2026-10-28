"use client";
// /products: hero, a sticky scroll showcase (one product per screen of scroll, its demo playing on the
// right), a flow line drawn by scroll, a statement that lights up word by word, and a closing CTA.
// Motion rules from CLAUDE.md: observers sit on unclipped parents, text is readable before it moves
// (scroll-linked opacity floors at .35), and everything respects reduced motion.
import Link from "next/link";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useRef, useState } from "react";
import { siteConfig } from "@/site.config";
import { products, portalLink } from "@/lib/products";
import { Magnetic } from "@/components/site/magnetic";
import { FadeUp, Rise, WordLight } from "@/components/products/motion";
import { ProductPreview } from "./product-previews";
import "./pp.css";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- hero: five product tiles that fan out, then drift apart as you scroll ---------- */
const FAN = [
  { x: -372, y: 46, r: -12 },
  { x: -186, y: 4, r: -6 },
  { x: 0, y: -12, r: 0 },
  { x: 186, y: 4, r: 6 },
  { x: 372, y: 46, r: 12 },
];

function FanTile({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const p = products[i];
  const Icon = p.icon;
  const f = FAN[i];
  const spread = (i - 2) * 46;
  const x = useTransform(progress, [0, 1], [f.x, f.x + spread]);
  const y = useTransform(progress, [0, 1], [f.y, f.y - 90 - Math.abs(i - 2) * 30]);
  const rotate = useTransform(progress, [0, 1], [f.r, f.r * 1.8]);
  return (
    <motion.div className="pp-tile" style={reduce ? { x: f.x, y: f.y, rotate: f.r } : { x, y, rotate, zIndex: 10 - Math.abs(i - 2) }}
      initial={reduce ? false : { opacity: 0, scale: 0.8, y: 160 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.35 + i * 0.08, ease: EASE }}>
      <Link href={`/products/${p.slug}`} className="pp-tile-in">
        <span className="pp-tile-ic"><Icon size={20} strokeWidth={1.8} /></span>
        <small>{p.number}</small>
        <b>{p.shortName}</b>
      </Link>
    </motion.div>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.35]);
  return (
    <section ref={ref} className="pp-hero">
      <motion.div className="pp-hero-copy" style={{ opacity: fade }}>
        <motion.span className="pp-pill" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>Products</motion.span>
        <h1 className="pp-h1">
          <Rise text="Five tools." mount delay={0.1} />
          <br />
          <Rise text="One portal." className="pp-brand" mount delay={0.28} />
        </h1>
        <FadeUp delay={0.5} className="pp-lede">
          <p>Answer every visitor, build the site, check what is broken and show the brand. Each tool works on the leads you already have in your Leads Portal.</p>
        </FadeUp>
        <FadeUp delay={0.62} className="pp-actions">
          <Magnetic><a className="pp-btn" href={siteConfig.leadsPortalUrl} target="_blank" rel="noopener">Start free <ArrowRight size={17} /></a></Magnetic>
          <a className="pp-link" href="#tools">See each tool <ArrowRight size={15} /></a>
        </FadeUp>
      </motion.div>
      <div className="pp-fan" aria-hidden="true">
        {products.map((p, i) => <FanTile key={p.id} i={i} progress={scrollYProgress} />)}
      </div>
    </section>
  );
}

/* ---------- sticky showcase: scroll picks the product, its demo plays ---------- */
function Showcase() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(products.length - 1, Math.max(0, Math.floor(v * products.length)));
    setActive((cur) => (cur === i ? cur : i));
  });
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const p = products[active];
  const Icon = p.icon;

  return (
    <section ref={ref} id="tools" className="pp-show" style={{ height: `${products.length * 95}vh` }}>
      <div className="pp-sticky">
        <div className="pp-show-grid">
          <div className="pp-show-copy">
            <div className="pp-rail" aria-hidden="true">
              <motion.i style={{ scaleY: reduce ? 1 : fill }} />
              {products.map((x, i) => <span key={x.id} className={i <= active ? "on" : ""} />)}
            </div>
            <div className="pp-show-text">
              <div className="pp-count"><b>{p.number}</b> / 0{products.length}</div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={p.id} initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -18 }} transition={{ duration: 0.45, ease: EASE }}>
                  <span className="pp-show-ic"><Icon size={22} strokeWidth={1.8} /></span>
                  <h2 className="pp-h2">{p.name}</h2>
                  <p className="pp-show-desc">{p.description}</p>
                  <ul className="pp-points">{p.points.map((x) => <li key={x}><Check size={15} /> {x}</li>)}</ul>
                  <div className="pp-show-links">
                    <Link className="pp-btn sm" href={`/products/${p.slug}`}>How it works <ArrowRight size={15} /></Link>
                    <a className="pp-link" href={portalLink(p)} target="_blank" rel="noopener">Open in portal <ArrowRight size={14} /></a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="pp-stage">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={p.id} className="pp-stage-in" initial={reduce ? false : { opacity: 0, y: 40, rotateX: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} exit={reduce ? undefined : { opacity: 0, y: -30, scale: 0.97 }} transition={{ duration: 0.6, ease: EASE }}>
                <ProductPreview id={p.id} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* small screens: no pinning, each product in turn with its demo playing while on screen */
function MobileItem({ i }: { i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  const p = products[i];
  const Icon = p.icon;
  return (
    <div ref={ref} className="pp-mob-item">
      <FadeUp>
        <div className="pp-count"><b>{p.number}</b> / 0{products.length}</div>
        <span className="pp-show-ic"><Icon size={22} strokeWidth={1.8} /></span>
        <h2 className="pp-h2">{p.name}</h2>
        <p className="pp-show-desc">{p.description}</p>
      </FadeUp>
      <FadeUp delay={0.1} className="pp-mob-stage"><ProductPreview id={p.id} play={inView} /></FadeUp>
      <div className="pp-show-links">
        <Link className="pp-btn sm" href={`/products/${p.slug}`}>How it works <ArrowRight size={15} /></Link>
        <a className="pp-link" href={portalLink(p)} target="_blank" rel="noopener">Open in portal <ArrowRight size={14} /></a>
      </div>
    </div>
  );
}

/* ---------- flow: one line, drawn by scroll, lighting each step as it passes ---------- */
const FLOW = [
  { k: "Find", t: "Pick a business from your leads." },
  { k: "Build", t: "Make it a site in about two minutes." },
  { k: "Check", t: "Show what is slow, broken or missing." },
  { k: "Answer", t: "Add a receptionist that takes bookings." },
  { k: "Present", t: "Put their logo on real-world mockups." },
];

function FlowStep({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const at = i / (FLOW.length - 1);
  const o = useTransform(progress, [at - 0.12, at], [0.35, 1]);
  const s = useTransform(progress, [at - 0.12, at], [0.6, 1]);
  return (
    <motion.li style={reduce ? undefined : { opacity: o }}>
      <motion.span className="pp-node" style={reduce ? undefined : { scale: s }}>{String(i + 1).padStart(2, "0")}</motion.span>
      <b>{FLOW[i].k}</b>
      <p>{FLOW[i].t}</p>
    </motion.li>
  );
}

function Flow() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const line = reduce ? undefined : scrollYProgress;
  return (
    <section ref={ref} className="pp-flow">
      <div className="pp-wrap">
        <span className="pp-pill">How they connect</span>
        <h2 className="pp-h2 big"><Rise text="One lead." /> <Rise text="Five ways to win it." className="pp-brand" delay={0.15} /></h2>
        <div className="pp-flow-track">
          <div className="pp-line h"><motion.i style={{ scaleX: line ?? 1 }} /></div>
          <div className="pp-line v"><motion.i style={{ scaleY: line ?? 1 }} /></div>
          <ol>{FLOW.map((_, i) => <FlowStep key={i} i={i} progress={scrollYProgress} />)}</ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- statement: words light up as it scrolls through ---------- */
function Statement() {
  return (
    <section className="pp-say">
      <WordLight className="pp-wrap" text="Built for people who sell web work. Find the business, show them something real, and follow up while they still care." />
    </section>
  );
}

/* ---------- closing CTA ---------- */
function End() {
  return (
    <section className="pp-end">
      <div className="pp-wrap">
        <h2 className="pp-h2 big"><Rise text="Start with one." /><br /><Rise text="Use all five." className="pp-brand" delay={0.15} /></h2>
        <FadeUp delay={0.2} className="pp-lede center"><p>Every tool is inside one Leads Portal account. Sign up free and open the one you need today.</p></FadeUp>
        <FadeUp delay={0.3} className="pp-actions center">
          <Magnetic><a className="pp-btn" href={siteConfig.leadsPortalUrl} target="_blank" rel="noopener">Open the Leads Portal <ArrowRight size={17} /></a></Magnetic>
          <Link className="pp-link" href="/pricing">See pricing <ArrowRight size={15} /></Link>
        </FadeUp>
      </div>
    </section>
  );
}

export function ProductsPage() {
  return (
    <main className="pp">
      <Hero />
      <div className="pp-desk"><Showcase /></div>
      <div className="pp-mob pp-wrap">{products.map((p, i) => <MobileItem key={p.id} i={i} />)}</div>
      <Flow />
      <Statement />
      <End />
    </main>
  );
}
