"use client";
import "./pp.css";
// Small live demos of each product. Each one plays while `play` is on and loops, so a preview on
// screen is never a still picture. Under reduced motion every element is shown at once, statically.
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Ban, Check, Globe, Mail, Mic, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProductId } from "@/lib/products";

const EASE = [0.22, 1, 0.36, 1] as const;

// 0..steps, one step every `ms`, then a pause and round again. Back to 0 when `play` stops.
function useLoop(play: boolean, steps: number, ms: number, hold = 2600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!play) return;
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i = i >= steps ? 0 : i + 1;
      setN(i);
      t = setTimeout(tick, i >= steps ? hold : i === 0 ? 500 : ms);
    };
    t = setTimeout(tick, 450);
    return () => { clearTimeout(t); setN(0); };
  }, [play, steps, ms, hold]);
  return n;
}

function useStep(play: boolean, steps: number, ms: number, hold?: number) {
  const reduce = useReducedMotion();
  const n = useLoop(play && !reduce, steps, ms, hold);
  return reduce ? steps : n;
}

const show = (on: boolean, y = 10) => ({
  initial: false as const,
  animate: on ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y, scale: 0.97 },
  transition: { duration: 0.45, ease: EASE },
});

function Bar({ title, right }: { title: string; right?: React.ReactNode }) {
  return <div className="pv-bar"><span className="pv-dots"><i /><i /><i /></span><em>{title}</em>{right}</div>;
}

/* ---------- AI Receptionist: a short spoken booking ---------- */
function Receptionist({ play }: { play: boolean }) {
  const s = useStep(play, 5, 1100);
  const speaking = s === 2 || s === 4;
  return (
    <div className="pv pv-rcp">
      <Bar title="Spice Route / receptionist" right={<b className="pv-live">Live</b>} />
      <div className="pv-body">
        <motion.div className="pv-msg them" {...show(s >= 1)}>Are you open on Sunday evening?</motion.div>
        <motion.div className="pv-msg us" {...show(s >= 2)}>Yes, until 11pm. Shall I book you a table?</motion.div>
        <motion.div className="pv-msg them" {...show(s >= 3)}>Table for four at 8, please.</motion.div>
        <motion.div className="pv-chip" {...show(s >= 5)}><Check size={13} /> Booking sent on WhatsApp</motion.div>
        <div className="pv-mic">
          <span className={"pv-wave" + (speaking ? " on" : "")}>{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 0.07}s` }} />)}</span>
          <span className="pv-micbtn"><Mic size={14} /> {speaking ? "Speaking" : "Tap to talk"}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Website Builder: a site assembling itself ---------- */
function Builder({ play }: { play: boolean }) {
  const s = useStep(play, 6, 650);
  return (
    <div className="pv pv-bld">
      <Bar title="North Oak Dental / building" right={<b className={"pv-pub" + (s >= 6 ? " on" : "")}>{s >= 6 ? "Live" : "Building"}</b>} />
      <div className="pv-body">
        <motion.div className="pv-site-nav" {...show(s >= 1, -8)}><b>North Oak</b><span /><span /><span className="pv-cta" /></motion.div>
        <div className="pv-site-hero">
          <div>
            <motion.i className="pv-ln l1" initial={false} animate={{ scaleX: s >= 2 ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE }} />
            <motion.i className="pv-ln l2" initial={false} animate={{ scaleX: s >= 2 ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.12, ease: EASE }} />
            <motion.i className="pv-ln l3" initial={false} animate={{ scaleX: s >= 3 ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE }} />
            <motion.span className="pv-btn" {...show(s >= 3)} />
          </div>
          <motion.div className="pv-img" initial={false} animate={{ clipPath: s >= 4 ? "inset(0% 0% 0% 0% round 10px)" : "inset(0% 0% 100% 0% round 10px)" }} transition={{ duration: 0.7, ease: EASE }} />
        </div>
        <div className="pv-site-cards">{[0, 1, 2].map((i) => <motion.span key={i} {...show(s >= 5)} transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }} />)}</div>
        <motion.div className="pv-url" {...show(s >= 6)}><Globe size={12} /> northoak.premiummarkup.com</motion.div>
      </div>
    </div>
  );
}

/* ---------- SEO report: a score that counts up, bars that fill ---------- */
function Seo({ play }: { play: boolean }) {
  const s = useStep(play, 5, 700);
  const score = s >= 1 ? 72 : 0;
  const bars = [["Technical", 78], ["Content", 62], ["Local", 84], ["Speed", 70]] as const;
  return (
    <div className="pv pv-seo">
      <Bar title="SEO report / northoak.com" right={<b>PDF</b>} />
      <div className="pv-body">
        <div className="pv-seo-top">
          <div className="pv-ring">
            <svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" className="trk" /><motion.circle cx="40" cy="40" r="34" className="val" initial={false} animate={{ pathLength: score / 100 }} transition={{ duration: 1.2, ease: EASE }} /></svg>
            <strong><Count to={score} /></strong>
          </div>
          <div><small>Visibility score</small><b>Room to grow</b></div>
        </div>
        <div className="pv-bars">{bars.map(([k, v], i) => (
          <div key={k}><span>{k}</span><i><motion.u initial={false} animate={{ scaleX: s >= 2 ? v / 100 : 0 }} transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }} /></i></div>
        ))}</div>
        <div className="pv-wins">{["Add a meta description", "Compress hero image"].map((w, i) => <motion.div key={w} {...show(s >= 3 + i)}><Check size={12} /> {w}</motion.div>)}</div>
      </div>
    </div>
  );
}

function Count({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const run = (t: number) => { const p = Math.min(1, (t - t0) / 1100); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(run); };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [to, reduce]);
  return <>{reduce ? to : v}</>;
}

/* ---------- Website Health: checks ticking through ---------- */
function Health({ play }: { play: boolean }) {
  const s = useStep(play, 5, 600);
  const rows = [
    { icon: Mail, k: "SPF · DKIM · DMARC", v: "All set" },
    { icon: Ban, k: "Spam blacklists", v: "Clean" },
    { icon: ShieldCheck, k: "SSL certificate", v: "Valid · 87 days" },
    { icon: Globe, k: "Domain age", v: "12 years" },
  ];
  return (
    <div className="pv pv-hl">
      <Bar title="Health check / northoak.com" right={<b className="pv-live">Checking</b>} />
      <div className="pv-body">
        {rows.map((r, i) => {
          const Icon = r.icon;
          const done = s > i;
          return (
            <div key={r.k} className={"pv-hrow" + (done ? " done" : "")}>
              <Icon size={15} /><span>{r.k}</span>
              <AnimatePresence mode="wait" initial={false}>
                {done
                  ? <motion.b key="v" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>{r.v} <Check size={12} /></motion.b>
                  : <motion.em key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>checking</motion.em>}
              </AnimatePresence>
            </div>
          );
        })}
        <div className="pv-spark">
          <div className="pv-hscore"><span>Spam score</span><b><Count to={s >= 5 ? 8 : 0} /></b><i><motion.u initial={false} animate={{ scaleX: s >= 5 ? 0.08 : 0 }} transition={{ duration: 0.9, ease: EASE }} /></i></div>
          <small>Low risk: unlikely to be flagged as spam</small>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mockup Designer: one logo, many scenes ---------- */
function Mockup({ play }: { play: boolean }) {
  const s = useStep(play, 3, 1300, 1800);
  const scenes = ["Shop sign", "Coffee cup", "Business card"];
  const at = Math.min(s, 2);
  return (
    <div className="pv pv-mk">
      <Bar title="Brand kit / North Oak" right={<b>Export</b>} />
      <div className="pv-body">
        <div className={"pv-scene sc" + at}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={at} className="pv-obj" initial={{ opacity: 0, scale: 0.92, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.5, ease: EASE }}>
              <span className="pv-logo">N<small>NORTH OAK</small></span>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="pv-thumbs">{scenes.map((n, i) => <span key={n} className={i === at ? "on" : ""}>{n}</span>)}</div>
      </div>
    </div>
  );
}

export function ProductPreview({ id, play = true }: { id: ProductId; play?: boolean }) {
  if (id === "receptionist") return <Receptionist play={play} />;
  if (id === "builder") return <Builder play={play} />;
  if (id === "seo") return <Seo play={play} />;
  if (id === "health") return <Health play={play} />;
  return <Mockup play={play} />;
}
