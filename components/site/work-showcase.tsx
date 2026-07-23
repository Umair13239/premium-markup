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
  const didDrag = useRef(false); // guards the card link from firing after a drag

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
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, active: true }; didDrag.current = false; };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    drag.current.active = false;
    didDrag.current = Math.abs(dx) > 8; // any real movement = a drag, not a click
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
  };

  // On phones the card has to be bigger (and the caption smaller), otherwise
  // the title wraps up over the artwork and hides it.
  const isNarrow = w > 0 && w < 640;
  const cardW = Math.min(Math.max(w * (isNarrow ? 0.86 : 0.6), 240), 760);
  const cardH = cardW * (isNarrow ? 0.68 : 0.6);
  const step = cardW * (isNarrow ? 0.68 : 0.52); // horizontal spacing between neighbours

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
          // Cards stay FULLY opaque so nothing behind them bleeds through the
          // "transparent" side cards. Depth/recession is done with a dark
          // scrim overlay (below), not element opacity.
          const target = reduce
            ? { x: 0, opacity: active ? 1 : 0, scale: 1, rotateY: 0, zIndex: active ? 10 : 0 }
            : {
                x: off * step,
                rotateY: off * -26,
                scale: active ? 1 : Math.max(0.72, 0.86 - (abs - 1) * 0.08),
                opacity: visible ? 1 : 0,
                zIndex: 20 - abs,
              };
          const dim = active ? 0 : Math.min(0.62, 0.36 + (abs - 1) * 0.22);
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
              <Link
                href={`/work?project=${it.id}`}
                onClick={(e) => { if (didDrag.current) e.preventDefault(); }}
                tabIndex={active ? 0 : -1}
                aria-label={`Open project: ${it.name}`}
                draggable={false}
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-[#0d1018]"
                style={{
                  borderColor: active ? `color-mix(in oklab, ${it.accent || "#7c7bff"} 55%, transparent)` : "var(--color-line)",
                  boxShadow: active
                    ? `0 40px 90px -30px rgba(6,8,24,0.7), 0 0 0 1px color-mix(in oklab, ${it.accent || "#7c7bff"} 30%, transparent)`
                    : "0 30px 70px -40px rgba(6,8,24,0.6)",
                }}
              >
                {/* artwork — the caption never sits on top of it */}
                <div className="relative min-h-0 flex-1 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.cover}
                    alt={it.name}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading={abs <= 1 ? "eager" : "lazy"}
                  />
                </div>

                {/* solid caption bar — readable over ANY cover, light or dark */}
                <div
                  className={`flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-[#0d1018] ${
                    isNarrow ? "px-3 py-2" : "px-4 py-3"
                  }`}
                >
                  <div className="min-w-0">
                    {it.categoryLabel && (
                      <span className={`mono flex items-center gap-1.5 uppercase tracking-[0.16em] text-white/55 ${isNarrow ? "text-[8px]" : "text-[10px]"}`}>
                        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: it.accent || "#7c7bff" }} />
                        <span className="truncate">{it.categoryLabel}</span>
                      </span>
                    )}
                    <h3 className={`truncate font-semibold text-white ${isNarrow ? "text-xs" : "text-base md:text-lg"}`}>{it.name}</h3>
                  </div>
                  <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors group-hover:bg-white/25 ${isNarrow ? "h-7 w-7" : "h-9 w-9"}`}>
                    <ArrowUpRight className={isNarrow ? "h-3.5 w-3.5" : "h-4 w-4"} />
                  </span>
                </div>

                {/* recession scrim over the whole card (keeps side cards opaque) */}
                <div
                  className="pointer-events-none absolute inset-0 z-[3] bg-[#080a14] transition-opacity duration-500"
                  style={{ opacity: dim }}
                  aria-hidden="true"
                />
              </Link>
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
