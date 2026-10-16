"use client";
// How it works: six steps, each with a small live UI "stage" that plays when the step scrolls into view.
// Observers sit on the unclipped <section>, never on the clipped stage (see CLAUDE.md, Motion).
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { siteConfig } from "@/site.config";
import "./how.css";

const PORTAL = siteConfig.leadsPortalUrl;
const EASE = [0.22, 1, 0.36, 1] as const;
const DOT = "•";
const TICK = "✓";

/* ---------------- motion helpers ---------------- */

// Counts 0..max, one step every `ms` after `delay` ms, while `play` is on; resets when it stops.
function useTicker(play: boolean, max: number, ms: number, delay = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!play) return;
    let i = 0;
    let iv: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => {
      iv = setInterval(() => { i += 1; setN(i); if (i >= max && iv) clearInterval(iv); }, ms);
    }, delay);
    // reset when the stage leaves the screen, so it plays again from the start next time
    return () => { clearTimeout(t); if (iv) clearInterval(iv); setN(0); };
  }, [play, max, ms, delay]);
  return n;
}

// Shown/hidden state for one element of a stage, appearing `delay` seconds after the stage starts.
function pop(play: boolean, delay: number, reduce: boolean | null) {
  return {
    initial: false as const,
    animate: play || reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.96 },
    transition: reduce ? { duration: 0 } : { delay: play ? delay : 0, duration: 0.5, ease: EASE },
  };
}

function Typed({ text, play, delay = 0, speed = 80 }: { text: string; play: boolean; delay?: number; speed?: number }) {
  const reduce = useReducedMotion();
  const n = useTicker(play && !reduce, text.length, speed, delay);
  return <span>{reduce ? text : text.slice(0, n)}<i className="hw-caret" /></span>;
}

const AppBar = ({ title }: { title: string }) => (
  <div className="hw-bar"><i /><i /><i /><em>{title}</em></div>
);

/* ---------------- the six stages ---------------- */

function FindMock({ play }: { play: boolean }) {
  const reduce = useReducedMotion();
  const rows = [["Smile Dental Clinic", "Lahore", "4.8"], ["City Dental Care", "Karachi", "4.6"], ["Bright Teeth Studio", "Islamabad", "4.9"], ["Family Dentist", "Lahore", "4.5"]];
  return (
    <div className="hw-app">
      <AppBar title="Collect leads" />
      <div className="hw-body">
        <div className="hw-lbl">Category</div>
        <div className="hw-input"><Typed text="dentist" play={play} delay={300} /></div>
        <div className="hw-lbl">Cities</div>
        <div className="hw-chips">
          {["Lahore", "Karachi", "Islamabad"].map((c, i) => <motion.span key={c} {...pop(play, 1 + i * 0.15, reduce)}>{c}</motion.span>)}
        </div>
        <motion.div className="hw-btn" {...pop(play, 1.5, reduce)}>Run Pipeline</motion.div>
        <div className="hw-list">
          {rows.map((r, i) => (
            <motion.div key={r[0]} className="hw-row" {...pop(play, 1.9 + i * 0.18, reduce)}>
              <i className="hw-av">{r[0][0]}</i>
              <div><b>{r[0]}</b><small>{r[1]} {DOT} phone {DOT} email {DOT} website</small></div>
              <span className="hw-rate">{"★"} {r[2]}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckMock({ play }: { play: boolean }) {
  const reduce = useReducedMotion();
  const nums: [string, boolean][] = [["418", true], ["207", true], ["932", false], ["115", true], ["660", true]];
  const t = useTicker(play && !reduce, nums.length, 480, 500);
  const done = reduce ? nums.length : t;
  const on = nums.slice(0, done).filter((n) => n[1]).length;
  return (
    <div className="hw-app">
      <AppBar title="WhatsApp check" />
      <div className="hw-body">
        <div className="hw-meter"><motion.i initial={false} animate={{ width: `${(done / nums.length) * 100}%` }} transition={{ duration: reduce ? 0 : 0.4 }} /></div>
        <div className="hw-meta"><b>{done}</b> of {nums.length} checked {DOT} <b className="ok">{on}</b> on WhatsApp</div>
        <div className="hw-list">
          {nums.map(([n, ok], i) => (
            <div key={n} className="hw-row">
              <span className="hw-num">+92 3{DOT}{DOT} {DOT}{DOT}{DOT} {n}</span>
              {i < done
                ? <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={"hw-st " + (ok ? "ok" : "no")}>{ok ? "On WhatsApp" : "Not on WhatsApp"}</motion.span>
                : <span className="hw-st wait"><i className="hw-spin" />Checking</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditMock({ play }: { play: boolean }) {
  const reduce = useReducedMotion();
  const score = 58;
  const r = 52, c = 2 * Math.PI * r;
  const issues: [string, string][] = [["Takes 6 seconds to load on mobile", "bad"], ["No meta description for Google", "bad"], ["Images missing alt text", "warn"], ["Works on mobile screens", "ok"]];
  const n = useTicker(play && !reduce, issues.length, 380, 900);
  const num = useTicker(play && !reduce, score, 16, 200);
  const shown = reduce ? issues.length : n;
  return (
    <div className="hw-app">
      <AppBar title="SEO audit · yourclient.com" />
      <div className="hw-body hw-audit">
        <div className="hw-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} className="trk" />
            <motion.circle cx="60" cy="60" r={r} className="val" strokeDasharray={c} initial={false}
              animate={{ strokeDashoffset: play || reduce ? c - (c * score) / 100 : c }}
              transition={{ duration: reduce ? 0 : 1.2, ease: EASE, delay: play && !reduce ? 0.2 : 0 }} />
          </svg>
          <div><b>{reduce ? score : num}</b><small>SEO score</small></div>
        </div>
        <div className="hw-issues">
          {issues.map(([txt, k], i) => (i < shown
            ? <motion.div key={txt} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className={"hw-iss " + k}><i />{txt}</motion.div>
            : null))}
        </div>
      </div>
    </div>
  );
}

function SiteHero({ n }: { n: number }) {
  const show = (k: number) => ({ initial: false as const, animate: { opacity: n > k ? 1 : 0, y: n > k ? 0 : 12 }, transition: { duration: 0.45, ease: EASE } });
  return (
    <>
      <motion.div className="hw-s-nav" {...show(0)}><b>Glow Skin Clinic</b><span>Services</span><span>Reviews</span><em>Book</em></motion.div>
      <div className="hw-s-hero">
        <motion.h4 {...show(1)}>Clear, confident skin in Lahore.</motion.h4>
        <motion.p {...show(2)}>Laser {DOT} Hydrafacial {DOT} Acne care</motion.p>
        <motion.div className="hw-s-cta" {...show(3)}><span>Book on WhatsApp</span><span className="g">{"★"} 4.9 Google rating</span></motion.div>
      </div>
    </>
  );
}

function BuildMock({ play }: { play: boolean }) {
  const reduce = useReducedMotion();
  const t = useTicker(play && !reduce, 6, 340, 400);
  const s = reduce ? 6 : t;
  return (
    <div className="hw-app">
      <AppBar title="glowskin.premiummarkup.com" />
      <div className="hw-site">
        <SiteHero n={s} />
        <motion.div className="hw-recep" initial={false} animate={{ opacity: s > 4 ? 1 : 0, y: s > 4 ? 0 : 18, scale: s > 4 ? 1 : 0.92 }} transition={{ duration: 0.5, ease: EASE }}>
          <div className="hw-mic"><i /><i /><i /></div>
          <div><small>AI receptionist</small><b>Hi! Shall I book you in for Friday?</b></div>
        </motion.div>
      </div>
    </div>
  );
}

function RedesignMock({ play }: { play: boolean }) {
  const reduce = useReducedMotion();
  // one value drives both the clip and the handle, so the edge and the line can never drift apart
  const x = useMotionValue(55);
  const clip = useTransform(x, (v) => `inset(0 ${100 - v}% 0 0)`);
  const left = useTransform(x, (v) => `${v}%`);
  useEffect(() => {
    if (!play || reduce) { x.set(55); return; }
    const run = animate(x, [55, 86, 14, 55], { duration: 6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4 });
    return () => run.stop();
  }, [play, reduce, x]);
  return (
    <div className="hw-app">
      <AppBar title="Design Studio · redesign concept" />
      <div className="hw-ba">
        <div className="hw-after"><SiteHero n={6} /></div>
        <motion.div className="hw-before" style={{ clipPath: clip }}>
          <div className="hw-old">
            <div className="hd"><b>Glow Skin Clinic</b><nav><u>Home</u><u>About Us</u><u>Contact</u></nav></div>
            <div className="bd">
              <div className="img">Image coming soon</div>
              <div className="txt">
                <h5>Welcome to our website!</h5>
                <p>We are a skin clinic in Lahore. We offer many services. Please call us for more information.</p>
                <u>Click here</u>
                <small>Visitors: 001234</small>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div className="hw-div" style={{ left }}><span>{"‹ ›"}</span></motion.div>
        <span className="hw-tag l">Before</span><span className="hw-tag r">After</span>
      </div>
    </div>
  );
}

const COLS = ["New", "Contacted", "Talking", "Won"];
function PitchMock({ play }: { play: boolean }) {
  const reduce = useReducedMotion();
  const t = useTicker(play && !reduce, 5, 700, 500);
  const s = reduce ? 5 : t;
  const col = s <= 2 ? 0 : s - 2;
  return (
    <div className="hw-app">
      <AppBar title="Pitch on WhatsApp" />
      <div className="hw-chat">
        <motion.div className="hw-bub" initial={false} animate={{ opacity: s > 0 ? 1 : 0, y: s > 0 ? 0 : 16, scale: s > 0 ? 1 : 0.95 }} transition={{ duration: 0.45, ease: EASE }}>
          Hi! I built a free demo website for Glow Skin Clinic. Want a look?
          <span className={"hw-ticks" + (s > 1 ? " read" : "")}>{TICK}{TICK}</span>
        </motion.div>
      </div>
      <div className="hw-board">
        {COLS.map((c, i) => (
          <div key={c} className={"hw-col" + (i === 3 ? " won" : "")}>
            <h5>{c}</h5>
            {i === col ? <motion.div layoutId="hw-lead" className={"hw-card" + (i === 3 ? " won" : "")} transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}>Glow Skin Clinic</motion.div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- content ---------------- */

type Step = { id: string; kicker: string; title: string; line: string; points: string[]; Mock: ComponentType<{ play: boolean }> };
const STEPS: Step[] = [
  { id: "find", kicker: "Find", title: "Find businesses in any city.", line: "Pick a niche, add your cities and press run. Your list fills up with phones, emails, ratings and websites.", points: ["One category, as many cities as you like", "Saved to your list as results arrive", "Over 230,000 businesses already in the database"], Mock: FindMock },
  { id: "check", kicker: "Check", title: "Know who's on WhatsApp.", line: "Before you write a word, the portal checks every number in the background and marks the ones you can actually reach.", points: ["Runs while you keep working", "A clear status on every lead", "100 checks a day on the Free plan"], Mock: CheckMock },
  { id: "audit", kicker: "Audit", title: "Find what's broken on their site.", line: "Audit one website or a whole list. You get findings in plain language: what's wrong, why it matters and how to fix it.", points: ["Speed, SEO basics and downtime", "A branded report you can send the client", "Use a finding as your opening line"], Mock: AuditMock },
  { id: "build", kicker: "Build", title: "Show them a website, not a promise.", line: "One click turns a lead's details into a live demo site, so your pitch shows the work before they pay for it.", points: ["Their name, services and reviews", "An AI voice receptionist on every demo", "3 demo websites a day on the Free plan"], Mock: BuildMock },
  { id: "redesign", kicker: "Redesign", title: "Old website? Show them the after.", line: "Paste their current website. Design Studio rebuilds it as a modern concept, with a before and after you can send.", points: ["Before and after, ready to pitch", "Fine-tune it in the visual editor", "Ready in a few minutes"], Mock: RedesignMock },
  { id: "pitch", kicker: "Pitch", title: "Pitch, follow up, win.", line: "Send on WhatsApp in one tap or by email from your own mailbox, then move each lead across your board until it's won.", points: ["WhatsApp or email, from the portal", "A status board from New to Won", "Follow-up reminders when they go quiet"], Mock: PitchMock },
];

// 1 = has it, 0.5 = partly / only through an add-on, 0 = not offered. Columns follow TOOLS.
type Mark = 0 | 0.5 | 1;
const TOOLS: { name: string; focus: string }[] = [
  { name: "Leads Portal", focus: "All in one" },
  { name: "Apollo.io", focus: "B2B contacts" },
  { name: "Semrush", focus: "SEO" },
  { name: "HubSpot", focus: "CRM" },
  { name: "Wix", focus: "Website builder" },
];
const FEATURES: { f: string; v: Mark[] }[] = [
  { f: "Local business leads with phones and ratings", v: [1, 0.5, 0, 0, 0] },
  { f: "WhatsApp number check", v: [1, 0, 0, 0, 0] },
  { f: "Audit a prospect's website", v: [1, 0, 1, 0.5, 0] },
  { f: "One-click demo website for each lead", v: [1, 0, 0, 0, 0.5] },
  { f: "AI voice receptionist on every demo", v: [1, 0, 0, 0, 0] },
  { f: "Before and after redesign concept", v: [1, 0, 0, 0, 0] },
  { f: "Pitch on WhatsApp in one tap", v: [1, 0, 0, 0.5, 0.5] },
  { f: "Email pitches and a pipeline board", v: [1, 1, 0, 1, 0.5] },
  { f: "Free plan to start", v: [1, 1, 0.5, 1, 1] },
  { f: "Verified B2B contacts (job titles, direct emails)", v: [0.5, 1, 0, 0.5, 0] },
  { f: "Email sequences and automation", v: [0.5, 1, 0, 1, 0.5] },
  { f: "Keyword research and rank tracking", v: [0, 0, 1, 0.5, 0.5] },
  { f: "Build and host your own business website", v: [0, 0, 0, 1, 1] },
  { f: "Find, check, build and pitch in one place", v: [1, 0, 0, 0, 0] },
];

/* ---------------- sections ---------------- */

function Flow() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.5 });
  const reduce = useReducedMotion();
  const play = on || !!reduce;
  return (
    <div ref={ref} className="hw-flow">
      <svg className="hw-flow-line" viewBox="0 0 1000 4" preserveAspectRatio="none" aria-hidden="true">
        <motion.line x1="0" y1="2" x2="1000" y2="2" initial={false} animate={{ pathLength: play ? 1 : 0 }} transition={{ duration: reduce ? 0 : 1.4, ease: EASE }} />
      </svg>
      {STEPS.map((s, i) => (
        <motion.a key={s.id} href={"#" + s.id} className="hw-node" initial={false}
          animate={play ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 10 }}
          transition={{ delay: reduce ? 0 : 0.15 + i * 0.18, duration: 0.5, ease: EASE }}>
          <i>{String(i + 1).padStart(2, "0")}</i><span>{s.kicker}</span>
        </motion.a>
      ))}
    </div>
  );
}

function StepSection({ s, i }: { s: Step; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const Mock = s.Mock;
  return (
    <section ref={ref} id={s.id} className={"hw-step" + (i % 2 ? " rev" : "")}>
      <motion.div className="hw-copy" initial={false} animate={on || reduce ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 18 }} transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}>
        <div className="hw-k"><span>{String(i + 1).padStart(2, "0")}</span>{s.kicker}</div>
        <h2>{s.title}</h2>
        <p>{s.line}</p>
        <ul>{s.points.map((p) => <li key={p}><i aria-hidden="true">{TICK}</i>{p}</li>)}</ul>
      </motion.div>
      <div className="hw-stage" aria-hidden="true"><Mock play={on} /></div>
    </section>
  );
}

// Drawn as SVG strokes so the tick, dash and cross are the same weight and size at every scale.
const MARK_PATH = { yes: "M5.5 12.5l4 4L18.5 7.5", part: "M7 12h10", no: "M8 8l8 8M16 8l-8 8" };
function MarkIcon({ m, us }: { m: Mark; us?: boolean }) {
  const kind = m === 1 ? "yes" : m === 0.5 ? "part" : "no";
  const label = m === 1 ? "Yes" : m === 0.5 ? "Partly" : "No";
  return (
    <span className={"hw-m " + kind + (us && m === 1 ? " us" : "")} role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={MARK_PATH[kind]} /></svg>
    </span>
  );
}

function Compare() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.2 });
  const reduce = useReducedMotion();
  const play = on || !!reduce;
  // what each tool is missing that Leads Portal has (the last row is the summary, so it is left out)
  const rows = FEATURES.slice(0, -1);
  const adds = TOOLS.slice(1).map((t, k) => ({
    t,
    list: rows.filter((r) => r.v[0] === 1 && r.v[k + 1] === 0).map((r) => r.f),
    strong: rows.filter((r) => r.v[k + 1] === 1 && r.v[0] < 1).map((r) => r.f.replace(/ \(.*\)$/, "").toLowerCase()),
  }));
  return (
    <section id="compare" className="hw-compare">
      <div className="eyebrow">How it compares</div>
      <h2>One portal instead of a stack of subscriptions.</h2>
      <p>Each of these tools is excellent at its own job. Here is an honest look at where they fit, and where Leads Portal does more for someone selling to local businesses.</p>
      <div ref={ref} className="hw-mx-wrap">
        <table className="hw-mx">
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {TOOLS.map((t, i) => <th key={t.name} scope="col" className={i === 0 ? "us" : undefined}>{t.name}<small>{t.focus}</small></th>)}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((r, ri) => (
              <motion.tr key={r.f} initial={false} animate={play ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 10 }}
                transition={{ delay: reduce ? 0 : ri * 0.06, duration: 0.45, ease: EASE }} className={ri === FEATURES.length - 1 ? "sum" : undefined}>
                <th scope="row">{r.f}</th>
                {r.v.map((m, ci) => (
                  <td key={ci} className={ci === 0 ? "us" : undefined}>
                    <motion.span style={{ display: "inline-block" }} initial={false} animate={play ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
                      transition={reduce ? { duration: 0 } : { delay: 0.15 + ri * 0.06 + ci * 0.05, type: "spring", stiffness: 420, damping: 18 }}>
                      <MarkIcon m={m} us={ci === 0} />
                    </motion.span>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="hw-legend"><span><MarkIcon m={1} />Included</span><span><MarkIcon m={0.5} />Partly, or through an add-on</span><span><MarkIcon m={0} />Not offered</span></div>

      <div className="hw-adds">
        {adds.map(({ t, list, strong }) => (
          <div key={t.name} className="hw-add">
            <h3>Leads Portal vs {t.name}</h3>
            <p>Only in Leads Portal:</p>
            <ul>{list.map((f) => <li key={f}><i aria-hidden="true">+</i>{f}</li>)}</ul>
            {strong.length ? <p className="hw-add-alt">Pick {t.name} if you mainly need {strong.join(" or ")}.</p> : null}
          </div>
        ))}
      </div>
      <p className="hw-note">Based on our reading of each product&apos;s public features. Features change, so check each tool before you decide. Product names belong to their owners.</p>
    </section>
  );
}

export function HowItWorks() {
  const reduce = useReducedMotion();
  const rise = (d: number) => ({ initial: reduce ? false : { opacity: 0.35, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: EASE, delay: d } });
  return (
    <main className="hw">
      <section className="hw-hero">
        <motion.div className="eyebrow" {...rise(0)}>How it works</motion.div>
        <motion.h1 {...rise(0.05)}>From a city name to a <em>paid client</em>.</motion.h1>
        <motion.p {...rise(0.15)}>Six steps, one portal. Scroll down and watch each one happen.</motion.p>
        <motion.div className="hw-cta" {...rise(0.25)}>
          <a className="pbtn ink" href={PORTAL}>Start free</a>
          <a className="hw-link" href="#tour">Watch the 80-second tour</a>
        </motion.div>
        <Flow />
      </section>

      <div className="hw-steps">
        {STEPS.map((s, i) => <StepSection key={s.id} s={s} i={i} />)}
      </div>

      <section id="tour" className="hw-video">
        <div className="eyebrow">The tour</div>
        <h2>See it all in 80 seconds.</h2>
        <div className="hw-video-frame">
          <video controls playsInline preload="metadata" poster="/home/general-poster.webp">
            <source src="/home/general.mp4" type="video/mp4" />
            <source src="/home/general.webm" type="video/webm" />
          </video>
        </div>
      </section>

      <Compare />

      <section className="hw-end">
        <h2>Try step one now.</h2>
        <p>Pick one niche and one city. You will see real businesses in a few minutes.</p>
        <a className="pbtn brand" href={PORTAL}>Start free</a>
        <small>Free plan: 1,000 leads, 100 WhatsApp checks and 3 demo websites a day.</small>
      </section>
    </main>
  );
}
