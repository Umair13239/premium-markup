"use client";
// Raviko intro (~3.5 s, CSS only): red light streaks sweep in, the R mark wipes up, the wordmark
// slides out from behind it, then the streaks keep breathing. Words below scroll-light one by one.
import Image from "next/image";
import { useEffect, useRef } from "react";

const BARS = Array.from({ length: 34 }, (_, i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453, r = s - Math.floor(s);
  return { left: (i / 34) * 100 + r * 2, w: 0.6 + r * 3.4, h: 55 + r * 45, d: (r * 1.2).toFixed(2), o: 0.35 + r * 0.65, hot: r > 0.62 };
});

export function RavikoHero() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { // pause the looping streaks once the hero is off screen
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("off", !e.isIntersecting)); io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="rvh" aria-label="Raviko">
      <div className="rvh-bars" aria-hidden>
        {BARS.map((b, i) => (
          <i key={i} className={b.hot ? "hot" : undefined} style={{ left: b.left + "%", width: b.w + "vw", height: b.h + "%", animationDelay: b.d + "s", opacity: b.o } as React.CSSProperties} />
        ))}
      </div>
      <div className="rvh-logo">
        <span className="rvh-mark"><Image src="/cases/raviko/mark-white.png" alt="" width={640} height={892} priority /></span>
        <span className="rvh-word"><Image src="/cases/raviko/word-white.png" alt="Raviko" width={2417} height={618} priority /></span>
      </div>
      <p className="rvh-tag">Brand identity by Premium Markup</p>
    </section>
  );
}

const WORDS = ["Direct", "Functional", "Conversion", "Peer-Level", "Confident"];
export function RavikoWords() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("li")); let raf = 0, last = -1;
    const read = () => { raf = 0; const r = el.getBoundingClientRect(), p = Math.max(0, Math.min(.999, -r.top / (r.height - innerHeight)));
      const a = Math.floor(p * items.length); if (a !== last) { last = a; items.forEach((li, i) => li.classList.toggle("on", i === a)); } };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read(); addEventListener("scroll", on, { passive: true });
    return () => { removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section ref={ref} className="rvw"><div className="rvw-pin"><ul>{WORDS.map((w) => <li key={w}>{w}</li>)}</ul></div></section>
  );
}
