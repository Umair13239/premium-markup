"use client";

import { useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import styles from "./kritika.module.css";

const photos = [
  { src: "/kritika/photo-1.jpg", tilt: -7, caption: "mid-laugh, didn't even notice", offset: 0 },
  { src: "/kritika/photo-2.jpg", tilt: 4, caption: "that quiet, no-filter kind of pretty", offset: 26 },
  { src: "/kritika/photo-3.jpg", tilt: -3, caption: "still stealing the show, on or off screen", offset: 4 },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

function Sparkles({ trigger }: { trigger: number }) {
  const reduce = useReducedMotion();
  if (!trigger) return null;
  const count = reduce ? 8 : 18;
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 90 + Math.random() * 110;
    return {
      id: `${trigger}-${i}`,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 30,
      delay: Math.random() * 0.15,
      size: 4 + Math.random() * 6,
      gold: i % 3 !== 0,
    };
  });
  return (
    <span className={styles["kr-sparkle-field"]}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={styles["kr-sparkle"]}
          style={{
            width: p.size,
            height: p.size,
            background: p.gold
              ? "radial-gradient(circle, #f3d99a 0%, #c8963f 100%)"
              : "radial-gradient(circle, #f3c9cd 0%, #d98e95 100%)",
          }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={
            reduce
              ? { opacity: [1, 0], scale: [1, 1] }
              : { opacity: [1, 1, 0], scale: [0, 1, 0.6], x: p.x, y: p.y }
          }
          transition={{ duration: reduce ? 0.6 : 1.1, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

export function KritikaClient() {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const [kept, setKept] = useState(false);

  return (
    <main className={styles["kr-root"]}>
      {/* ---------- HERO ---------- */}
      <section className={styles["kr-hero"]}>
        <div className={styles["kr-curtain"]} aria-hidden="true" />
        <div className={styles["kr-vignette"]} aria-hidden="true" />
        <motion.div
          className={styles["kr-hero-inner"]}
          initial={reduce ? undefined : "hidden"}
          animate="show"
        >
          <motion.p custom={0} variants={fadeUp} className={styles["kr-eyebrow"]}>
            a little something — just for you
          </motion.p>
          <motion.h1 custom={1} variants={fadeUp} className={styles["kr-title"]}>
            For <em>Kritika</em>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} className={styles["kr-sub"]}>
            three moments I didn&rsquo;t want to just scroll past.
          </motion.p>
        </motion.div>
        <motion.div
          className={styles["kr-scrollcue"]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <span className={styles["kr-scrollcue-line"]} />
          <span>keep going</span>
        </motion.div>
      </section>

      {/* ---------- POLAROIDS ---------- */}
      <section className={styles["kr-keepsakes"]}>
        <motion.p
          className={`${styles["kr-eyebrow"]} ${styles["kr-eyebrow--dark"]}`}
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.6 }}
        >
          the ones I kept
        </motion.p>
        <div className={styles["kr-polaroid-row"]}>
          {photos.map((p, i) => (
            <motion.figure
              key={p.src}
              className={styles["kr-polaroid"]}
              style={{ ["--tilt" as string]: `${p.tilt}deg`, ["--offset" as string]: `${p.offset}px` }}
              initial={reduce ? undefined : { opacity: 0, y: 60, rotate: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, rotate: p.tilt, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduce ? undefined : { rotate: 0, scale: 1.05, y: -6 }}
            >
              <span className={styles["kr-polaroid-frame"]}>
                <Image
                  src={p.src}
                  alt="A candid photo of Kritika, smiling"
                  fill
                  sizes="(max-width: 768px) 80vw, 320px"
                  className={styles["kr-polaroid-img"]}
                />
              </span>
              <figcaption>{p.caption}</figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ---------- WORDS ---------- */}
      <section className={styles["kr-words"]}>
        <motion.div
          className={styles["kr-words-card"]}
          initial={reduce ? undefined : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles["kr-quotemark"]} aria-hidden="true">
            &ldquo;
          </span>
          <p className={styles["kr-pullquote"]}>
            some people light up a room. you light up a phone screen from
            across the internet, which is honestly a harder trick.
          </p>
          <div className={styles["kr-words-body"]}>
            <p>
              You don&rsquo;t need a reason to hear this, so I&rsquo;m not going to
              wait for one. You&rsquo;re one of those people who makes everything
              around you a little warmer just by being in it — and it shows in
              every single one of these, on-camera or off.
            </p>
            <p>
              So here&rsquo;s your reminder, from someone who actually means it:
              you&rsquo;re beautiful, you&rsquo;re genuinely one of a kind, and I&rsquo;m glad
              I get to call you a friend.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ---------- SIGNOFF ---------- */}
      <section className={styles["kr-signoff"]}>
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7 }}
          className={styles["kr-signoff-inner"]}
        >
          <svg
            className={styles["kr-flourish"]}
            viewBox="0 0 160 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 12c20-10 40-10 48 0s28 10 48 0 40-10 60 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="80" cy="12" r="3" fill="currentColor" />
          </svg>

          <p className={styles["kr-signature"]}>always in your corner, — Umair</p>

          <div className={styles["kr-keepwrap"]}>
            <button
              type="button"
              className={styles["kr-keepbtn"]}
              onClick={() => {
                setBurst((n) => n + 1);
                setKept(true);
              }}
            >
              {kept ? "kept ✦" : "keep this"}
              <Sparkles trigger={burst} />
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
