"use client";
// Motion primitives for the product pages (PRODUCTS-PLAN.md §2). Rules from CLAUDE.md, Motion:
// observers sit on unclipped parents, word spacing stays outside the masks, scroll-linked opacity
// floors at .35, and every primitive renders plainly under reduced motion.
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import "./motion.css";

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Rise: words lift out of a mask ---------- */
export function Rise({ text, className, delay = 0, mount = false }: { text: string; className?: string; delay?: number; mount?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const on = mount || inView;
  const words = text.split(" ");
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="mx-mask"><motion.span className="mx-word" initial={{ y: "110%" }} animate={{ y: on ? 0 : "110%" }} transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.06 }}>{w}</motion.span></span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </span>
  );
}

/* ---------- FadeUp ---------- */
export function FadeUp({ children, delay = 0, className, y = 18 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.7, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}

/* ---------- Count: a number that counts up when it comes into view ---------- */
export function Count({ to, suffix = "", duration = 1.4 }: { to: number; suffix?: string; duration?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, reduce, to, duration]);
  return <span ref={ref}>{(reduce ? to : v).toLocaleString("en-US")}{suffix}</span>;
}

/* ---------- WordLight: a statement that lights up word by word with scroll ---------- */
function LitWord({ w, i, n, progress }: { w: string; i: number; n: number; progress: MotionValue<number> }) {
  const o = useTransform(progress, [i / n, (i + 1) / n], [0.35, 1]);
  return <motion.span style={{ opacity: o }}>{w} </motion.span>;
}
export function WordLight({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const words = text.split(" ");
  return <p ref={ref} className={className}>{reduce ? text : words.map((w, i) => <LitWord key={i} w={w} i={i} n={words.length} progress={scrollYProgress} />)}</p>;
}

/* ---------- Tilt: a card that leans toward the pointer ---------- */
export function Tilt({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 220, damping: 20 }), sy = useSpring(ry, { stiffness: 220, damping: 20 });
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} style={{ rotateX: sx, rotateY: sy, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}>
      {children}
    </motion.div>
  );
}

/* ---------- Marquee: an endless row, paused on hover ---------- */
export function Marquee({ items, speed = 38 }: { items: string[]; speed?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className="mx-marquee static">{items.map((x) => <span key={x}>{x}</span>)}</div>;
  const row = items.map((x, i) => <span key={i}>{x}</span>);
  return (
    <div className="mx-marquee" aria-label={items.join(", ")}>
      <div className="mx-marquee-track" style={{ animationDuration: `${speed}s` }} aria-hidden="true">{row}{row}</div>
    </div>
  );
}

/* ---------- BigIcon: a product icon that draws itself, then floats in 3D with the pointer and scroll ---------- */
export function BigIcon({ icon: Icon, size = 280, label }: { icon: LucideIcon; size?: number; label?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scrollRot = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const scrollY = useTransform(scrollYProgress, [0, 1], [24, -24]);
  // the pointer tilts the tile in 3D; springs make it feel physical, not stiff
  const px = useMotionValue(0), py = useMotionValue(0);
  const rx = useSpring(useTransform(py, (v) => v * -16), { stiffness: 160, damping: 18, mass: 0.6 });
  const ry = useSpring(useTransform(px, (v) => v * 16), { stiffness: 160, damping: 18, mass: 0.6 });
  // lucide draws with paths/circles/rects: give each a pathLength of 1 so CSS can draw it
  useEffect(() => {
    ref.current?.querySelectorAll("svg *").forEach((el) => el.setAttribute("pathLength", "1"));
  }, []);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { px.set(0); py.set(0); };
  return (
    <motion.div
      ref={ref}
      className={"mx-bigicon" + (inView || reduce ? " drawn" : "")}
      style={reduce ? { width: size, height: size } : { width: size, height: size, rotate: scrollRot, y: scrollY, perspective: 900 }}
      onPointerMove={reduce ? undefined : onMove}
      onPointerLeave={reduce ? undefined : onLeave}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <motion.div className="mx-bigicon-float" style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
        <span className="mx-bigicon-glow" aria-hidden="true" />
        <span className="mx-bigicon-tile"><Icon strokeWidth={1.3} /></span>
        <span className="mx-bigicon-shine" aria-hidden="true" />
      </motion.div>
      <span className="mx-bigicon-ring r1" aria-hidden="true" />
      <span className="mx-bigicon-ring r2" aria-hidden="true" />
    </motion.div>
  );
}

/* ---------- DrawSteps: numbered steps joined by a line that scroll draws ---------- */
function Step({ i, n, k, t, progress }: { i: number; n: number; k: string; t: string; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const at = n > 1 ? i / (n - 1) : 1;
  const o = useTransform(progress, [at - 0.15, at], [0.35, 1]);
  const s = useTransform(progress, [at - 0.15, at], [0.6, 1]);
  return (
    <motion.li style={reduce ? undefined : { opacity: o }}>
      <motion.span className="mx-node" style={reduce ? undefined : { scale: s }}>{String(i + 1).padStart(2, "0")}</motion.span>
      <b>{k}</b>
      <p>{t}</p>
    </motion.li>
  );
}
export function DrawSteps({ steps }: { steps: { k: string; t: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  return (
    <div ref={ref} className="mx-steps" style={{ ["--n" as string]: steps.length }}>
      <div className="mx-line h"><motion.i style={{ scaleX: reduce ? 1 : scrollYProgress }} /></div>
      <div className="mx-line v"><motion.i style={{ scaleY: reduce ? 1 : scrollYProgress }} /></div>
      <ol>{steps.map((s, i) => <Step key={i} i={i} n={steps.length} k={s.k} t={s.t} progress={scrollYProgress} />)}</ol>
    </div>
  );
}

/* ---------- ScrollFilm: a pinned section where scroll plays a video, captions change as it goes ----------
   The video must be all-intra (every frame a keyframe, scripts/product-media.mjs "scrub") so seeking is
   instant. Phones and reduced motion get the plain loop and the captions as a list instead. */
const FINE = "(pointer: fine) and (min-width: 900px)";
const subscribeFine = (cb: () => void) => { const m = matchMedia(FINE); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
type FilmProps = { scrub: string; loop: { webm: string; mp4: string }; poster: string; alt: string; captions: { k: string; t: string }[]; screens?: number };
export function ScrollFilm(props: FilmProps) {
  const reduce = useReducedMotion();
  const fine = useSyncExternalStore(subscribeFine, () => matchMedia(FINE).matches, () => null);
  if (fine === null || reduce || !fine) return <LoopFilm {...props} play={fine !== null && !reduce} />;
  return <ScrubFilm {...props} />;
}

function LoopFilm({ loop, poster, alt, captions, play }: FilmProps & { play: boolean }) {
  return (
    <section className="mx-film flat">
      <div className="mx-film-frame">
        <video autoPlay={play} muted loop playsInline preload="metadata" poster={poster} aria-label={alt}>
          <source src={loop.webm} type="video/webm" /><source src={loop.mp4} type="video/mp4" />
        </video>
      </div>
      <ol className="mx-film-list">{captions.map((c, i) => <li key={i}><span>{String(i + 1).padStart(2, "0")}</span><b>{c.k}</b><p>{c.t}</p></li>)}</ol>
    </section>
  );
}

// Only mounted in scrub mode, so useScroll always has its section to watch.
function ScrubFilm({ scrub, poster, alt, captions, screens = 4 }: FilmProps) {
  const ref = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const target = useRef(0);
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    target.current = v;
    const i = Math.min(captions.length - 1, Math.floor(v * captions.length));
    setActive((cur) => (cur === i ? cur : i));
  });

  // ease currentTime toward the scroll position each frame, so fast scrolling stays smooth
  useEffect(() => {
    let raf = 0, cur = 0;
    const tick = () => {
      const v = vid.current;
      if (v && v.duration) {
        cur += (target.current - cur) * 0.14;
        const t = Math.min(v.duration - 0.05, cur * v.duration);
        if (Math.abs(v.currentTime - t) > 0.01) v.currentTime = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={ref} className="mx-film" style={{ height: `${screens * 100}vh` }}>
      <div className="mx-film-sticky">
        <div className="mx-film-grid">
          <div className="mx-film-caps">
            <div className="mx-film-rail"><motion.i style={{ scaleY: fill }} /></div>
            {captions.map((c, i) => (
              <div key={i} className={"mx-film-cap" + (i === active ? " on" : "")}>
                <span>{String(i + 1).padStart(2, "0")}</span><b>{c.k}</b><p>{c.t}</p>
              </div>
            ))}
          </div>
          <div className="mx-film-frame">
            <video ref={vid} muted playsInline preload="auto" poster={poster} aria-label={alt} src={scrub} />
          </div>
        </div>
      </div>
    </section>
  );
}
