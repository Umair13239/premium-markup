// Homepage v2 scenes: one rAF loop for every scroll scene (all reads first, then
// writes), hero card float/tilt and count-ups. Shared motion lives in shell-fx.ts.
// Returns a cleanup so React can tear it all down on unmount.

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function initHomeFx(root: HTMLElement) {
  const ac = new AbortController(), sig = { signal: ac.signal }, pas = { signal: ac.signal, passive: true };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const qa = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
  let alive = true;

  /* ---- pointer ---- */
  let tmx = 0, tmy = 0, mx = 0, my = 0;
  addEventListener("pointermove", (e) => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, pas);

  /* ---- elements ---- */
  const top = q("#ptop"), hero = q("#hero"), stage = q("#stage"), copy = q("#copy");
  const story = q("#story"), slabs = qa(".slab"), floor = q("#floor"), lis = qa("#steps li"), bar = q("#bar");
  const say = q("#say"), words = qa("#sayp span"), end = q(".end");
  type Card = HTMLElement & { _h: number; _hx: number; _hy: number; _on: number; _d: number };
  const tcs = qa(".tc") as Card[];
  tcs.forEach((c, i) => {
    Object.assign(c, { _h: 0, _hx: 0, _hy: 0, _on: 0, _d: [1.4, 2, 1.1][i] || 1 });
    c.addEventListener("pointermove", (e) => { const b = c.getBoundingClientRect(); c._hx = (e.clientX - b.left) / b.width - .5; c._hy = (e.clientY - b.top) / b.height - .5; c._on = 1; }, sig);
    c.addEventListener("pointerleave", () => { c._on = 0; c._hx = c._hy = 0; }, sig);
  });
  const zs = slabs.map(() => 0); let act = -1;
  const prog = (r: DOMRect) => clamp(-r.top / (r.height - innerHeight), 0, 1);
  const vis = (r: DOMRect) => r.bottom > 0 && r.top < innerHeight;

  const frame = (t: number) => {
    if (!alive) return; requestAnimationFrame(frame);
    mx += (tmx - mx) * .07; my += (tmy - my) * .07; const T = t / 1000;
    // reads
    const rTop = top.getBoundingClientRect(), rHero = hero.getBoundingClientRect(), rStage = stage.getBoundingClientRect(), rStory = story.getBoundingClientRect();
    const rSay = say.getBoundingClientRect();
    // hero cards: idle float + parallax + hover tilt
    if (vis(rTop) && !reduce) tcs.forEach((c, i) => {
      c._h += (c._on - c._h) * .12;
      c.style.transform = `perspective(800px) translate3d(${mx * 26 * c._d + Math.cos(T * .7 + i * 2) * 5}px,${my * 26 * c._d + Math.sin(T * .9 + i * 1.7) * 9 - c._h * 8}px,0) rotateX(${-c._hy * 14 * c._h + Math.sin(T * .6 + i) * 2}deg) rotateY(${c._hx * 14 * c._h + Math.cos(T * .5 + i) * 3}deg) scale(${1 + .05 * c._h})`;
      c.style.setProperty("--gx", 50 + c._hx * 100 + "%"); c.style.setProperty("--gy", 50 + c._hy * 100 + "%");
    });
    // statement: words light up
    if (vis(rSay)) { const n = reduce ? words.length : Math.round(clamp(prog(rSay) * 1.15, 0, 1) * words.length); words.forEach((w, i) => w.classList.toggle("on", i < n)); }
    // portal: device tilted back -> flat + big; heading readable until covered
    if (vis(rHero)) {
      const hp = prog(rHero), p = reduce ? 0 : ease(hp);
      const mob = innerWidth < 760;
      if (mob) { // phones: the screen tilts back and straightens as it scrolls into view
        const k = reduce ? 1 : clamp((innerHeight - rStage.top) / (innerHeight * .85), 0, 1), e2 = ease(k);
        stage.style.transform = `perspective(1100px) rotateX(${32 * (1 - e2)}deg) scale(${.86 + .14 * e2}) translateY(${40 * (1 - e2)}px)`;
      } else stage.style.transform = `translate(-50%, ${-58 * p}vh) rotateX(${34 * (1 - p) + my * 3}deg) rotateY(${mx * 4}deg) scale(${.8 + .2 * p})`;
      copy.style.transform = mob ? "" : `translateY(${-p * 140}px)`; copy.style.opacity = mob ? "1" : String(clamp(1 - (hp - .3) * 3, 0, 1));
    }
    // story: isometric stack that explodes; active slab lifts and glows
    if (vis(rStory)) {
      const sp = prog(rStory), a = Math.min(3, Math.floor(sp * 4)), ex = reduce ? 1 : ease(clamp(sp * 5, 0, 1));
      const base = `perspective(2200px) rotateX(${56 - my * 6}deg) rotateZ(${-40 + 14 * sp + mx * 8}deg) `;
      floor.style.transform = base + "translateZ(-70px)";
      slabs.forEach((s, i) => {
        const tz = (i - 1.5) * (30 + 104 * ex) + (i === a ? 64 : 0); zs[i] += (tz - zs[i]) * (reduce ? 1 : .12);
        s.style.transform = base + `translate3d(${i === a ? -14 : 0}px,${i === a ? 14 : 0}px,${zs[i]}px)`;
        s.style.zIndex = String(i === a ? 10 : i); s.style.opacity = String(i === a ? 1 : i > a ? .12 : .45);
      });
      if (a !== act) { act = a; lis.forEach((l, i) => l.classList.toggle("on", i === a)); slabs.forEach((s, i) => s.classList.toggle("on", i === a)); }
      bar.style.height = sp * 100 + "%";
    }
  };
  requestAnimationFrame(frame);

  /* ---- count-ups + closing reveal ---- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    if (e.target.classList.contains("end")) { e.target.classList.add("in"); return; }
    e.target.querySelectorAll<HTMLElement>("b[data-n]").forEach((b) => {
      const n = +b.dataset.n!, t0 = performance.now();
      const f = (t: number) => { const k = reduce ? 1 : Math.min(1, (t - t0) / 1600); b.textContent = Math.round(n * (1 - Math.pow(1 - k, 4))) + (b.dataset.s || ""); if (k < 1 && alive) requestAnimationFrame(f); };
      f(t0);
    });
  }), { threshold: .35 });
  io.observe(q("#stats")); io.observe(end);

  return () => { alive = false; ac.abort(); io.disconnect(); };
}
