"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Curtain-style media reveal: content is clipped from the bottom and unveils
// top-down as it enters the viewport, with a slight scale settle for depth.
// The premium image-reveal used for case-study media.
export function MediaReveal({
  children,
  className = "",
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left";
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const from = direction === "left" ? "inset(0 100% 0 0)" : "inset(0 0 100% 0)";
  return (
    <motion.div
      className={className}
      initial={{ clipPath: from }}
      whileInView={{ clipPath: "inset(0 0 0 0)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
