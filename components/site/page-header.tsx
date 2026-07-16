"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { SectionLabel } from "./section-label";
import { KineticHeading } from "./kinetic-heading";

// Cinematic, animated page header shared across Services / Work / About / Blog.
// Kinetic word-rise headline over a spotlight + dev-grid backdrop, with a gentle
// parallax + fade as you scroll past. Collapses to static under reduced-motion.
export function PageHeader({
  label,
  title,
  intro,
}: {
  label: string;
  title: string;
  intro?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const oRaw = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  const y = useSpring(yRaw, { stiffness: 120, damping: 30, mass: 0.3 });
  const opacity = useSpring(oRaw, { stiffness: 120, damping: 30, mass: 0.3 });

  const introDelay = 0.15 + title.split(" ").length * 0.055;

  return (
    <header ref={ref} className="relative overflow-hidden border-b border-line">
      <div className="spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className="container-editorial relative pt-20 pb-14 md:pt-28 md:pb-20"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionLabel>{label}</SectionLabel>
        </motion.div>
        <KineticHeading
          text={title}
          as="h1"
          mode="mount"
          delay={0.1}
          className="mt-4 max-w-4xl text-4xl md:text-6xl"
        />
        {intro && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: introDelay }}
            className="mt-6 max-w-2xl text-lg text-muted"
          >
            {intro}
          </motion.p>
        )}
      </motion.div>
    </header>
  );
}
