"use client";
// Social posts: the first few on the page; "Show all" opens a full-screen gallery overlay
// (the page underneath never grows). Clicking a post in either opens the preview (Lightbox).
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Media } from "@/lib/work-media";

function Tile({ m, i, pop }: { m: Media; i: number; pop?: boolean }) {
  return (
    <figure data-full={m.src} className={"mtile" + (pop ? " pop" : "")} style={pop ? ({ "--d": `${Math.min(i, 20) * 35}ms` } as React.CSSProperties) : undefined}>
      <Image src={m.thumb} alt={m.title} width={m.w} height={m.h} unoptimized loading="lazy" style={{ background: m.bg }} />
      <figcaption><b>{m.brand}</b><span>{m.title}</span></figcaption>
    </figure>
  );
}

export function PostsGrid({ items, first }: { items: Media[]; first: number }) {
  const [open, setOpen] = useState(false);

  // warm the cache while the page is idle, so the gallery opens instantly
  useEffect(() => {
    const warm = () => items.slice(first).forEach((m) => { const im = new window.Image(); im.decoding = "async"; im.src = m.thumb; });
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const t = w.requestIdleCallback ? w.requestIdleCallback(warm) : window.setTimeout(warm, 1500);
    return () => { if (!w.requestIdleCallback) clearTimeout(t); };
  }, [items, first]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !document.querySelector(".lbox")) setOpen(false); };
    addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => { removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div className="masonry">{items.slice(0, first).map((m, i) => <Tile key={m.src} m={m} i={i} />)}</div>
      {items.length > first && (
        <div className="more"><button type="button" className="pbtn ink" onClick={() => setOpen(true)}>Show all {items.length} posts</button></div>
      )}
      {open && (
        <div className="gal" role="dialog" aria-modal="true" aria-label="All social posts" data-lenis-prevent>
          <header className="gal-head">
            <div><b>Social campaigns</b><span>{items.length} posts</span></div>
            <button type="button" className="lclose" aria-label="Close" onClick={() => setOpen(false)}>×</button>
          </header>
          <div className="gal-body"><div className="masonry">{items.map((m, i) => <Tile key={m.src} m={m} i={i} pop />)}</div></div>
        </div>
      )}
    </>
  );
}
