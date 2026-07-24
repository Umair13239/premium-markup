"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play, ExternalLink } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * Real client video testimonial, self-hosted for speed and design control, with
 * a link back to the original LinkedIn post so it stays independently
 * verifiable. Nothing here is paraphrased — the video is the source.
 *
 * The video is `preload="none"` behind a poster frame, so it costs zero bytes
 * until someone actually presses play.
 */
const VIDEO_SRC = "/generated/testimonial-catherine.mp4";
const POSTER_SRC = "/generated/testimonial-catherine-poster.webp";
const LINKEDIN_POST = "https://www.linkedin.com/feed/update/urn:li:ugcPost:7329192956513464322";

export function Testimonial() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function play() {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    v.play().catch(() => {});
  }

  return (
    <section className="border-t border-line bg-surface" aria-labelledby="testimonial-heading">
      <div className="container-editorial py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div>
              <p className="tag-label">{"<!-- what clients say -->"}</p>
              <h2 id="testimonial-heading" className="mt-3 text-3xl md:text-4xl">
                Don&rsquo;t take our <span className="grad-text">word</span> for it.
              </h2>
              <p className="mt-5 max-w-md text-muted">
                Catherine Flowers is Director of Training at{" "}
                <span className="text-ink">Security Compliance Academy</span> and{" "}
                <span className="text-ink">P.I. Leadership Academy</span> &mdash; two of the training brands in our
                work &mdash; and a retired Raleigh police officer with 25+ years in the field. Here she is, in her own
                words.
              </p>
              <a
                href={LINKEDIN_POST}
                target="_blank"
                rel="noopener noreferrer"
                className="mono mt-6 inline-flex items-center gap-2 text-sm text-cobalt underline underline-offset-4 hover:opacity-80"
              >
                Verify on LinkedIn
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <figure className="relative overflow-hidden rounded-2xl border border-line shadow-[0_36px_90px_-40px_rgba(6,8,24,0.6)]">
              <div className="relative aspect-[1136/640] bg-[#0d1018]">
                <video
                  ref={videoRef}
                  src={VIDEO_SRC}
                  poster={POSTER_SRC}
                  preload="none"
                  playsInline
                  controls={started}
                  onPlay={() => setStarted(true)}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Branded play overlay — hidden once playback starts. */}
                {!started && (
                  <button
                    type="button"
                    onClick={play}
                    aria-label="Play video testimonial from Catherine Flowers"
                    className="group absolute inset-0 grid place-items-center"
                  >
                    <Image src={POSTER_SRC} alt="" fill priority={false} sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[rgba(6,8,20,0.75)] via-transparent to-transparent" />
                    <span className="btn-grad relative grid h-16 w-16 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
                      <Play className="h-6 w-6 translate-x-[2px] fill-current md:h-7 md:w-7" aria-hidden="true" />
                    </span>
                    <span className="mono absolute bottom-4 left-5 text-[11px] uppercase tracking-[0.18em] text-white/80">
                      Watch &mdash; 59 sec
                    </span>
                  </button>
                )}
              </div>

              <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper px-5 py-4">
                <div>
                  <span className="block font-medium">Catherine Flowers</span>
                  <span className="mono block text-xs text-muted">
                    Director of Training &mdash; Security Compliance Academy &middot; P.I. Leadership Academy
                  </span>
                </div>
                <span className="mono text-[11px] uppercase tracking-[0.16em] text-muted">Client</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
