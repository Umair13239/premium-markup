"use client";
// Work page preview: click any piece ([data-full]) to open it large; arrows / swipe / keys move
// through the same section. Right-click, drag and long-press saving are blocked on work images.
import { useCallback, useEffect, useRef, useState } from "react";

type Item = { src: string; alt: string; bg?: string };

export function Lightbox() {
  const [list, setList] = useState<Item[]>([]);
  const [i, setI] = useState(-1);
  const open = i >= 0;
  const sx = useRef(0);
  const close = useCallback(() => setI(-1), []);
  const go = useCallback((d: number) => setI((x) => (x + d + list.length) % list.length), [list.length]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const fig = (e.target as Element).closest?.<HTMLElement>("[data-full]");
      if (!fig) return;
      const sec = fig.closest(".gal, .wsec") || document;
      const figs = Array.from(sec.querySelectorAll<HTMLElement>("[data-full]"));
      setList(figs.map((f) => ({ src: f.dataset.full!, alt: f.querySelector("img")?.alt || "", bg: f.dataset.bg })));
      setI(figs.indexOf(fig));
    };
    const noSave = (e: Event) => { if ((e.target as Element).closest?.(".wsec img, .gal img, .lbox img")) e.preventDefault(); };
    document.addEventListener("click", onClick);
    document.addEventListener("contextmenu", noSave);
    document.addEventListener("dragstart", noSave);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("contextmenu", noSave); document.removeEventListener("dragstart", noSave); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => { removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
  }, [open, close, go]);

  if (!open) return null;
  const it = list[i];
  return (
    <div className="lbox" data-lenis-prevent role="dialog" aria-modal="true" aria-label={it.alt} onClick={close}
      onTouchStart={(e) => { sx.current = e.touches[0].clientX; }} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      {it.bg
        // logos open on a card (white, or dark for reversed marks) so transparent edges never show
        ? <div key={it.src} className="lcard" style={{ background: it.bg }} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution preview */}
            <img src={it.src} alt={it.alt} draggable={false} />
          </div>
        // eslint-disable-next-line @next/next/no-img-element -- full-resolution preview
        : <img key={it.src} src={it.src} alt={it.alt} draggable={false} onClick={(e) => e.stopPropagation()} />}
      <p className="lcap">{it.alt}<span>{i + 1} / {list.length}</span></p>
      {list.length > 1 && <>
        <button type="button" className="lnav prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }}>‹</button>
        <button type="button" className="lnav next" aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }}>›</button>
      </>}
      <button type="button" className="lclose" aria-label="Close" onClick={close}>×</button>
    </div>
  );
}
