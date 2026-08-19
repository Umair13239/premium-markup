"use client";

import { useMemo, useState } from "react";
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

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 21s-6.7-4.35-9.6-8.28C.6 10.1 1 6.6 3.8 4.9c2.2-1.35 4.9-.7 6.4 1.2l1.8 2.3 1.8-2.3c1.5-1.9 4.2-2.55 6.4-1.2 2.8 1.7 3.2 5.2 1.4 7.82C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

/* ---------- ambient floating hearts + bubbles (pure CSS drift) ---------- */
function FloatingAmbient() {
  const reduce = useReducedMotion();
  const particles = useMemo(() => {
    const n = 20;
    return Array.from({ length: n }, (_, i) => {
      const isHeart = i % 2 === 0;
      return {
        id: i,
        isHeart,
        left: Math.round(Math.random() * 100),
        size: isHeart ? 10 + Math.random() * 16 : 6 + Math.random() * 20,
        duration: 14 + Math.random() * 12,
        delay: -(Math.random() * 22),
        drift: Math.round((Math.random() - 0.5) * 120),
        opacity: 0.16 + Math.random() * 0.28,
      };
    });
  }, []);

  if (reduce) return null;

  return (
    <div className={styles["kr-ambient"]} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={p.isHeart ? styles["kr-amb-heart"] : styles["kr-amb-bubble"]}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        >
          {p.isHeart ? <HeartIcon className={styles["kr-amb-heart-svg"]} /> : null}
        </span>
      ))}
    </div>
  );
}

function Sparkles({ trigger }: { trigger: number }) {
  const reduce = useReducedMotion();
  if (!trigger) return null;
  const count = reduce ? 8 : 20;
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 90 + Math.random() * 110;
    return {
      id: `${trigger}-${i}`,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 30,
      delay: Math.random() * 0.15,
      size: 4 + Math.random() * 6,
      kind: i % 3,
    };
  });
  return (
    <span className={styles["kr-sparkle-field"]}>
      {particles.map((p) =>
        p.kind === 2 ? (
          <motion.span
            key={p.id}
            className={styles["kr-sparkle-heart"]}
            style={{ width: p.size * 2, height: p.size * 2 }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={
              reduce
                ? { opacity: [1, 0] }
                : { opacity: [1, 1, 0], scale: [0, 1, 0.7], x: p.x, y: p.y, rotate: p.x > 0 ? 20 : -20 }
            }
            transition={{ duration: reduce ? 0.6 : 1.1, delay: p.delay, ease: "easeOut" }}
          >
            <HeartIcon />
          </motion.span>
        ) : (
          <motion.span
            key={p.id}
            className={styles["kr-sparkle"]}
            style={{
              width: p.size,
              height: p.size,
              background:
                p.kind === 0
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
        )
      )}
    </span>
  );
}

/* ---------- entrance gate: tap OR slide to open ---------- */
function OpenGate({ onOpen }: { onOpen: () => void }) {
  const reduce = useReducedMotion();
  const [unlocked, setUnlocked] = useState(false);
  const TRACK = 220;
  const HANDLE = 56;
  const MAX_X = TRACK - HANDLE;

  const trigger = () => {
    if (unlocked) return;
    setUnlocked(true);
    setTimeout(onOpen, reduce ? 120 : 520);
  };

  return (
    <motion.div
      className={styles["kr-gate"]}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    >
      <div className={styles["kr-curtain"]} aria-hidden="true" />
      <div className={styles["kr-vignette"]} aria-hidden="true" />
      <FloatingAmbient />

      <motion.button
        type="button"
        className={styles["kr-seal"]}
        onClick={trigger}
        aria-label="Open — tap the heart, or drag the slider below"
        animate={
          unlocked
            ? { scale: [1, 1.15, 0] }
            : reduce
            ? {}
            : { scale: [1, 1.06, 1] }
        }
        transition={unlocked ? { duration: 0.5, ease: "easeIn" } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeartIcon className={styles["kr-seal-heart"]} />
      </motion.button>

      <p className={styles["kr-gate-label"]}>for my best friend, Kritika</p>
      <p className={styles["kr-gate-sub"]}>tap the heart, or slide it open</p>

      <div className={styles["kr-slide-track"]} style={{ width: TRACK }}>
        <motion.div
          className={styles["kr-slide-handle"]}
          drag="x"
          dragConstraints={{ left: 0, right: MAX_X }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (info.offset.x >= MAX_X - 24) trigger();
          }}
          animate={unlocked ? { x: MAX_X } : { x: 0 }}
          whileTap={{ scale: 1.08 }}
        >
          <HeartIcon className={styles["kr-slide-heart"]} />
        </motion.div>
        <span className={styles["kr-slide-track-label"]}>slide to open</span>
      </div>
    </motion.div>
  );
}

export function KritikaClient() {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const [kept, setKept] = useState(false);
  const [opened, setOpened] = useState(false);

  return (
    <main className={styles["kr-root"]}>
      {!opened && <OpenGate onOpen={() => setOpened(true)} />}

      {opened && <FloatingAmbient />}

      {/* ---------- HERO ---------- */}
      <section className={styles["kr-hero"]}>
        <div className={styles["kr-curtain"]} aria-hidden="true" />
        <div className={styles["kr-vignette"]} aria-hidden="true" />
        <motion.div
          className={styles["kr-hero-inner"]}
          initial={reduce || !opened ? undefined : "hidden"}
          animate={opened ? "show" : undefined}
        >
          <motion.p custom={0} variants={fadeUp} className={styles["kr-eyebrow"]}>
            <HeartIcon className={styles["kr-eyebrow-heart"]} /> a little something for my best friend
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
          animate={{ opacity: opened ? 1 : 0 }}
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
          <HeartIcon className={styles["kr-eyebrow-heart"]} /> the ones I kept
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
              &ldquo;Best friend&rdquo; isn&rsquo;t a title I hand out easily. It&rsquo;s you,
              specifically, and it isn&rsquo;t close. So here&rsquo;s your reminder, from
              someone who actually means it: you&rsquo;re beautiful, you&rsquo;re
              genuinely one of a kind, and I&rsquo;m endlessly glad you&rsquo;re my best
              friend.
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
          <HeartIcon className={styles["kr-flourish-heart"]} />

          <p className={styles["kr-signature"]}>always in your corner — your best friend, Umair</p>

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
