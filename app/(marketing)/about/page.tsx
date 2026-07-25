import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { KineticHeading } from "@/components/site/kinetic-heading";
import { Button } from "@/components/site/button";
import { Magnetic } from "@/components/site/magnetic";
import { Stat } from "@/components/site/stat";
import { Parallax } from "@/components/site/parallax";
import { PMMark } from "@/components/site/pm-mark";
import { AboutPortrait } from "@/components/site/about-portrait";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "About — the developer behind PremiumMarkup",
  description:
    "PremiumMarkup is a hands-on UK developer who builds every website personally. No account managers, no outsourcing — just careful, hand-coded work.",
  alternates: { canonical: "/about" },
};

const values = [
  { title: "Own the craft", body: "Every line is written by hand. If a shortcut would slow your site or muddy your code, I don't take it." },
  { title: "Say it straight", body: "Fixed scope, fixed price, in writing. If something isn't worth doing, I'll tell you — even if it's less work for me." },
  { title: "Build to last", body: "You own the code and hosting. No platform rent, no lock-in, no surprise renewal that holds your site hostage." },
];

const story = [
  "I started PremiumMarkup after watching too many small businesses pay for websites that quietly worked against them — slow to load, invisible in search, and impossible to change without paying the same agency again.",
  "So I do the opposite. I build every site by hand, from scratch, for speed and search. No account manager between us, no junior quietly doing the real work. You talk to the person writing the code, and you watch it take shape in the browser — the real thing, on real devices.",
  "I work remotely with businesses across the UK. That keeps overheads low and pricing honest, and it means where you are never limits who can build you something excellent.",
];

export default function AboutPage() {
  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 spotlight" aria-hidden="true" />
        <Parallax distance={60} className="pointer-events-none absolute -right-24 -top-24 -z-10">
          <PMMark className="h-[380px] w-[380px] text-cobalt opacity-[0.06] md:h-[520px] md:w-[520px]" />
        </Parallax>

        <div className="container-editorial grid items-center gap-14 pt-14 pb-10 md:grid-cols-[1.1fr_0.9fr] md:pt-20 md:pb-16">
          <div>
            <Reveal>
              <p className="tag-label">{"<!-- about -->"}</p>
            </Reveal>
            <KineticHeading
              text="One developer. Every site, built personally."
              className="mt-3 max-w-2xl text-4xl leading-[1.05] md:text-5xl lg:text-6xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg text-muted">
                PremiumMarkup isn&rsquo;t a faceless studio that outsources your project. It&rsquo;s a hands-on
                developer who writes the code, talks to you directly, and cares how it turns out.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Magnetic strength={0.4}>
                  <Button href="/contact" variant="gradient">Work with me</Button>
                </Magnetic>
                <Magnetic strength={0.3}>
                  <Button href="/work" variant="secondary">See the work</Button>
                </Magnetic>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex items-center gap-4 border-t border-line pt-6">
                <div>
                  <p className="font-display text-xl">{siteConfig.founder.name}</p>
                  <p className="mono mt-0.5 text-sm text-muted">{siteConfig.founder.role}</p>
                </div>
                <a
                  href={`mailto:${siteConfig.email.founder}`}
                  className="link-underline mono ml-auto text-sm text-cobalt"
                >
                  {siteConfig.email.founder}
                </a>
              </div>
            </Reveal>
          </div>

          <AboutPortrait src="/portfolio/assets/portfolio/umair.webp" alt={`${siteConfig.founder.name} — ${siteConfig.founder.role}`} />
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <section className="border-y border-line bg-surface">
        <div className="container-editorial grid grid-cols-2 gap-8 py-12 md:grid-cols-4 md:py-14">
          <Stat value="7 yrs" label="design & development" />
          <Stat value="100%" label="hand-coded, no builders" />
          <Stat value="0.8s" label="average load time" />
          <Stat value="1" label="person you actually talk to" />
        </div>
      </section>

      {/* ---------- story ---------- */}
      <section className="container-editorial py-18 md:py-24">
        <div className="grid gap-14 md:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <KineticHeading text="Why I do it this way." as="h2" className="max-w-sm text-3xl md:text-4xl" />
          </Reveal>
          <div className="max-w-2xl space-y-6 text-lg leading-relaxed">
            {story.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className={i === story.length - 1 ? "text-muted" : "text-ink"}>{p}</p>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <p className="text-muted">
                If you&rsquo;ve been burned by a cheap website before, I get it — most of my clients have. The fix is
                boring and effective: clear scope, fixed price, and code you own at the end.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- values ---------- */}
      <section className="border-t border-line bg-surface">
        <div className="container-editorial py-18 md:py-24">
          <Reveal>
            <p className="tag-label">{"<!-- how I work -->"}</p>
            <h2 className="mt-3 max-w-2xl text-3xl md:text-4xl">Three rules I don&rsquo;t break.</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <div className="group h-full rounded-2xl border border-line bg-paper p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-cobalt/50 hover:shadow-[0_30px_70px_-40px_color-mix(in_oklab,var(--color-cobalt)_55%,transparent)]">
                  <span className="mono text-sm text-cobalt">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-3 text-xl font-medium group-hover:text-cobalt">{v.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="band">
        <div className="container-editorial py-20 text-center md:py-28">
          <Reveal>
            <KineticHeading text="Let's build something you own." as="h2" className="mx-auto max-w-3xl text-4xl text-paper md:text-5xl" />
            <p className="mx-auto mt-6 max-w-xl text-[color:var(--color-paper-dim)]">
              Tell me what you&rsquo;re planning. I&rsquo;ll reply personally, usually the same day.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Magnetic><Button href="/contact" variant="invert">Start a project</Button></Magnetic>
              <Link href="/work" className="group inline-flex items-center gap-2 self-center font-medium text-paper">
                Explore the work
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
