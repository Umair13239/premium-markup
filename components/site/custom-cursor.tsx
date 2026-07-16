"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// A Cuberto-style cursor: a crisp dot that tracks 1:1, a soft ring that lags and
// swells over interactive elements, and a contextual label pill that appears over
// anything carrying a `data-cursor="…"` attribute (e.g. project cards → "View
// project"). Only mounts on fine pointers with motion allowed.
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const [label, setLabel] = useState("");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      const labelled = t?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(labelled ? labelled.dataset.cursor || "" : "");
      setHover(!!t?.closest?.("a, button, input, textarea, select, label, [data-cursor]"));
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", dn);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", dn);
      window.removeEventListener("mouseup", up);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const showLabel = label.length > 0;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pm-cursor-dot"
        style={{ x, y }}
        animate={{ scale: down ? 0.5 : showLabel ? 0 : 1, opacity: showLabel ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        aria-hidden="true"
        className="pm-cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: showLabel ? 0 : hover ? 1.9 : down ? 0.85 : 1,
          opacity: showLabel ? 0 : hover ? 0.55 : 0.85,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        aria-hidden="true"
        className="pm-cursor-label"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: showLabel ? 1 : 0, opacity: showLabel ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {label}
      </motion.div>
    </>
  );
}
