"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  motion,
  useAnimation,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import styles from "./kritika.module.css";

const photos = [
  { src: "/kritika/photo-1.jpg", tilt: -7, caption: "mid-laugh, didn't even notice", offset: 0 },
  { src: "/kritika/photo-2.jpg", tilt: 4, caption: "that quiet, no-filter kind of pretty", offset: 26 },
  { src: "/kritika/photo-3.jpg", tilt: -3, caption: "still stealing the show, on or off screen", offset: 4 },
];

const reasons = [
  { icon: "✨", title: "You light up every room", body: "and every call, and every chat — you don't even have to try." },
  { icon: "😂", title: "Your laugh is contagious", body: "genuinely — I've caught myself laughing at your laugh before I even heard the joke." },
  { icon: "🛡️", title: "You make hard days easier", body: "just by being someone I can actually talk to. That's rarer than people think." },
  { icon: "💎", title: "You're one in a million", body: "and I don't say that lightly. I mean it exactly as much as it sounds." },
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

/* ---------- ambient floating hearts, bubbles, confetti (pure CSS drift) ---------- */
const CONFETTI_COLORS = ["#ff4d94", "#ffd60a", "#4cc9f0", "#9b5de5", "#7CFFB2"];

function FloatingAmbient({ dense = false }: { dense?: boolean }) {
  const reduce = useReducedMotion();
  const particles = useMemo(() => {
    const n = dense ? 34 : 22;
    return Array.from({ length: n }, (_, i) => {
      const kind = i % 3; // 0 heart, 1 bubble, 2 confetti
      return {
        id: i,
        kind,
        left: Math.round(Math.random() * 100),
        size: kind === 1 ? 6 + Math.random() * 22 : 8 + Math.random() * 14,
        duration: 10 + Math.random() * 14,
        delay: -(Math.random() * 22),
        drift: Math.round((Math.random() - 0.5) * 140),
        opacity: 0.35 + Math.random() * 0.45,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: Math.round(Math.random() * 360),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dense]);

  if (reduce) return null;

  return (
    <div className={styles["kr-ambient"]} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={
            p.kind === 0
              ? styles["kr-amb-heart"]
              : p.kind === 1
              ? styles["kr-amb-bubble"]
              : styles["kr-amb-confetti"]
          }
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.kind === 2 ? p.size * 0.4 : p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            color: p.kind === 0 ? p.color : undefined,
            background: p.kind === 2 ? p.color : undefined,
            ["--drift" as string]: `${p.drift}px`,
            ["--rot" as string]: `${p.rotate}deg`,
          }}
        >
          {p.kind === 0 ? <HeartIcon className={styles["kr-amb-heart-svg"]} /> : null}
        </span>
      ))}
    </div>
  );
}

function Sparkles({ trigger }: { trigger: number }) {
  const reduce = useReducedMotion();
  if (!trigger) return null;
  const count = reduce ? 10 : 34;
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 100 + Math.random() * 160;
    return {
      id: `${trigger}-${i}`,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 40,
      delay: Math.random() * 0.18,
      size: 5 + Math.random() * 8,
      kind: i % 4,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    };
  });
  return (
    <span className={styles["kr-sparkle-field"]}>
      {particles.map((p) =>
        p.kind === 3 ? (
          <motion.span
            key={p.id}
            className={styles["kr-sparkle-heart"]}
            style={{ width: p.size * 2.2, height: p.size * 2.2, color: p.color }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={
              reduce
                ? { opacity: [1, 0] }
                : { opacity: [1, 1, 0], scale: [0, 1, 0.7], x: p.x, y: p.y, rotate: p.x > 0 ? 30 : -30 }
            }
            transition={{ duration: reduce ? 0.6 : 1.2, delay: p.delay, ease: "easeOut" }}
          >
            <HeartIcon />
          </motion.span>
        ) : (
          <motion.span
            key={p.id}
            className={styles["kr-sparkle"]}
            style={{
              width: p.kind === 2 ? p.size * 1.6 : p.size,
              height: p.kind === 2 ? p.size * 0.6 : p.size,
              background: p.color,
              borderRadius: p.kind === 2 ? "2px" : "999px",
            }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={
              reduce
                ? { opacity: [1, 0], scale: [1, 1] }
                : { opacity: [1, 1, 0], scale: [0, 1, 0.6], x: p.x, y: p.y, rotate: p.x * 1.4 }
            }
            transition={{ duration: reduce ? 0.6 : 1.2, delay: p.delay, ease: "easeOut" }}
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
  const handleControls = useAnimation();
  const TRACK = 240;
  const HANDLE = 60;
  const MAX_X = TRACK - HANDLE;

  const trigger = () => {
    if (unlocked) return;
    setUnlocked(true);
    handleControls.start({ x: MAX_X, transition: { duration: 0.25, ease: "easeOut" } });
    setTimeout(onOpen, reduce ? 120 : 560);
  };

  const snapBack = () => {
    handleControls.start({ x: 0, transition: { type: "spring", stiffness: 500, damping: 32 } });
  };

  return (
    <motion.div
      className={styles["kr-gate"]}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    >
      <div className={styles["kr-aurora"]} aria-hidden="true" />
      <FloatingAmbient dense />

      <motion.button
        type="button"
        className={styles["kr-seal"]}
        onClick={trigger}
        aria-label="Open — tap the heart, or drag the slider below"
        animate={
          unlocked
            ? { scale: [1, 1.2, 0], rotate: [0, 12, -12, 0] }
            : reduce
            ? {}
            : { scale: [1, 1.08, 1], boxShadow: ["0 0 30px 4px rgba(255,77,148,.55)", "0 0 55px 14px rgba(155,93,229,.6)", "0 0 30px 4px rgba(255,77,148,.55)"] }
        }
        transition={unlocked ? { duration: 0.55, ease: "easeIn" } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeartIcon className={styles["kr-seal-heart"]} />
      </motion.button>

      <p className={styles["kr-gate-label"]}>for my best friend, Kritika</p>
      <p className={styles["kr-gate-sub"]}>tap the heart, or slide it open ✨</p>

      <div className={styles["kr-slide-track"]} style={{ width: TRACK }}>
        <motion.div
          className={styles["kr-slide-handle"]}
          drag={unlocked ? false : "x"}
          dragConstraints={{ left: 0, right: MAX_X }}
          dragElastic={0.05}
          dragMomentum={false}
          animate={handleControls}
          onDragEnd={(_, info) => {
            if (info.offset.x >= MAX_X * 0.6) trigger();
            else snapBack();
          }}
          whileTap={{ scale: 1.1 }}
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
        <div className={styles["kr-aurora"]} aria-hidden="true" />
        <motion.div
          className={styles["kr-hero-inner"]}
          initial={reduce || !opened ? undefined : "hidden"}
          animate={opened ? "show" : undefined}
        >
          <motion.p custom={0} variants={fadeUp} className={styles["kr-eyebrow"]}>
            ✨ made just for my best friend ✨
          </motion.p>
          <motion.h1 custom={1} variants={fadeUp} className={styles["kr-title"]}>
            For <em>Kritika</em>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} className={styles["kr-sub"]}>
            the most beautiful person I know — and I&rsquo;m not exaggerating.
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

      {/* ---------- REASONS ---------- */}
      <section className={styles["kr-reasons"]}>
        <motion.p
          className={styles["kr-eyebrow"]}
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.6 }}
        >
          🎉 a few things, off the top of my head 🎉
        </motion.p>
        <div className={styles["kr-reasons-grid"]}>
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              className={styles["kr-reason-card"]}
              initial={reduce ? undefined : { opacity: 0, y: 40, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduce ? undefined : { y: -8, scale: 1.03 }}
            >
              <span className={styles["kr-reason-icon"]}>{r.icon}</span>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- POLAROIDS ---------- */}
      <section className={styles["kr-keepsakes"]}>
        <motion.p
          className={styles["kr-eyebrow"]}
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.6 }}
        >
          📸 moments I couldn&rsquo;t just scroll past 📸
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
              whileHover={reduce ? undefined : { rotate: 0, scale: 1.06, y: -8 }}
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
            across the internet — which is honestly the harder trick.
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
        <div className={styles["kr-aurora"]} aria-hidden="true" />
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
              {kept ? "kept ✦" : "keep this ✨"}
              <Sparkles trigger={burst} />
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
