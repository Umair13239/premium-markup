"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

const STEPS = [
  { n: "01", t: "Discover", b: "We clarify the business, audience, competition and priorities before any visual work begins. A short call, a clear brief, and a fixed scope so there are no surprises later." },
  { n: "02", t: "Define", b: "The sitemap, content structure, user journey and creative direction are shaped around clear objectives — what each page is for, and the action it should lead to." },
  { n: "03", t: "Design", b: "Key pages and responsive interfaces are designed with strong hierarchy, brand consistency and considered interaction. You review the real design in the browser, not a flat picture." },
  { n: "04", t: "Develop", b: "Approved designs become a fast, responsive, carefully tested build — hand-coded for speed and accessibility, with a content structure you can edit yourself." },
  { n: "05", t: "Refine", b: "Content, animation, responsiveness, accessibility, SEO and performance are reviewed and tuned before launch. The boring, essential detail that separates good from fine." },
  { n: "06", t: "Launch & Support", b: "We ship with the analytics and search tools in place, hand over full ownership, and — if you want it — keep the site healthy with ongoing support." },
];

export function ProcessTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 70%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.3 });

  return (
    <div ref={ref} className="relative container-editorial py-16 md:py-24">
      <div className="relative pl-14 md:pl-20">
        {/* track + animated fill */}
        <div className="absolute left-[26px] top-2 bottom-2 w-px bg-line md:left-[34px]" aria-hidden="true">
          {!reduce && <motion.div style={{ scaleY, originY: 0 }} className="absolute inset-0 w-px bg-cobalt" />}
        </div>

        <div className="flex flex-col gap-16 md:gap-24">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="relative"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* node */}
              <div className="absolute -left-14 top-1 flex h-[54px] w-[54px] items-center justify-center rounded-full border border-line bg-surface md:-left-20 md:h-[70px] md:w-[70px]">
                <span className="mono text-sm text-cobalt md:text-base">{s.n}</span>
              </div>
              <h2 className="text-2xl md:text-4xl">{s.t}</h2>
              <p className="mt-4 max-w-2xl text-muted md:text-lg">{s.b}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
