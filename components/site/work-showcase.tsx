"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

export type ShowcaseItem = {
  id: string;
  name: string;
  cover: string;
  accent?: string;
  categoryLabel?: string;
};

/**
 * 3D coverflow project slider — replaces the old video reel.
 * Real project mockups that rotate through depth with spring physics.
 * Prev/next, dot indicators, drag, autoplay (pauses on hover), keyboard,
 * and a full reduced-motion fallback (static, no 3D, no autoplay).
 */
export function WorkShowcase({ items }: { items: ShowcaseItem[] }) {
  const reduce = useReducedMotion();
  const n = items.length;
  const [index, setIndex] = useState(0);
  const [w, setW] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const drag = useRef<{ x: number; active: boolean }>({ x: 0, active: false });

  // Measure the stage so card offsets are precise and responsive.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + n) % n), [n]);
  const jump = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  // Autoplay.
  useEffect(() => {
    if (reduce || n <= 1) return;
    const id = setInterval(() => { if (!hovering.current && !drag.current.active) go(1); }, 4600);
    return () => clearInterval(id);
  }, [reduce, n, go]);

  // Keyboard when the slider is focused.
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  };

  // Pointer drag.
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, active: true }; };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    drag.current.active = false;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  };

  const cardW = Math.min(Math.max(w * 0.6, 240), 760);
  const cardH = cardW * 0.6;
  const step = cardW * 0.52; // horizontal spacing between neighbours

  // Signed, wrapped offset so the carousel loops the short way round.
  const offsetOf = (i: number) => {
    let off = i - index;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    return off;
  };

  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 210, damping: 28, mass: 0.9 };

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => (drag.current.active = false)}
      onKeyDown={onKey}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Selected project showcase"
    >
      {/* 3D stage */}
      <div
        ref={stageRef}
        className="relative mx-auto"
        style={{ height: cardH + 48, perspective: reduce ? undefined : 1600, cursor: "grab", touchAction: "pan-y" }}
      >
        {items.map((it, i) => {
          const off = offsetOf(i);
          const abs = Math.abs(off);
          const visible = abs <= 2;
          const active = off === 0;
          const target = reduce
            ? { x: 0, opacity: active ? 1 : 0, scale: 1, rotateY: 0, zIndex: active ? 10 : 0 }
            : {
                x: off * step,
                rotateY: off * -26,
                scale: active ? 1 : Math.max(0.72, 0.86 - (abs - 1) * 0.08),
                opacity: visible ? (active ? 1 : 0.5 - (abs - 1) * 0.18) : 0,
                zIndex: 20 - abs,
              };
          return (
            <motion.div
              key={it.id}
              className="absolute left-1/2 top-1/2"
              style={{
                width: cardW,
                height: cardH,
                marginLeft: -cardW / 2,
                marginTop: -cardH / 2,
                transformStyle: "preserve-3d",
                pointerEvents: active ? "auto" : "none",
              }}
              initial={false}
              animate={target}
              transition={spring}
              aria-hidden={!active}
            >
              <div
                className="group relative h-full w-full overflow-hidden rounded-2xl border"
                style={{
                  borderColor: active ? `color-mix(in oklab, ${it.accent || "#7c7bff"} 55%, transparent)` : "var(--color-line)",
                  boxShadow: active
                    ? `0 40px 90px -30px rgba(6,8,24,0.7), 0 0 0 1px color-mix(in oklab, ${it.accent || "#7c7bff"} 30%, transparent)`
                    : "0 30px 70px -40px rgba(6,8,24,0.6)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.cover}
                  alt={it.name}
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading={abs <= 1 ? "eager" : "lazy"}
                />
                {/* caption — only meaningful on the active card */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5"
                  style={{ background: "linear-gradient(to top, rgba(6,8,20,0.85), transparent 70%)", opacity: active ? 1 : 0 }}
                >
                  <div>
                    {it.categoryLabel && (
                      <span className="mono flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/70">
                        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: it.accent || "#7c7bff" }} />
                        {it.categoryLabel}
                      </span>
                    )}
                    <h3 className="mt-1.5 text-lg font-semibold text-white md:text-xl">{it.name}</h3>
                  </div>
                  <Link
                    href="/work"
                    className="pointer-events-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/25"
                    aria-label={`View ${it.name} and more work`}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* controls */}
      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/70 backdrop-blur transition-colors hover:border-cobalt/50 hover:text-cobalt"
          aria-label="Previous project"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Choose project">
          {items.map((it, i) => {
            const active = i === index;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => jump(i)}
                role="tab"
                aria-selected={active}
                aria-label={it.name}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: active ? 26 : 8,
                  background: active
                    ? "linear-gradient(120deg, var(--color-cobalt), #7c5cff)"
                    : "color-mix(in oklab, var(--color-ink) 22%, transparent)",
                }}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/70 backdrop-blur transition-colors hover:border-cobalt/50 hover:text-cobalt"
          aria-label="Next project"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
