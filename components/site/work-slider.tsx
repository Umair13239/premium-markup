"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { ProjectDTO } from "@/lib/projects";

// Draggable, auto-advancing showcase slider with glass controls. Native scroll +
// snap for buttery touch/mobile; pointer-drag + glass arrow buttons on desktop.
// Auto-advances, pauses on hover/drag, and stops entirely for reduced-motion.
export function WorkSlider({ projects }: { projects: ProjectDTO[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(false);
  const [progress, setProgress] = useState(0);
  const hovering = useRef(false);
  const drag = useRef<{ down: boolean; startX: number; startLeft: number; moved: boolean }>({ down: false, startX: 0, startLeft: 0, moved: false });

  useEffect(() => { setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);

  const step = useCallback((dir: 1 | -1) => {
    const el = track.current; if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: dir * w, behavior: "smooth" });
  }, []);

  // progress bar
  useEffect(() => {
    const el = track.current; if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // auto-advance
  useEffect(() => {
    if (reduce || projects.length < 2) return;
    const id = setInterval(() => { if (!hovering.current && !drag.current.down) step(1); }, 4800);
    return () => clearInterval(id);
  }, [reduce, projects.length, step]);

  // pointer drag
  const onDown = (e: React.PointerEvent) => {
    const el = track.current; if (!el) return;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    el.classList.add("grabbing");
  };
  const onMove = (e: React.PointerEvent) => {
    const el = track.current; if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  };
  const onUp = () => { const el = track.current; drag.current.down = false; el?.classList.remove("grabbing"); };

  if (!projects.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <div
        ref={track}
        className="drag-track flex cursor-grab gap-6 overflow-x-auto pb-2"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}`}
            data-card
            data-cursor="View project ↗"
            className="group relative block w-[82%] shrink-0 overflow-hidden rounded-[12px] border border-line sm:w-[62%] lg:w-[46%]"
            onClick={(e) => { if (drag.current.moved) e.preventDefault(); }}
          >
            <div className="relative" style={{ aspectRatio: "16 / 10" }}>
              <Image src={p.image || "/generated/og.png"} alt={`${p.name} — ${p.sector}`} fill draggable={false} sizes="(max-width: 640px) 82vw, 46vw" className="pm-shot object-cover group-hover:scale-[1.05]" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, color-mix(in oklab, #05040a 88%, transparent))" }} />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <div>
                  <h3 className="font-display text-xl font-extrabold tracking-tight text-[#ece8e1] md:text-2xl">{p.name}</h3>
                  <p className="mono mt-1 text-xs text-[#c6cad3]">{[p.sector, p.results[0]?.stat].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#ece8e1]">
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* controls */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="Previous" className="glass flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:text-cobalt">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next" className="glass flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:text-cobalt">
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-line">
          <div className="absolute inset-y-0 left-0 rounded-full bg-cobalt transition-[width] duration-150" style={{ width: `${Math.max(12, progress * 100)}%` }} />
        </div>
        <span className="mono hidden text-xs text-muted sm:inline">drag to explore</span>
      </div>
    </div>
  );
}
