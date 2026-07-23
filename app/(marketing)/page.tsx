import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { WorkShowcase } from "@/components/site/work-showcase";
import { TechMarquee } from "@/components/site/tech-marquee";
import { Reveal } from "@/components/site/reveal";
import { KineticHeading } from "@/components/site/kinetic-heading";
import { BrandStatement } from "@/components/site/brand-statement";
import { Parallax, ScrollRail } from "@/components/site/parallax";
import { Stat } from "@/components/site/stat";
import { Magnetic } from "@/components/site/magnetic";
import { Button } from "@/components/site/button";
import { PMMark } from "@/components/site/pm-mark";
import { WorkTeaser } from "@/components/site/work-teaser";
import { getPortfolio } from "@/lib/portfolio";
import { services } from "@/lib/services";

// Static: content changes only on redeploy (edit-locally workflow), so this is
// baked at build time and served from the CDN — no per-request serverless call.
export const revalidate = false;

export const metadata: Metadata = {
  title: "Premium Markup | Web Design & Development Agency",
  description:
    "Premium Markup designs and develops distinctive, high-performing websites for ambitious businesses in the UK, USA and beyond. Web design, development, e-commerce, SEO and creative digital services.",
  alternates: { canonical: "/" },
};

// Curated six for the homepage grid (Graphic Design in place of Animated Web).
const FEATURED_SLUGS = ["web-design", "web-development", "graphic-design", "ecommerce", "website-redesign", "landing-pages"];
const featuredServices = FEATURED_SLUGS.map((slug) => services.find((s) => s.slug === slug)).filter((s): s is (typeof services)[number] => Boolean(s));
const compare = [
  { point: "Page speed", built: "Hand-coded, sub-second", builder: "Heavy plugins, slow loads" },
  { point: "SEO", built: "Clean markup, structured data", builder: "Generic output, bloated HTML" },
  { point: "Ownership", built: "You own everything", builder: "Locked into a platform" },
  { point: "Design", built: "Custom to your brand", builder: "One of a thousand templates" },
];

// The hero's agency-at-work video is optional: it appears once the file exists
// in public/generated/ (checked at build time — the page is fully static).
const genDir = path.join(process.cwd(), "public", "generated");
const heroVideo = fs.existsSync(path.join(genDir, "hero-office.mp4")) ? "/generated/hero-office.mp4" : undefined;

export default async function HomePage() {
  const { data: portfolio } = await getPortfolio();
  const featured = portfolio.projects.slice(0, 6);
  const catLabel = new Map(portfolio.categories.map((c) => [c.id, c.label]));
  const showcase = portfolio.projects.slice(0, 10).map((p) => ({
    id: p.id,
    name: p.name,
    cover: p.cover,
    accent: p.accent,
    categoryLabel: catLabel.get(p.category) ?? p.category,
  }));
  return (
    <>
      <Hero videoSrc={heroVideo} />

      {/* 3D project showcase slider — replaces the old video reel */}
      <section className="band relative overflow-hidden py-16 md:py-24" aria-label="Project showcase">
        <div className="container-editorial">
          <Reveal>
            <p className="mono text-xs uppercase tracking-[0.2em] text-muted">Showreel</p>
            <h2 className="mt-3 max-w-2xl text-3xl md:text-5xl">
              The work, <span className="grad-text">in motion</span>.
            </h2>
          </Reveal>
          <div className="mt-10 md:mt-14">
            <WorkShowcase items={showcase} />
          </div>
        </div>
      </section>

      <TechMarquee />

      {/* count-up stats */}
      <section className="border-b border-line bg-surface">
        <div className="container-editorial grid grid-cols-1 gap-10 py-14 sm:grid-cols-3 md:py-16">
          <Stat value="99%" label="client satisfaction" />
          <Stat value="0.8s" label="average load time" />
          <Stat value="7 yrs" label="design & development" />
        </div>
      </section>

      {/* brand statement */}
      <BrandStatement />

      {/* services overview */}
      <section className="border-t border-line bg-surface">
        <div className="container-editorial py-20 md:py-28">
          <Reveal>
            <p className="tag-label">{"<!-- services -->"}</p>
            <h2 className="mt-3 max-w-2xl text-3xl md:text-4xl">Everything your digital presence needs.</h2>
            <p className="mt-4 max-w-2xl text-muted">
              From the first idea to the final launch — design, build, motion, commerce and search, handled with the
              same care.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 0.05}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group block transition-transform duration-300 ease-out hover:-translate-y-1.5"
                  data-cursor="Explore ↗"
                >
                  <div className="relative overflow-hidden rounded-[10px] border border-line transition-colors duration-300 group-hover:border-cobalt/50">
                    <div className="relative" style={{ aspectRatio: "16 / 11" }}>
                      <Image src={`/generated/service-${s.slug}.webp`} alt={`${s.title} — Premium Markup`} fill sizes="(max-width: 768px) 100vw, 33vw" className="pm-shot object-cover group-hover:scale-[1.06]" />
                    </div>
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "linear-gradient(180deg, transparent 55%, color-mix(in oklab, var(--color-cobalt) 26%, transparent))" }} />
                  </div>
                  <h3 className="mt-5 flex items-center gap-2 text-xl group-hover:text-cobalt">
                    {s.title}
                    <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                  </h3>
                  <p className="mt-2 text-sm text-muted">{s.tagline}</p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <Link href="/services" className="group mt-12 inline-flex items-center gap-2 font-medium text-cobalt" data-cursor="All services ↗">
              All services
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* selected work */}
      <section className="container-editorial py-20 md:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="tag-label">{"<!-- selected work -->"}</p>
              <h2 className="mt-3 text-3xl md:text-4xl">Selected work</h2>
            </div>
            <Link href="/work" className="group inline-flex items-center gap-2 font-medium text-cobalt" data-cursor="All work ↗">
              All case studies
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12">
          <WorkTeaser projects={featured} categories={portfolio.categories} />
        </div>
      </section>

      {/* process — dark band */}
      <section className="band">
        <div className="container-editorial py-20 md:py-28">
          <Reveal>
            <p className="tag-label">{"<!-- process -->"}</p>
            <KineticHeading text="A calm, clear process. No jargon, no surprises." className="mt-3 max-w-3xl text-3xl text-paper md:text-4xl" />
          </Reveal>
          <div className="mt-14">
            <ScrollRail />
            <div className="mt-8 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "01", t: "Discover", b: "Understand the business, audience and goals. Fixed scope, agreed in writing." },
                { n: "02", t: "Design", b: "Real design in the browser, refined together until it feels right on every screen." },
                { n: "03", t: "Develop", b: "Hand-coded for speed and accessibility. Fast pages, clean, searchable markup." },
                { n: "04", t: "Launch", b: "Ship, measure and keep improving — with support if you want it." },
              ].map((step, i) => (
                <Reveal key={step.n} delay={i * 0.08}>
                  <div className="group">
                    <span className="mono text-sm text-cobalt">{step.n}</span>
                    <h3 className="mt-3 text-xl text-paper transition-colors duration-300 group-hover:text-cobalt">{step.t}</h3>
                    <p className="mt-2 text-sm text-[color:var(--color-paper-dim)]">{step.b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal>
            <Link href="/process" className="group mt-12 inline-flex items-center gap-2 font-medium text-cobalt" data-cursor="Full process ↗">
              See the full process
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* why hand-coded */}
      <section className="container-editorial py-20 md:py-28">
        <Reveal>
          <p className="tag-label">{"<!-- why-us -->"}</p>
          <KineticHeading text="Hand-coded beats page-built. Here's where it shows." className="mt-3 max-w-3xl text-3xl md:text-4xl" />
        </Reveal>
        <div className="mt-12 overflow-hidden rounded-[8px] border border-line">
          <Reveal>
            <div className="grid grid-cols-3 border-b border-line bg-surface">
              <div className="p-4 md:p-5" />
              <div className="mono border-l border-line p-4 text-sm font-medium text-cobalt md:p-5">Hand-coded (us)</div>
              <div className="mono border-l border-line p-4 text-sm text-muted md:p-5">Page builder</div>
            </div>
          </Reveal>
          {compare.map((row, i) => (
            <Reveal key={row.point} delay={i * 0.07}>
              <div className="group grid grid-cols-3 border-b border-line transition-colors duration-300 last:border-0 hover:bg-surface">
                <div className="p-4 font-medium md:p-5">{row.point}</div>
                <div className="flex items-start gap-2 border-l border-line p-4 md:p-5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cobalt transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                  <span>{row.built}</span>
                </div>
                <div className="border-l border-line p-4 text-muted md:p-5">{row.builder}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* final CTA — oversized monogram */}
      <section className="band">
        <div className="relative overflow-hidden">
          <Parallax distance={70} className="pointer-events-none absolute -right-16 -top-16">
            <PMMark className="h-[420px] w-[420px] text-[color:#ffffff] opacity-[0.05] md:h-[560px] md:w-[560px]" />
          </Parallax>
          <div className="container-editorial relative py-24 text-center md:py-36">
            <Reveal>
              <p className="tag-label">{'<h2 class="cta">'}</p>
              <KineticHeading text="Have an idea worth building?" as="h2" className="mx-auto mt-3 max-w-3xl text-4xl text-paper md:text-5xl" />
              <p className="mx-auto mt-6 max-w-xl text-[color:var(--color-paper-dim)]">
                Tell us what you&rsquo;re planning and what a successful result looks like. We&rsquo;ll turn it into a clear,
                distinctive, high-performing experience.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Magnetic><Button href="/contact" variant="invert">Start your project</Button></Magnetic>
                <Magnetic>
                  <Button href="/work" variant="secondary" className="border-[color:#31353f] text-paper hover:bg-surface hover:text-ink">
                    Explore selected work
                  </Button>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
