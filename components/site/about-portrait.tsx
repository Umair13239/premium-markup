"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Animated founder portrait for the About page.
 * - Enters with a spring rise + fade.
 * - Scroll-linked parallax (the photo drifts up as you scroll past).
 * - Hover 3D tilt that follows the cursor.
 * - Iris gradient glow + orbiting accent behind, floating tech chips in front.
 * Full reduced-motion fallback (static, no tilt, no float).
 */
const CHIPS = ["Next.js", "TypeScript", "Hand-coded", "0.8s LCP"];

export function AboutPortrait({ src, alt }: { src: string; alt: string }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll parallax on the whole block.
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, reduce ? 0 : -60]);
  const imgY = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 24, reduce ? 0 : -40]);

  // Cursor tilt.
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 16 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 16 });
  function onMove(e: React.MouseEvent) {
    if (reduce || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  }

  return (
    <motion.div ref={wrapRef} style={{ y }} className="relative mx-auto w-full max-w-[440px]">
      <div style={{ perspective: 1200 }}>
        <motion.div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={() => { rx.set(0); ry.set(0); }}
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className="relative aspect-[3/4] w-full"
        >
          {/* soft iris glow behind */}
          <div
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] blur-2xl"
            style={{ background: "radial-gradient(60% 60% at 50% 35%, color-mix(in oklab, var(--color-cobalt) 45%, transparent), transparent 70%)" }}
            aria-hidden="true"
          />
          {/* orbiting accent dot */}
          {!reduce && (
            <motion.span
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-3 w-3 rounded-full"
              style={{ background: "var(--color-cobalt)", boxShadow: "0 0 24px 6px color-mix(in oklab, var(--color-cobalt) 60%, transparent)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              // translate outward so rotation reads as an orbit
              initial={{ x: 150, y: -170 }}
              aria-hidden="true"
            />
          )}

          {/* gradient card frame the photo sits in */}
          <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-cobalt/25 bg-gradient-to-b from-[color-mix(in_oklab,var(--color-cobalt)_18%,transparent)] to-[color-mix(in_oklab,#7c5cff_10%,transparent)] shadow-[0_50px_120px_-40px_rgba(6,8,24,0.7)]">
            <div className="hero-grid absolute inset-0 opacity-30" aria-hidden="true" />
            <motion.div style={{ y: imgY }} className="absolute inset-x-0 bottom-0 top-4">
              <Image
                src={src}
                alt={alt}
                fill
                priority
                sizes="(max-width: 768px) 90vw, 440px"
                className="object-contain object-bottom drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
              />
            </motion.div>
          </div>

          {/* floating tech chips */}
          {CHIPS.map((c, i) => {
            const pos = [
              "left-[-6%] top-[18%]",
              "right-[-8%] top-[38%]",
              "left-[-4%] bottom-[24%]",
              "right-[-6%] bottom-[10%]",
            ][i];
            return (
              <motion.span
                key={c}
                className={`glass absolute ${pos} mono rounded-full px-3 py-1.5 text-[11px] font-medium text-ink shadow-lg`}
                initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 200, damping: 14 }}
                animate={reduce ? undefined : { y: [0, i % 2 ? 8 : -8, 0] }}
                {...(!reduce && { transition: { delay: 0.4 + i * 0.12, y: { duration: 3.5 + i, repeat: Infinity, ease: "easeInOut" } } })}
                aria-hidden="true"
              >
                <span className="text-cobalt">/</span> {c}
              </motion.span>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
