"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play, ExternalLink } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * Real client video testimonial — self-hosted for speed and design control,
 * with a link back to the original LinkedIn post so it stays independently
 * verifiable. Nothing is paraphrased; the video is the source.
 *
 * Full-width centred layout so the video reads large on desktop and scales
 * cleanly all the way down to a phone. The video is `preload="none"` behind a
 * poster, so it costs zero bytes until someone presses play.
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
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="tag-label">{"<!-- what our clients say -->"}</p>
            <h2 id="testimonial-heading" className="mt-3 text-3xl md:text-4xl lg:text-5xl">
              What our <span className="grad-text">clients say</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted">
              Catherine Flowers is Director of Training at{" "}
              <span className="text-ink">Security Compliance Academy</span> and{" "}
              <span className="text-ink">P.I. Leadership Academy</span> &mdash; two of the training brands in our work
              &mdash; and a retired Raleigh police officer with 25+ years in the field.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <figure className="mx-auto mt-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-line shadow-[0_40px_100px_-45px_rgba(6,8,24,0.65)] md:mt-14">
            <div className="relative aspect-[1136/640] w-full bg-[#0d1018]">
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

              {/* Branded play overlay — replaced by native controls once playing. */}
              {!started && (
                <button
                  type="button"
                  onClick={play}
                  aria-label="Play video testimonial from Catherine Flowers"
                  className="group absolute inset-0 grid place-items-center"
                >
                  <Image
                    src={POSTER_SRC}
                    alt="Catherine Flowers recording her testimonial"
                    fill
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[rgba(6,8,20,0.7)] via-transparent to-transparent" />
                  <span className="btn-grad relative grid h-14 w-14 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20 md:h-24 md:w-24">
                    <Play className="h-5 w-5 translate-x-[2px] fill-current sm:h-7 sm:w-7 md:h-9 md:w-9" aria-hidden="true" />
                  </span>
                  <span className="mono absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.18em] text-white/85 sm:bottom-4 sm:left-5 sm:text-[11px]">
                    Watch &mdash; 59 sec
                  </span>
                </button>
              )}
            </div>

            <figcaption className="flex flex-col gap-3 border-t border-line bg-paper px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <div className="min-w-0">
                <span className="block text-base font-medium sm:text-lg">Catherine Flowers</span>
                <span className="mono mt-0.5 block text-xs text-muted">
                  Director of Training &mdash; Security Compliance Academy &middot; P.I. Leadership Academy
                </span>
              </div>
              <a
                href={LINKEDIN_POST}
                target="_blank"
                rel="noopener noreferrer"
                className="mono inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-cobalt transition-colors hover:border-cobalt"
              >
                Verify on LinkedIn
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
