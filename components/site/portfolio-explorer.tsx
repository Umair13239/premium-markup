"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ArrowUpRight, ChevronLeft, ChevronRight, Plus, Minus, ExternalLink } from "lucide-react";
import type { PortfolioData, PortfolioProject, PortfolioImage } from "@/lib/portfolio-types";
import { GROUP_KEYS } from "@/lib/portfolio-types";

const GROUP_LABELS: Record<(typeof GROUP_KEYS)[number], string> = {
  posts: "Posts",
  thumbs: "Thumbnails",
  logos: "Logos",
  flyers: "Flyers",
  certs: "Certificates",
  covers: "Book Covers",
};
const EASE = [0.22, 1, 0.36, 1] as const;

type Bucket = { key: "website" | "videos" | (typeof GROUP_KEYS)[number]; label: string; n: number };

function bucketsOf(p: PortfolioProject): Bucket[] {
  const out: Bucket[] = [];
  if (p.website) out.push({ key: "website", label: "Website", n: 1 });
  if (p.videos?.length) out.push({ key: "videos", label: "Videos", n: p.videos.length });
  for (const k of GROUP_KEYS) if (p[k]?.length) out.push({ key: k, label: GROUP_LABELS[k], n: p[k].length });
  return out;
}
function coverIsLogo(p: PortfolioProject) {
  if (p.coverFit === "contain") return true;
  if (p.coverFit === "cover") return false;
  return !p.website && !p.posts?.length && !p.thumbs?.length && !!p.logos?.length;
}
const host = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

/* ------------------------------- Lightbox ------------------------------- */

function Lightbox({ items, index, onClose, onIndex }: { items: PortfolioImage[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ sx: 0, sy: 0, ox: 0, oy: 0, moved: false });
  const multi = items.length > 1;
  const it = items[index];

  // Navigating resets zoom/pan. Done in the handler (not an effect).
  const go = useCallback((d: number) => { setScale(1); setPos({ x: 0, y: 0 }); onIndex((index + d + items.length) % items.length); }, [index, items.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "+" || e.key === "=") setScale((s) => Math.min(5, s + 0.5));
      else if (e.key === "-") setScale((s) => Math.max(1, s - 0.5));
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [go, onClose]);

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setScale((s) => Math.min(5, Math.max(1, Math.round((s + (e.deltaY < 0 ? 0.3 : -0.3)) * 100) / 100)));
  }
  function onDown(e: React.MouseEvent) {
    if (scale <= 1) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false };
    setDragging(true);
  }
  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => {
      const d = drag.current;
      if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 3) d.moved = true;
      setPos({ x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) });
    };
    const up = () => setDragging(false);
    addEventListener("mousemove", move);
    addEventListener("mouseup", up);
    return () => { removeEventListener("mousemove", move); removeEventListener("mouseup", up); };
  }, [dragging]);

  // Pan only applies while zoomed — derived, so no state to reset.
  const px = scale > 1 ? pos.x : 0;
  const py = scale > 1 ? pos.y : 0;

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-[5vw]"
      style={{ background: "rgba(6,6,10,0.92)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget && scale === 1 && !drag.current.moved) onClose(); }}
      onWheel={onWheel}
    >
      <button onClick={onClose} className="absolute right-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-white/20">
        Close <X className="h-3.5 w-3.5" />
      </button>
      {multi && <div className="absolute top-7 left-0 right-0 text-center text-xs tabular-nums tracking-widest text-white/60">{index + 1} / {items.length}</div>}
      {multi && (
        <>
          <button onClick={() => go(-1)} className="absolute left-[3vw] top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-cobalt hover:text-white" aria-label="Previous"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => go(1)} className="absolute right-[3vw] top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-cobalt hover:text-white" aria-label="Next"><ChevronRight className="h-5 w-5" /></button>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={it?.src}
        alt={it?.title || ""}
        onMouseDown={onDown}
        onDoubleClick={() => setScale((s) => (s > 1 ? 1 : 2.5))}
        draggable={false}
        className="max-h-[84vh] max-w-full rounded-lg shadow-2xl select-none"
        style={{ transform: `translate(${px}px,${py}px) scale(${scale})`, transition: dragging ? "none" : "transform .16s ease", cursor: scale > 1 ? "grab" : "default" }}
      />
      {it?.title && <div className="absolute bottom-[76px] left-0 right-0 text-center text-sm text-white/70">{it.title}</div>}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1.5 backdrop-blur">
        <button onClick={() => setScale((s) => Math.max(1, s - 0.5))} disabled={scale <= 1} className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-cobalt disabled:opacity-40"><Minus className="h-4 w-4" /></button>
        <span className="min-w-[54px] text-center text-xs tabular-nums text-white/70">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale((s) => Math.min(5, s + 0.5))} disabled={scale >= 5} className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-cobalt disabled:opacity-40"><Plus className="h-4 w-4" /></button>
      </div>
    </motion.div>
  );
}

/* --------------------------- Website preview ---------------------------- */

function SitePreview({ p }: { p: PortfolioProject }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const w = p.website!;
  const [failed, setFailed] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const fr = frameRef.current, ifr = iframeRef.current;
    if (!fr || !ifr) return;
    const fit = () => { const s = fr.clientWidth / 1440; if (!s) return; ifr.style.height = fr.clientHeight / s + "px"; ifr.style.transform = `scale(${s})`; };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(fr);
    const t = setTimeout(() => { if (!loaded.current && w.url) setFailed(true); }, 2600);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [w.url]);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[color:var(--color-surface-2)]">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line" /><span className="h-2.5 w-2.5 rounded-full bg-line" /><span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="mono ml-2 flex-1 truncate text-xs text-muted">{w.url ? host(w.url) : "Live link coming soon"}</span>
        {w.url && <a href={w.url} target="_blank" rel="noopener noreferrer" className="mono inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-cobalt hover:border-cobalt">Open live <ExternalLink className="h-3 w-3" /></a>}
      </div>
      <div ref={frameRef} className="relative bg-[color:var(--color-surface-2)]" style={{ aspectRatio: "16 / 10", overflow: "hidden" }}>
        {w.url && !failed ? (
          <iframe ref={iframeRef} src={w.url} title={p.name} loading="lazy" onLoad={() => { loaded.current = true; }} style={{ width: 1440, height: 900, border: 0, transformOrigin: "top left" }} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            {w.shot && <Image src={w.shot} alt="" fill className="object-cover object-top opacity-30" />}
            <p className="relative text-sm text-muted">{w.url ? "This site blocks embedding." : "Live link coming soon."}</p>
            {w.url && <a href={w.url} target="_blank" rel="noopener noreferrer" className="relative inline-flex items-center gap-2 rounded-full bg-cobalt px-5 py-2.5 text-sm font-medium text-white">Open live site <ExternalLink className="h-4 w-4" /></a>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Project modal ---------------------------- */

function ProjectModal({ p, catLabel, onClose }: { p: PortfolioProject; catLabel: string; onClose: () => void }) {
  const bs = useMemo(() => bucketsOf(p), [p]);
  const [tab, setTab] = useState<Bucket["key"] | null>(bs[0]?.key ?? null);
  const [lb, setLb] = useState<{ items: PortfolioImage[]; i: number } | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const w = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    w?.stop();
    return () => { document.body.style.overflow = ""; w?.start(); };
  }, []);

  const group = tab && tab !== "website" && tab !== "videos" ? (p[tab] ?? []) : [];
  const videos = p.videos ?? [];

  return (
    <motion.div className="fixed inset-0 z-[110] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        data-lenis-prevent
        className="relative flex h-full w-full max-w-[1080px] flex-col overflow-y-auto border-l border-line bg-[color:var(--color-surface)]"
        initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <button onClick={onClose} className="sticky top-4 z-10 mr-6 mt-4 ml-auto inline-flex items-center gap-2 rounded-full border border-line bg-[color:var(--color-surface-2)] px-4 py-2 text-xs font-medium uppercase tracking-wider hover:border-cobalt">Close <X className="h-3.5 w-3.5" /></button>
        <div className="px-6 md:px-10">
          <p className="tag-label">{catLabel}</p>
          <h2 className="mt-2 text-3xl md:text-5xl">{p.name}</h2>
          {p.role && <p className="mono mt-3 text-muted">{p.role}</p>}

          {bs.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-b border-line pb-5">
              {bs.map((b) => (
                <button key={b.key} onClick={() => setTab(b.key)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${tab === b.key ? "border-cobalt bg-cobalt text-white" : "border-line text-muted hover:border-cobalt/60 hover:text-ink"}`}>
                  {b.label}{b.key !== "website" && <span className="text-xs opacity-70">{b.n}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-8 md:px-10">
          {tab === "website" && <SitePreview p={p} />}
          {tab === "videos" && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v, j) => (
                <div key={j} className="overflow-hidden rounded-xl border border-line bg-[color:var(--color-surface-2)]">
                  <video src={v.src} controls preload="metadata" playsInline className="block aspect-[9/16] w-full bg-black object-cover" />
                  {v.title && <div className="border-t border-line px-4 py-3 text-sm text-muted">{v.title}</div>}
                </div>
              ))}
            </div>
          )}
          {tab && tab !== "website" && tab !== "videos" && (
            <div className={`grid gap-5 ${tab === "logos" || tab === "posts" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
              {group.map((im, j) => {
                const isLogo = tab === "logos";
                return (
                  <button key={j} onClick={() => setLb({ items: group, i: j })} className="group block overflow-hidden rounded-xl border border-line text-left" data-cursor="Preview ↗">
                    <div className={`relative overflow-hidden ${isLogo ? "flex items-center justify-center p-[12%]" : ""}`} style={{ aspectRatio: isLogo ? "1 / 1" : undefined, background: isLogo ? "#f4f1ea" : "var(--color-surface-2)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={im.src} alt={im.title || ""} loading="lazy" className={`transition-transform duration-700 group-hover:scale-105 ${isLogo ? "max-h-full w-auto object-contain" : "w-full object-contain"}`} />
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[color:#0b0b0f]">◉ Preview</span>
                      </span>
                    </div>
                    {im.title && <div className="border-t border-line px-4 py-3 text-sm text-muted">{im.title}</div>}
                  </button>
                );
              })}
            </div>
          )}
          {!tab && <p className="text-muted">Nothing added yet.</p>}
        </div>
      </motion.div>

      <AnimatePresence>
        {lb && <Lightbox items={lb.items} index={lb.i} onClose={() => setLb(null)} onIndex={(i) => setLb({ items: lb.items, i })} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------- Explorer ------------------------------- */

export function PortfolioExplorer({ data }: { data: PortfolioData }) {
  const reduce = useReducedMotion();
  const [activeCat, setActiveCat] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  // Deep-link: /work?project=<id> opens that project's modal directly (used by
  // the homepage showcase slider). Read once on mount, then tidy the URL.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("project");
    if (id && data.projects.some((p) => p.id === id)) {
      setOpenId(id);
      const url = new URL(window.location.href);
      url.searchParams.delete("project");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters = useMemo(() => {
    const withCounts = data.categories
      .map((c) => ({ ...c, n: data.projects.filter((p) => p.category === c.id).length }))
      .filter((c) => c.n > 0);
    return [{ id: "all", label: "All work", n: data.projects.length }, ...withCounts];
  }, [data]);

  const shown = activeCat === "all" ? data.projects : data.projects.filter((p) => p.category === activeCat);
  const catLabel = (id: string) => data.categories.find((c) => c.id === id)?.label || id;
  const openProject = data.projects.find((p) => p.id === openId) || null;

  return (
    <div className="container-editorial py-14 md:py-20">
      {/* filter bar */}
      <div className="mb-10 flex flex-wrap gap-2.5" role="tablist" aria-label="Filter work by category">
        {filters.map((f) => {
          const on = f.id === activeCat;
          return (
            <button key={f.id} role="tab" aria-selected={on} onClick={() => setActiveCat(f.id)} className={`mono relative rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-cobalt text-cobalt" : "border-line text-muted hover:border-cobalt/50 hover:text-ink"}`}>
              {on && !reduce && <motion.span layoutId="pf-filter-pill" className="absolute inset-0 rounded-full" style={{ background: "color-mix(in oklab, var(--color-cobalt) 10%, transparent)" }} transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">{f.label} <span className="opacity-60">{f.n}</span></span>
            </button>
          );
        })}
      </div>

      {/* grid */}
      <motion.div layout className="grid items-start gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => {
            const isLogo = coverIsLogo(p);
            const tags = bucketsOf(p);
            return (
              <motion.button
                key={p.id}
                onClick={() => setOpenId(p.id)}
                initial={reduce ? false : { opacity: 0 }}
                whileInView={reduce ? undefined : { opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: EASE }}
                className="group block text-left transition-transform duration-300 ease-out hover:-translate-y-1.5"
                data-cursor="Explore ↗"
                style={{ ["--acc" as string]: p.accent || "var(--color-cobalt)" }}
              >
                <div className="relative overflow-hidden rounded-[12px] border border-line transition-colors duration-300 group-hover:border-cobalt/50">
                  <div className="relative" style={{ aspectRatio: "16 / 11", background: isLogo ? "radial-gradient(125% 125% at 28% 18%, color-mix(in srgb, var(--acc) 22%, #f2ede1), #eae3d5)" : "var(--color-surface-2)" }}>
                    {p.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover} alt={p.name} loading="lazy" className={`h-full w-full transition-transform duration-700 group-hover:scale-[1.05] ${isLogo ? "object-contain p-[13%]" : "object-cover object-top"}`} />
                    )}
                    <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-sm">{catLabel(p.category)}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg transition-colors group-hover:text-cobalt md:text-xl">{p.name}</h3>
                    {p.role && <p className="mono mt-1 text-xs text-muted">{p.role}</p>}
                  </div>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-cobalt transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((t) => <span key={t.key} className="mono rounded-full border border-line px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted">{t.label}</span>)}
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {openProject && <ProjectModal key={openProject.id} p={openProject} catLabel={catLabel(openProject.category)} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </div>
  );
}
