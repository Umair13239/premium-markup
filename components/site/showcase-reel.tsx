"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Full-width animated projects reel, shown just below the hero.
 * Plays only while in view (saves battery / respects attention), is muted and
 * looped, and honours prefers-reduced-motion by showing the poster instead.
 * Rendered by the homepage only when /generated/projects-reel.mp4 exists.
 */
export function ShowcaseReel({ src, poster }: { src: string; poster?: string }) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play/pause with viewport visibility. Observe the video element directly —
  // it is never clipped by an overflow mask, so the observer always fires.
  useEffect(() => {
    if (reduce) return;
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section className="band relative overflow-hidden py-16 md:py-24" aria-label="Project showcase reel">
      <div className="container-editorial">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.2, 0.85, 0.25, 1] }}
        >
          <p className="mono text-xs uppercase tracking-[0.2em] text-muted">Showreel</p>
          <h2 className="mt-3 max-w-2xl text-3xl md:text-5xl">
            The work, <span className="grad-text">in motion</span>.
          </h2>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.85, 0.25, 1] }}
          className="mt-10"
        >
          <div className="overflow-hidden rounded-[10px] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            {reduce && poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="Stills from recent Premium Markup projects" className="w-full" />
            ) : (
              <video
                ref={videoRef}
                src={src}
                poster={poster}
                muted
                loop
                playsInline
                preload="none"
                disablePictureInPicture
                className="block w-full"
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
