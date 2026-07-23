"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

// A result stat that counts up from zero when scrolled into view. Handles mixed
// strings like "3×", "0.7s", "+40%", "Page 1" by animating the numeric core and
// keeping any prefix/suffix. Reduced-motion users see the final value.
export function Stat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  // Stable across renders — recomputes only when `value` changes, so it can't
  // retrigger the animation effect on every frame.
  const m = useMemo(() => value.match(/^(\D*)(\d[\d.,]*)(.*)$/), [value]);
  // Start on the REAL value so the server-rendered HTML shows "99%", not "0%".
  // Crawlers, social previews and no-JS visitors were seeing zeros, which read
  // as a broken/empty site. The count-up is re-armed client-side below.
  const [disp, setDisp] = useState(value);

  useEffect(() => {
    if (!m || reduce) { setDisp(value); return; }
    // Not scrolled to yet — park it at zero so the count-up still has somewhere
    // to travel from (client-side only, after hydration).
    if (!inView) { setDisp(m[1] + "0" + m[3]); return; }
    const target = parseFloat(m[2].replace(/,/g, ""));
    const decimals = (m[2].split(".")[1] || "").length;
    const dur = 1100;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisp(m[1] + (target * eased).toFixed(decimals) + m[3]);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, m, reduce, value]);

  return (
    <div ref={ref}>
      <div className="mono text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">{disp}</div>
      <div className="mono mt-2 text-sm text-muted">{label}</div>
    </div>
  );
}
