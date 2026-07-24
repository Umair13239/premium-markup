"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Button } from "./button";
import { Magnetic } from "./magnetic";

const OPEN = '<h1 class="premium">';
const CLOSE = "</h1>";

/* ---------- syntax-highlighted code, revealed line by line ---------- */
const tag = (t: string) => <span style={{ color: "#e79490" }}>{t}</span>;
const str = (t: string) => <span style={{ color: "#7ee2b8" }}>{t}</span>;
const fn = (t: string) => <span style={{ color: "#e6c07b" }}>{t}</span>;
const dim = (t: string) => <span style={{ color: "#5b6373" }}>{t}</span>;
const kw = (t: string) => <span style={{ color: "#8aa2ff" }}>{t}</span>;
const pl = (t: string) => <span style={{ color: "#cdd3e0" }}>{t}</span>;

const LINES: React.ReactNode[] = [
  <>{dim("// hand-built, not page-built")}</>,
  <>{kw("export function ")}{fn("Home")}{pl("() {")}</>,
  <>{"  "}{kw("return ")}{pl("(")}</>,
  <>{"    "}{tag("<main")} {fn("class")}{pl("=")}{str('"fast"')}{tag(">")}</>,
  <>{"      "}{tag("<Hero")} {fn("load")}{pl("=")}{str('"0.6s"')} {tag("/>")}</>,
  <>{"      "}{tag("<Work")} {fn("ranked ")}{tag("/>")}</>,
  <>{"    "}{tag("</main>")}</>,
  <>{"  "}{pl(")")}</>,
  <>{pl("}")}</>,
];

function CodeWindow() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const [shown, setShown] = useState(reduce ? LINES.length : 0);

  useEffect(() => {
    if (reduce) return;
    let i = 0;
    const id = setInterval(() => { i += 1; setShown(i); if (i >= LINES.length) clearInterval(id); }, 260);
    return () => clearInterval(id);
  }, [reduce]);

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  }

  return (
    <div style={{ perspective: 1200 }} className="w-full">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => { rx.set(0); ry.set(0); }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={`code-window ${reduce ? "" : "floaty"} mx-auto max-w-[520px] p-1.5`}
      >
        <div className="flex items-center gap-2 border-b border-[#23262f] px-3 py-2.5">
          <span className="code-dot" style={{ background: "#ff5f57" }} />
          <span className="code-dot" style={{ background: "#febc2e" }} />
          <span className="code-dot" style={{ background: "#28c840" }} />
          <span className="mono ml-2 text-[11px] text-[#5b6373]">Home.tsx</span>
          <span className="mono ml-auto text-[11px] text-[#28c840]">● live · 0.6s</span>
        </div>
        <pre className="mono overflow-hidden px-4 py-4 text-[12.5px] leading-[1.7]">
          {LINES.map((ln, i) => (
            <div key={i} className="flex gap-3 transition-opacity duration-300" style={{ opacity: i < shown ? 1 : 0 }}>
              <span className="w-5 select-none text-right text-[#3a3f4c]">{i + 1}</span>
              <code className="whitespace-pre">
                {ln}
                {i === shown - 1 && i < LINES.length - 1 && !reduce && (
                  <span className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-[#8aa2ff]" style={{ animation: "blink 1s step-end infinite" }} />
                )}
              </code>
            </div>
          ))}
        </pre>
      </motion.div>
    </div>
  );
}

/* ---------------------------- hero ---------------------------- */
export function Hero({ videoSrc }: { videoSrc?: string }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const codeY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  // Agency-at-work video behind the hero. Only when the file exists (page passes
  // the src) and motion is allowed — otherwise the ambient still does the job.
  const showVideo = !!videoSrc && !reduce;
  // Defer the video OUT of the critical load path: paint the 23KB webp ambient
  // instantly, then mount + fade in the 432KB video only once the page is idle.
  // This keeps first paint fast and stops the video competing for bandwidth
  // during initial load (which was pushing the `load` event way out).
  const [mountVideo, setMountVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => {
    if (!showVideo) return;
    const w = window as unknown as { requestIdleCallback?: (cb: () => void) => number };
    const start = () => setMountVideo(true);
    const id = w.requestIdleCallback ? w.requestIdleCallback(start) : window.setTimeout(start, 1200);
    return () => {
      if (w.requestIdleCallback) (window as unknown as { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(id as number);
      else clearTimeout(id as number);
    };
  }, [showVideo]);

  const [count, setCount] = useState(reduce ? OPEN.length + CLOSE.length : 0);
  const total = OPEN.length + CLOSE.length;
  const typed = count >= total;
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setCount((c) => (c >= total ? c : c + 1)), 600 / total);
    return () => clearInterval(id);
  }, [reduce, total]);
  const openText = OPEN.slice(0, Math.min(count, OPEN.length));
  const closeText = count > OPEN.length ? CLOSE.slice(0, count - OPEN.length) : "";

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Hero background = JUST the agency video. Its poster frame paints
          instantly (16KB); the video fades in over it once the page is idle.
          No dev-grid, no separate static image — they clashed with the video. */}
      <Image
        src="/generated/hero-poster.webp"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 -z-10 object-cover opacity-[0.34] [mask-image:radial-gradient(ellipse_90%_85%_at_60%_40%,#000,transparent_92%)]"
      />
      {showVideo && mountVideo && (
        <video
          src={videoSrc}
          poster="/generated/hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          onLoadedData={() => setVideoReady(true)}
          style={{ opacity: videoReady ? 0.34 : 0 }}
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-700 [mask-image:radial-gradient(ellipse_90%_85%_at_60%_40%,#000,transparent_92%)]"
        />
      )}
      <div className="pointer-events-none absolute inset-0 -z-10 spotlight" aria-hidden="true" />

      <div className="container-editorial grid items-center gap-12 pt-14 pb-16 md:pt-24 md:pb-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mono inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cobalt)]" /> UK web development · hand-coded
          </motion.span>

          <h1 className="mt-6 text-[2.6rem] leading-[1.02] sm:text-5xl md:text-6xl">
            <span aria-hidden="true" className="mono block text-base font-normal tracking-normal text-tag md:text-lg">{openText || " "}</span>
            <motion.span className="block py-1" initial={reduce ? false : { opacity: 0, y: 10 }} animate={typed ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.5 }}>
              Hand-built websites that <span className="grad-text">win customers</span>.
            </motion.span>
            <span aria-hidden="true" className="mono block text-base font-normal tracking-normal text-tag md:text-lg">
              {closeText}{typed && <span className="cursor" aria-hidden="true" />}
            </span>
          </h1>

          <motion.p className="mt-7 max-w-xl text-lg text-muted" initial={reduce ? false : { opacity: 0, y: 10 }} animate={typed ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.5, delay: 0.1 }}>
            Two things, done properly: fast, search-friendly websites hand-coded from scratch, and social media that actually sounds like your business.
          </motion.p>

          <motion.div className="mt-9 flex flex-wrap items-center gap-4" initial={reduce ? false : { opacity: 0, y: 10 }} animate={typed ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.5, delay: 0.2 }}>
            <Magnetic strength={0.4}>
              <Button href="/contact" variant="gradient">Start a project</Button>
            </Magnetic>
            <Magnetic strength={0.3}>
              <Button href="/work" variant="secondary">See our work</Button>
            </Magnetic>
          </motion.div>

          <motion.div className="mono mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted" initial={reduce ? false : { opacity: 0 }} animate={typed ? { opacity: 1 } : undefined} transition={{ duration: 0.6, delay: 0.35 }}>
            <span><span className="text-ink">0.8s</span> avg load</span>
            <span><span className="text-ink">90+</span> Lighthouse</span>
            <span><span className="text-ink">100%</span> code you own</span>
          </motion.div>
        </div>

        <motion.div style={{ y: codeY }} className="w-full">
          <CodeWindow />
        </motion.div>
      </div>
    </section>
  );
}
