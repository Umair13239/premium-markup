// Shared v2 motion layer: Lenis smooth scroll, liquid-glass lens on the nav (GPU blur
// while scrolling), nav turning dark over [data-dark] sections, cursor, magnetic buttons.
import Lenis from "lenis";

function lensMap(w: number, h: number, r: number, bw: number) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d")!, im = g.createImageData(w, h), d = im.data, cx = w / 2, cy = h / 2;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const px = i + .5 - cx, py = j + .5 - cy, qx = Math.abs(px) - (cx - r), qy = Math.abs(py) - (cy - r);
    let nx = 0, ny = 0, dist: number;
    if (qx > 0 && qy > 0) { const L = Math.hypot(qx, qy) || 1; dist = r - L; nx = qx / L * Math.sign(px); ny = qy / L * Math.sign(py); }
    else if (qx > qy) { dist = r - qx; nx = Math.sign(px); } else { dist = r - qy; ny = Math.sign(py); }
    const m = dist < bw ? Math.pow(1 - Math.max(dist, 0) / bw, 2.2) : 0, k = (j * w + i) * 4;
    d[k] = 128 - nx * m * 127; d[k + 1] = 128 - ny * m * 127; d[k + 2] = 128; d[k + 3] = 255;
  }
  g.putImageData(im, 0, 0); return c.toDataURL();
}

type Lens = HTMLElement & { _lens?: string; _f?: SVGFilterElement };

export function initShellFx(root: HTMLElement) {
  const ac = new AbortController(), sig = { signal: ac.signal }, pas = { signal: ac.signal, passive: true };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const q = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const qa = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
  let alive = true;
  const lenis = reduce || !fine ? null : new Lenis({ lerp: .12, wheelMultiplier: .9, touchMultiplier: 1.4 });

  /* ---- liquid glass lens (Chromium) on the nav; GPU blur while scrolling ---- */
  const lensOK = "chrome" in window && CSS.supports("backdrop-filter", "blur(1px)");
  const defs = q("#fx"), lensEls = qa<Lens>(".gnav");
  let uid = 0;
  const glass = (el: Lens) => {
    const w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return;
    const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2), s = +(el.dataset.s || 44), id = "lg" + uid++;
    const mtx = (a: string) => `<feColorMatrix in="${a}" type="matrix" values="${a == "r" ? "1 0 0 0 0 " : "0 0 0 0 0 "}${a == "g" ? "0 1 0 0 0 " : "0 0 0 0 0 "}${a == "b" ? "0 0 1 0 0 " : "0 0 0 0 0 "}0 0 0 1 0" result="${a}${a}"/>`;
    const dm = (sc: number, n: string) => `<feDisplacementMap in="SourceGraphic" in2="m" scale="${sc}" xChannelSelector="R" yChannelSelector="G" result="${n}"/>`;
    const f = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    Object.entries({ id, x: 0, y: 0, width: w, height: h, filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" }).forEach(([k, v]) => f.setAttribute(k, String(v)));
    f.innerHTML = `<feImage href="${lensMap(w, h, r, Math.min(r + 6, h / 2, 34))}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>` +
      dm(s, "r") + dm(s * 1.07, "g") + dm(s * 1.14, "b") + mtx("r") + mtx("g") + mtx("b") +
      `<feBlend in="rr" in2="gg" mode="screen" result="rg"/><feBlend in="rg" in2="bb" mode="screen"/>`;
    el._f?.remove(); el._f = f; defs.appendChild(f);
    el._lens = el.style.backdropFilter = `url(#${id}) blur(${el.dataset.b || .6}px) saturate(170%) brightness(1.03)`;
  };
  const glassAll = () => { if (lensOK) lensEls.forEach(glass); };
  glassAll();
  let rt = 0, st = 0, moving = false;
  addEventListener("resize", () => { clearTimeout(rt); rt = window.setTimeout(glassAll, 200); }, sig);
  const cheap = "none"; // while scrolling: no backdrop work at all (the .scrolling class makes the bar more opaque instead)
  addEventListener("scroll", () => {
    if (!lensOK) return;
    if (!moving) { moving = true; nav.classList.add("scrolling"); lensEls.forEach((e) => { if (e._lens) e.style.backdropFilter = cheap; }); }
    clearTimeout(st); st = window.setTimeout(() => { moving = false; nav.classList.remove("scrolling"); if (!overLive) lensEls.forEach((e) => { if (e._lens) e.style.backdropFilter = e._lens; }); }, 180);
  }, pas);

  const nav = q(".gnav"), darks = qa("[data-dark]"), lives = qa("[data-live]"), flats = qa("[data-flat]"), drifts = qa("[data-drift]"); let overLive = false;
  const frame = (t: number) => {
    if (!alive) return; requestAnimationFrame(frame);
    lenis?.raf(t);
    nav.classList.toggle("dk", darks.some((d) => { const r = d.getBoundingClientRect(); return r.top < 60 && r.bottom > 20; }));
    // [data-flat]: tilted back as it enters, flat by the time it is well in view. [data-drift]: rows slide with scroll.
    if (!reduce) {
      const fr = flats.map((el) => el.getBoundingClientRect()), dr = drifts.map((el) => (el.parentElement || el).getBoundingClientRect());
      flats.forEach((el, i) => { const r = fr[i]; if (r.bottom < -200 || r.top > innerHeight + 200) return; const k = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight * .75)));
        el.style.transform = `rotateX(${(1 - k) * 22}deg) scale(${.9 + .1 * k})`; });
      drifts.forEach((el, i) => { const r = dr[i]; if (r.bottom < 0 || r.top > innerHeight) return; const k = (innerHeight - r.top) / (innerHeight + r.height);
        el.style.transform = `translate3d(${(k - .5) * 420 * +(el.dataset.drift || 1)}px,0,0)`; });
    }
    // the CPU lens would re-run every frame over live-animated content ([data-live], the 3D hero)
    const live = lives.some((d) => { const r = d.getBoundingClientRect(); return r.top < 70 && r.bottom > 0; });
    if (lensOK && live !== overLive) { overLive = live; lensEls.forEach((e) => { if (e._lens) e.style.backdropFilter = live ? cheap : e._lens; }); }
  };
  requestAnimationFrame(frame);

  /* ---- cursor (clear glass ring) + magnetic buttons ---- */
  if (fine && !reduce) {
    const gc = q("#gc");
    let x = -100, y = -100, cx = x, cy = y;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; gc.classList.toggle("big", !!(e.target as Element).closest?.("a,button")); }, pas);
    const loop = () => { if (!alive) return; cx += (x - cx) * .2; cy += (y - cy) * .2; gc.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
    loop();
    qa(".pbtn").forEach((b) => {
      b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px,${(e.clientY - r.top - r.height / 2) * .22}px) scale(1.04)`; }, sig);
      b.addEventListener("pointerleave", () => { b.style.transform = ""; }, sig);
    });
  }

  /* ---- scroll reveals (.rv) + hover tilt ([data-tilt]) ---- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  const rvs = qa(".rv"); rvs.forEach((el) => io.observe(el));
  if (fine && !reduce) qa("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`; }, sig);
    el.addEventListener("pointerleave", () => { el.style.transform = ""; }, sig);
  });

  return () => { alive = false; io.disconnect(); ac.abort(); lenis?.destroy(); clearTimeout(rt); clearTimeout(st); lensEls.forEach((e) => e._f?.remove()); };
}
