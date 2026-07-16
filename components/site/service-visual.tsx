"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ServiceVisualVariant } from "@/lib/services";

// One distinct animated graphic per service. Each reveals/assembles when it
// enters view and carries a small continuous motion. All transform/opacity
// based; static under reduced-motion.
const ease = [0.22, 1, 0.36, 1] as const;
const iris = "var(--color-cobalt)";
const soft = "color-mix(in oklab, var(--color-ink) 9%, transparent)";
const softer = "color-mix(in oklab, var(--color-ink) 5%, transparent)";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-line bg-[color:var(--color-surface-2)]">
      <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: "linear-gradient(var(--color-line) 1px,transparent 1px),linear-gradient(90deg,var(--color-line) 1px,transparent 1px)", backgroundSize: "34px 34px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 45%,#000,transparent 82%)" }} />
      <div className="absolute inset-0 grid place-items-center p-8">{children}</div>
    </div>
  );
}

export function ServiceVisual({ variant }: { variant: ServiceVisualVariant }) {
  const reduce = useReducedMotion();
  // Gate every set of motion props through here: no-op under reduced motion,
  // and `any` keeps framer's strict Target typing happy for dynamic props.
  const m = (o: Record<string, unknown>): any => (reduce ? {} : o);
  const rise = (i: number) => m({ initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-40px" }, transition: { duration: 0.5, ease, delay: i * 0.08 } });
  const loop = (d = 0) => m({ animate: { y: [0, -6, 0] }, transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: d } });

  return (
    <Frame>
      {variant === "grid" && (
        <div className="grid w-full max-w-[280px] grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div key={i} {...rise(i)} className="aspect-square rounded-[4px]" style={{ background: i === 1 ? iris : soft }} />
          ))}
        </div>
      )}

      {variant === "code" && (
        <div className="w-full max-w-[300px] space-y-2.5 font-mono text-[11px]">
          {["<section>", "  <Hero fast />", "  <Work ranked />", "</section>"].map((l, i) => (
            <motion.div key={i} {...rise(i)} className="flex items-center gap-2">
              <span className="text-muted">{i + 1}</span>
              <span style={{ color: i === 1 || i === 2 ? iris : "var(--color-ink)" }}>{l}</span>
            </motion.div>
          ))}
        </div>
      )}

      {variant === "motion" && (
        <div className="w-full max-w-[280px] space-y-3">
          {[80, 55, 68, 40].map((w, i) => (
            <motion.div key={i} className="h-3 rounded-full" style={{ background: i === 0 ? iris : soft, width: w + "%" }}
              {...m({ animate: { width: [w + "%", w - 15 + "%", w + "%"] }, transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 } })} />
          ))}
        </div>
      )}

      {variant === "commerce" && (
        <motion.div {...loop()} className="w-full max-w-[220px] rounded-[8px] border border-line bg-[color:var(--color-surface)] p-4">
          <div className="aspect-[4/3] rounded-[5px]" style={{ background: "color-mix(in oklab, var(--color-cobalt) 16%, transparent)" }} />
          <div className="mt-3 h-2.5 w-3/4 rounded-full" style={{ background: soft }} />
          <div className="mt-2 flex items-center justify-between">
            <div className="h-2.5 w-10 rounded-full" style={{ background: soft }} />
            <motion.div className="rounded-[4px] px-3 py-1.5 text-[10px] font-medium text-white" style={{ background: iris }}
              {...m({ animate: { scale: [1, 1.06, 1] }, transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } })}>Add</motion.div>
          </div>
        </motion.div>
      )}

      {variant === "redesign" && (
        <div className="grid w-full max-w-[300px] grid-cols-2 gap-3">
          <div className="space-y-2 rounded-[6px] border border-line p-3 opacity-50">
            <div className="h-2 w-2/3 rounded-full" style={{ background: softer }} />
            <div className="h-2 w-1/2 rounded-full" style={{ background: softer }} />
            <div className="mt-3 h-6 w-full rounded-[3px]" style={{ background: softer }} />
          </div>
          <motion.div {...rise(1)} className="space-y-2 rounded-[6px] border p-3" style={{ borderColor: iris }}>
            <div className="h-2 w-3/4 rounded-full" style={{ background: soft }} />
            <div className="h-2 w-1/2 rounded-full" style={{ background: soft }} />
            <div className="mt-3 h-6 w-2/3 rounded-[3px]" style={{ background: iris }} />
          </motion.div>
        </div>
      )}

      {variant === "landing" && (
        <div className="w-full max-w-[220px] rounded-[8px] border border-line bg-[color:var(--color-surface)] p-5 text-center">
          <div className="mx-auto h-2.5 w-3/4 rounded-full" style={{ background: soft }} />
          <div className="mx-auto mt-2 h-2.5 w-1/2 rounded-full" style={{ background: softer }} />
          <motion.div className="mx-auto mt-5 h-8 w-28 rounded-[5px]" style={{ background: iris }}
            {...m({ animate: { boxShadow: ["0 0 0 0 rgba(124,123,255,0.5)", "0 0 0 12px rgba(124,123,255,0)"] }, transition: { duration: 2, repeat: Infinity } })} />
        </div>
      )}

      {variant === "uiux" && (
        <div className="w-full max-w-[260px]">
          <div className="space-y-2.5 rounded-[6px] border border-dashed border-line p-4">
            {[70, 90, 50].map((w, i) => (
              <motion.div key={i} className="h-3 rounded-[3px]" style={{ width: w + "%", background: soft }}
                {...m({ animate: { background: [softer, iris, softer] }, transition: { duration: 4, repeat: Infinity, delay: i * 0.5 } })} />
            ))}
          </div>
        </div>
      )}

      {variant === "seo" && (
        <svg viewBox="0 0 200 150" className="w-full max-w-[300px]">
          {[[100, 30], [50, 90], [150, 90], [50, 130], [150, 130]].map((p, i) => (
            <g key={i}>
              {i > 0 && <line x1="100" y1="34" x2={p[0]} y2={p[1]} stroke="var(--color-line)" strokeWidth="1.5" />}
              <motion.circle cx={p[0]} cy={p[1]} r={i === 0 ? 9 : 6} fill={i === 0 ? iris : "var(--color-surface)"} stroke={iris} strokeWidth="1.5"
                {...m({ initial: { scale: 0 }, whileInView: { scale: 1 }, viewport: { once: true }, transition: { delay: i * 0.12, type: "spring", stiffness: 300, damping: 18 } })} />
            </g>
          ))}
          {!reduce && <motion.circle r="3" fill={iris} animate={{ cx: [100, 50], cy: [34, 84] }} transition={{ duration: 1.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />}
        </svg>
      )}

      {variant === "maintenance" && (
        <svg viewBox="0 0 240 90" className="w-full max-w-[300px]">
          <polyline points="0,45 50,45 65,20 80,70 95,45 240,45" fill="none" stroke="var(--color-line)" strokeWidth="2" />
          <motion.polyline points="0,45 50,45 65,20 80,70 95,45 240,45" fill="none" stroke={iris} strokeWidth="2.5" strokeDasharray="300" strokeLinecap="round"
            {...m({ animate: { strokeDashoffset: [300, 0] }, transition: { duration: 2.2, repeat: Infinity, ease: "linear" } })} />
        </svg>
      )}

      {variant === "graphic" && (
        <div className="relative h-40 w-40">
          <motion.div className="absolute left-4 top-4 h-24 w-24 rounded-full" style={{ background: iris, mixBlendMode: "screen" }}
            {...m({ animate: { x: [0, 12, 0], y: [0, -8, 0] }, transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } })} />
          <motion.div className="absolute right-3 top-8 h-20 w-20" style={{ background: "var(--color-tag)", mixBlendMode: "screen" }}
            {...m({ animate: { rotate: [0, 25, 0] }, transition: { duration: 8, repeat: Infinity, ease: "easeInOut" } })} />
          <motion.div className="absolute bottom-3 left-10 h-16 w-16 rounded-[6px]" style={{ background: "color-mix(in oklab, var(--color-cobalt) 55%, #fff)", mixBlendMode: "screen" }}
            {...m({ animate: { x: [0, -10, 0], y: [0, 6, 0] }, transition: { duration: 7, repeat: Infinity, ease: "easeInOut" } })} />
        </div>
      )}
    </Frame>
  );
}
