"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

// Scroll-linked depth: drifts its child as the section passes through the
// viewport. Transform-only, spring-smoothed, and inert under reduced motion.
export function Parallax({
  children,
  distance = 60,
  className = "",
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(raw, { stiffness: 90, damping: 30, mass: 0.3 });

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// A hairline that fills as the section reaches the reading position — used to
// show progress through a sequence (e.g. the four process steps).
export function ScrollRail({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "start 35%"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.3 });

  return (
    <div ref={ref} className={`relative h-px w-full bg-line ${className}`} aria-hidden="true">
      {!reduce && <motion.div style={{ scaleX, originX: 0 }} className="absolute inset-0 h-px bg-cobalt" />}
    </div>
  );
}
