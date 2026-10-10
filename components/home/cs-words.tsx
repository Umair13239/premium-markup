"use client";
// Brand words: pinned while you scroll; each word lights up in turn (one rAF-throttled scroll read, transform/opacity only).
import { useEffect, useRef } from "react";

export function CsWords({ words }: { words: string[] }) {
  const sec = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sec.current; if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("li"));
    let raf = 0, last = -1;
    const read = () => {
      raf = 0; const r = el.getBoundingClientRect(), span = r.height - innerHeight;
      const p = Math.max(0, Math.min(.999, -r.top / span)), a = Math.floor(p * items.length);
      el.style.setProperty("--p", p.toFixed(3));
      if (a !== last) { last = a; items.forEach((li, i) => li.classList.toggle("on", i === a)); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section ref={sec} className="cs-words" data-dark>
      <div className="cs-words-pin"><ul>{words.map((w) => <li key={w}>{w}</li>)}</ul><i className="cs-words-bar" /></div>
    </section>
  );
}
