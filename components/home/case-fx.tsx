"use client";
// Case study motion: each board opens (clip reveal) as it enters, its image settles from a zoom and
// drifts with scroll (parallax); headline words rise in turn. One rAF loop, transform/clip only.
import { useEffect } from "react";

export function CaseFx() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const figs = Array.from(document.querySelectorAll<HTMLElement>(".cs-boards figure"));
    const vis = new Set<HTMLElement>();
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? vis.add(e.target as HTMLElement) : vis.delete(e.target as HTMLElement))), { rootMargin: "120px 0px" });
    // full-bleed flows (.flow) only reveal once via the shared .rv observer — no per-frame work
    figs.forEach((f) => { if (f.closest(".flow")) return; f.classList.add("fx"); if (!f.closest(".stack")) io.observe(f); });
    document.querySelectorAll<HTMLElement>(".cs-big").forEach((h) => {
      if (h.dataset.split) return; h.dataset.split = "1";
      const walk = (n: Node): void => { Array.from(n.childNodes).forEach((c) => {
        if (c.nodeType === 3) { const frag = document.createDocumentFragment(); (c.textContent || "").split(/(\s+)/).forEach((w) => { if (!w.trim()) { frag.append(w); return; } const s = document.createElement("span"); s.className = "w"; s.innerHTML = `<i>${w}</i>`; frag.append(s); }); c.replaceWith(frag); }
        else if (c.nodeType === 1) walk(c); }); };
      walk(h); h.querySelectorAll<HTMLElement>(".w i").forEach((i, k) => (i.style.transitionDelay = k * 70 + "ms"));
      const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { h.classList.add("in"); o.disconnect(); } }), { threshold: .4 }); o.observe(h);
    });
    // stacked boards: each sticks (tall ones stick once fully shown); the one beneath shrinks and dims as the next covers it
    const stack = Array.from(document.querySelectorAll<HTMLElement>(".cs-boards.stack > figure"));
    let stackTop: number[] = [], lastY = -1; const stackC: number[] = [];
    const sizeStack = () => { stack.forEach((f) => (f.style.top = Math.min(0, innerHeight - f.offsetHeight) + "px"));
      // natural document offset of each board's top (sticky doesn't change where its slot starts)
      let y = stack.length ? stack[0].parentElement!.getBoundingClientRect().top + scrollY : 0; stackTop = stack.map((f) => { const t = y; y += f.offsetHeight; return t; }); lastY = -1; };
    sizeStack(); addEventListener("resize", sizeStack);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick); const H = innerHeight;
      vis.forEach((f) => {
        const r = f.getBoundingClientRect();
        const e = Math.max(0, Math.min(1, (H - r.top) / (H * .55)));            // entering: 0 → 1
        const p = Math.max(0, Math.min(1, (H - r.top) / (H + r.height)));        // passing: 0 → 1
        f.style.setProperty("--e", e.toFixed(3)); f.style.setProperty("--p", p.toFixed(3));
      });
      if (stack.length && scrollY !== lastY) {
        lastY = scrollY;
        for (let i = 0; i < stack.length - 1; i++) {
          const top = stackTop[i + 1] - scrollY; // next board's position, from cached offsets (no layout reads)
          const c = top > H ? 0 : top < 0 ? 1 : Math.round((1 - top / H) * 100) / 100;
          if (c !== stackC[i]) { stackC[i] = c; stack[i].style.setProperty("--c", String(c)); }
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", sizeStack); };
  }, []);
  return null;
}
