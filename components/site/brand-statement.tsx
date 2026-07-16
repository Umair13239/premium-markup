"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

// The brand manifesto. Motion here carries meaning rather than decoration: each
// line lifts out of a muted state into full contrast exactly as it reaches the
// reading position, and a rail on the left fills to show progress through the
// three-part idea (design → strategy → development).
//
// Readability first: lines never drop below 0.35 opacity, so the copy is legible
// before any animation runs, and reduced-motion users get it fully static.

const LINES = [
  { text: "Design attracts attention.", accent: false },
  { text: "Strategy gives it direction.", accent: false },
  { text: "Development makes it work.", accent: true },
];

function Line({ text, accent, reduce }: { text: string; accent: boolean; reduce: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "start 45%"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const opacity = useTransform(p, [0, 1], [0.35, 1]);
  const y = useTransform(p, [0, 1], [16, 0]);

  const cls = `font-display text-3xl font-extrabold leading-[1.06] tracking-tight md:text-5xl lg:text-6xl ${
    accent ? "text-cobalt" : "text-ink"
  }`;

  if (reduce) return <p className={cls}>{text}</p>;
  return (
    <motion.p ref={ref} style={{ opacity, y }} className={cls}>
      {text}
    </motion.p>
  );
}

export function BrandStatement() {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start 75%", "end 65%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.3 });

  return (
    <section ref={section} className="container-editorial py-24 md:py-36">
      <div className="relative pl-6 md:pl-10">
        {/* progress rail — fills as you move through the three lines */}
        <div className="absolute left-0 top-1 bottom-1 w-px bg-line" aria-hidden="true">
          {!reduce && (
            <motion.div style={{ scaleY, originY: 0 }} className="absolute inset-0 w-px bg-cobalt" />
          )}
        </div>

        <p className="tag-label">{"<!-- what we believe -->"}</p>

        <div className="mt-7 flex flex-col gap-3 md:gap-4">
          {LINES.map((l) => (
            <Line key={l.text} text={l.text} accent={l.accent} reduce={reduce} />
          ))}
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 max-w-2xl text-lg leading-relaxed text-muted"
        >
          A website should do more than look impressive. It should make the right message clear, guide visitors
          naturally, and support the next stage of the business. We bring design, development and commercial thinking
          into one focused process.
        </motion.p>
      </div>
    </section>
  );
}
