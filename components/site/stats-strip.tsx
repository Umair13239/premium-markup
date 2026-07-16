"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

// TODO: replace placeholder figures with real numbers before launch.
const STATS = [
  { value: 120, suffix: "+", label: "sites shipped", decimals: 0 },
  { value: 0.8, suffix: "s", label: "average load time", decimals: 1 },
  { value: 96, suffix: "%", label: "client retention", decimals: 0 },
];

function useCountUp(target: number, decimals: number, run: boolean) {
  const [val, setVal] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setVal(target);
      return;
    }
    let raf = 0;
    const dur = 900;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setVal(target * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, reduce]);
  return val.toFixed(decimals);
}

function Stat({ value, suffix, label, decimals, run }: (typeof STATS)[number] & { run: boolean }) {
  const display = useCountUp(value, decimals, run);
  return (
    <div>
      <div className="mono text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        {display}
        <span className="text-cobalt">{suffix}</span>
      </div>
      <div className="mono mt-2 text-sm text-muted">{label}</div>
    </div>
  );
}

export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className="grid grid-cols-1 gap-10 sm:grid-cols-3">
      {STATS.map((s) => (
        <Stat key={s.label} {...s} run={inView} />
      ))}
    </div>
  );
}
