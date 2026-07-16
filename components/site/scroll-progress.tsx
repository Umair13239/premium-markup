"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// Thin cobalt progress bar pinned to the top of the viewport.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-[var(--color-cobalt)]"
      aria-hidden="true"
    />
  );
}
