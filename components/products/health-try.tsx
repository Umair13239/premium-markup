"use client";
// The free Website Health check, running right on the product page (premiummarkup.com), so the tool
// itself is what Google indexes. It calls the portal's public API; the full report opens in the app.
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Gauge } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/site.config";
import { EASE } from "./motion";

type Report = {
  health: number; authority: number; spamScore: number; ageYears?: number; rank?: number; issues: string[];
  usage?: { left: number; limit: number };
};

const STEPS = ["Looking up the domain", "Reading the mail setup", "Checking spam blacklists", "Checking the SSL certificate", "Looking up the domain record", "Loading the website", "Working out the scores"];
const portal = () => (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000" : siteConfig.leadsPortalUrl.replace(/\/$/, ""));
const norm = (v: string) => v.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/[/?#].*$/, "");

function Ring({ value, label, hint, invert = false, delay = 0 }: { value: number; label: string; hint: string; invert?: boolean; delay?: number }) {
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, value || 0));
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const t0 = performance.now() + delay * 1000;
    const step = (t: number) => { const p = Math.max(0, Math.min(1, (t - t0) / 1100)); setN(Math.round(v * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [v, delay, reduce]);
  return (
    <div className="ht-score">
      <div className="ht-ring">
        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" className="trk" />
          <motion.circle cx="50" cy="50" r="44" className="val" initial={{ pathLength: reduce ? (invert ? 1 - v / 100 : v / 100) : 0 }} animate={{ pathLength: invert ? 1 - v / 100 : v / 100 }} transition={{ duration: reduce ? 0 : 1.1, delay, ease: EASE }} />
        </svg>
        <strong>{reduce ? v : n}</strong>
      </div>
      <b>{label}</b><small>{hint}</small>
    </div>
  );
}

export function HealthTry() {
  const reduce = useReducedMotion();
  const [site, setSite] = useState("");
  const [state, setState] = useState<"idle" | "run" | "done" | "err">("idle");
  const [step, setStep] = useState(0);
  const [rep, setRep] = useState<Report | null>(null);
  const [err, setErr] = useState<{ msg: string; signup?: boolean } | null>(null);
  const [checked, setChecked] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // "Try it free" (any link to #try) brings the search bar to the middle of the screen with the cursor
  // already in it, so the visitor can type a site straight away. Same when the page opens on #try.
  useEffect(() => {
    const go = () => {
      const f = formRef.current;
      if (!f) return;
      const top = f.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + f.offsetHeight / 2;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), reduce ? 0 : 650);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href="#try"]');
      if (!a) return;
      e.preventDefault();
      history.replaceState(null, "", "#try");
      go();
    };
    document.addEventListener("click", onClick);
    if (window.location.hash === "#try") setTimeout(go, 300);
    return () => document.removeEventListener("click", onClick);
  }, [reduce]);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const s = norm(site);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)) { setErr({ msg: "Enter a website like example.com" }); setState("err"); return; }
    setSite(s); setChecked(s); setErr(null); setRep(null); setState("run"); setStep(0);
    let i = 0;
    const iv = setInterval(() => { i = Math.min(i + 1, STEPS.length - 1); setStep(i); }, reduce ? 50 : 1500);
    try {
      const r = await fetch(`${portal()}/api/tools/check?site=${encodeURIComponent(s)}`);
      const j = await r.json();
      clearInterval(iv);
      if (j.error) { setErr({ msg: j.error, signup: !!j.signup }); setState("err"); return; }
      for (let k = i; k < STEPS.length; k++) { setStep(k); if (!reduce) await new Promise((ok) => setTimeout(ok, 110)); }
      setRep(j); setState("done");
    } catch {
      clearInterval(iv); setErr({ msg: "Could not reach the checker. Try again in a moment." }); setState("err");
    }
  }

  const app = `${portal()}/health`;
  return (
    <div className="ht" id="try">
      <form ref={formRef} className="ht-form" onSubmit={run}>
        <Gauge size={22} className="ht-ic" aria-hidden="true" />
        <input ref={inputRef} value={site} onChange={(e) => setSite(e.target.value)} placeholder="example.com" inputMode="url" aria-label="Website address" autoComplete="off" required />
        <button type="submit" className="pp-btn" disabled={state === "run"}>{state === "run" ? "Checking…" : "Check website"}</button>
      </form>
      <p className="ht-note">Free: 3 checks a day without an account. No email needed.</p>

      <AnimatePresence mode="wait" initial={false}>
        {state === "run" && (
          <motion.div key="run" className="ht-card ht-run" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: EASE }}>
            <div className="ht-run-head"><b>Checking {checked}</b><span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span></div>
            <div className="ht-prog"><motion.i animate={{ scaleX: (step + 1) / STEPS.length }} transition={{ duration: 0.5, ease: EASE }} /></div>
            <ol>{STEPS.map((x, k) => <li key={x} className={k < step ? "done" : k === step ? "now" : ""}><span className="ht-dot">{k < step && <Check size={12} strokeWidth={3} />}</span>{x}</li>)}</ol>
          </motion.div>
        )}
        {state === "done" && rep && (
          <motion.div key="done" className="ht-card ht-done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="ht-done-head"><b>{checked}</b>{rep.usage && <span>{rep.usage.left} of {rep.usage.limit} free checks left today</span>}</div>
            <div className="ht-scores">
              <Ring value={rep.health} label="Health score" hint={rep.issues.length ? `${rep.issues.length} thing${rep.issues.length > 1 ? "s" : ""} to fix` : "Looking good"} />
              <Ring value={rep.authority} label="Authority" hint={rep.rank ? `Top ${rep.rank.toLocaleString("en-US")} worldwide` : "Not in the top 1M yet"} delay={0.12} />
              <Ring value={rep.spamScore} label="Spam score" hint={rep.spamScore <= 20 ? "Low risk" : rep.spamScore <= 50 ? "Medium risk" : "High risk"} invert delay={0.24} />
            </div>
            {rep.issues.length > 0 && <ol className="ht-fix">{rep.issues.slice(0, 3).map((x, k) => <motion.li key={x} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + k * 0.08, ease: EASE }}><span>{String(k + 1).padStart(2, "0")}</span>{x}</motion.li>)}</ol>}
            <a className="pp-btn sm" href={`${app}?site=${encodeURIComponent(checked)}`}>See the full report <ArrowRight size={15} /></a>
          </motion.div>
        )}
        {state === "err" && err && (
          <motion.div key="err" className="ht-card ht-err" role="alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p>{err.msg}</p>
            {err.signup && <a className="pp-btn sm" href={app}>Sign up free for 15 a day <ArrowRight size={15} /></a>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
