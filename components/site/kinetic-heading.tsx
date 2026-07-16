"use client";

import { Fragment, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// Splits a heading into words and rises each out of a mask with a stagger.
//
// IMPORTANT: the in-view observer sits on the HEADING, not on the individual
// words. Each word starts translated 115% down inside an overflow-hidden mask,
// so an observer on the word itself would never report it as visible (it's
// clipped by its own wrapper) and the reveal would never fire — leaving the
// heading permanently blank. Observing the unclipped heading fixes that.
const EASE = [0.22, 1, 0.36, 1] as const;

export function KineticHeading({
  text,
  as = "h2",
  className = "",
  mode = "view",
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  mode?: "mount" | "view";
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Heading = as;
  const words = text.split(" ");

  if (reduce) return <Heading className={className}>{text}</Heading>;

  const show = mode === "mount" ? true : inView;

  return (
    <Heading ref={ref} className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.14em] align-bottom leading-[1.02]">
            <motion.span
              className="inline-block"
              initial={{ y: "115%" }}
              animate={show ? { y: 0 } : { y: "115%" }}
              transition={{ duration: 0.7, ease: EASE, delay: delay + i * 0.06 }}
            >
              {w}
            </motion.span>
          </span>
          {/* The space must sit OUTSIDE the inline-block mask — a trailing space
              inside one gets collapsed, which runs the words together. */}
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Heading>
  );
}
