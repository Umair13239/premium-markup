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
  const [disp, setDisp] = useState(m && !reduce ? m[1] + "0" + m[3] : value);

  useEffect(() => {
    if (!m || reduce) { setDisp(value); return; }
    if (!inView) return;
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
