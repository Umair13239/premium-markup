import { Reveal } from "./reveal";

/**
 * Real client testimonial, embedded straight from LinkedIn so it stays
 * verifiable — visitors can open the original post and see who said it.
 *
 * Catherine Flowers runs Security Compliance Academy and P.I. Leadership
 * Academy, both of which are in the portfolio. Nothing here is paraphrased or
 * reconstructed; the embed is the source.
 *
 * The iframe is lazy-loaded so it never blocks first paint, and it is capped at
 * LinkedIn's native 504px width inside a responsive wrapper.
 */
const LINKEDIN_EMBED =
  "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7329192956513464322?collapsed=1";

export function Testimonial() {
  return (
    <section className="border-t border-line bg-surface" aria-labelledby="testimonial-heading">
      <div className="container-editorial py-20 md:py-28">
        <Reveal>
          <p className="tag-label">{"<!-- what clients say -->"}</p>
          <h2 id="testimonial-heading" className="mt-3 max-w-2xl text-3xl md:text-4xl">
            Don&rsquo;t take our word for it.
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Catherine Flowers runs <span className="text-ink">Security Compliance Academy</span> and{" "}
            <span className="text-ink">P.I. Leadership Academy</span> &mdash; two of the training brands in our work.
            Here she is, in her own words.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-10 flex justify-center">
            <div className="w-full max-w-[504px] overflow-hidden rounded-xl border border-line bg-paper shadow-[0_28px_70px_-40px_rgba(6,8,24,0.5)]">
              <iframe
                src={LINKEDIN_EMBED}
                height={543}
                width={504}
                title="Client testimonial from Catherine Flowers on LinkedIn"
                loading="lazy"
                allowFullScreen
                className="block h-[543px] w-full border-0"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mono mt-6 text-center text-xs text-muted">
            Posted publicly on LinkedIn &mdash;{" "}
            <a
              href="https://www.linkedin.com/feed/update/urn:li:ugcPost:7329192956513464322"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cobalt underline underline-offset-2"
            >
              view the original post
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
