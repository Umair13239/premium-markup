"use client";

import { motion, useReducedMotion } from "framer-motion";

// App Router re-mounts template.tsx on every navigation, so this is the clean,
// back-button-safe place for an enter transition: a full-screen panel lifts
// away while the new page fades up through it. No link hijacking, no broken
// history, direct URLs work. Reduced-motion users get the content instantly.
export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <>
      <div className="route-panel" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      >
        {children}
      </motion.div>
    </>
  );
}
