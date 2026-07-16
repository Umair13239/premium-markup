import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/site/button";
import { Magnetic } from "@/components/site/magnetic";
import { Reveal } from "@/components/site/reveal";
import { KineticHeading } from "@/components/site/kinetic-heading";
import { Stat } from "@/components/site/stat";
import { MediaReveal } from "@/components/site/media-reveal";
import { getProjectBySlug, getPublishedProjects } from "@/lib/projects";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getProjectBySlug(slug);
  if (!c) return {};
  return {
    title: c.seoTitle || `${c.name} — ${c.sector} case study`,
    description: c.seoDescription || c.summary,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: c.image ? { images: [c.image] } : undefined,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getProjectBySlug(slug);
  if (!c) notFound();

  const all = await getPublishedProjects();
  const idx = all.findIndex((x) => x.slug === slug);
  const next = all[(idx + 1) % all.length] || c;

  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${c.name} — case study`,
    about: c.sector,
    image: c.image || undefined,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    description: c.summary,
    keywords: c.services.join(", "),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <header className="relative overflow-hidden border-b border-line">
        <div className="spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-editorial relative pt-16 pb-12 md:pt-20 md:pb-14">
          <Link href="/work" className="link-underline mono inline-flex items-center gap-2 text-sm text-muted" data-cursor="Back to work">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All work
          </Link>
          <p className="tag-label mt-6">{`<!-- ${c.slug} -->`}</p>
          <KineticHeading text={c.name} as="h1" mode="mount" delay={0.1} className="mt-3 max-w-4xl text-4xl md:text-6xl" />
          <Reveal delay={0.25}>
            <p className="mono mt-5 text-sm text-muted">
              {[c.sector, c.location, c.year, c.services.join(" + ")].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-5 max-w-2xl text-lg text-muted">{c.summary}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Magnetic><Button href="/contact">Start a project</Button></Magnetic>
              {c.url && (
                <a href={`https://${c.url.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="link-underline mono inline-flex items-center gap-1.5 text-sm text-cobalt">
                  {c.url.replace(/^https?:\/\//, "")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </header>

      {c.image && (
        <div className="container-editorial py-10 md:py-14">
          <MediaReveal className="overflow-hidden rounded-[10px] border border-line">
            <div className="relative" style={{ aspectRatio: "16 / 9" }}>
              <Image src={c.image} alt={`${c.name} — ${c.sector}`} fill priority sizes="100vw" className="object-cover" />
            </div>
          </MediaReveal>
        </div>
      )}

      {c.results.length > 0 && (
        <section className="border-y border-line bg-surface">
          <div className="container-editorial grid grid-cols-1 gap-8 py-12 sm:grid-cols-3">
            {c.results.map((r) => <Stat key={r.label} value={r.stat} label={r.label} />)}
          </div>
        </section>
      )}

      <div className="container-editorial grid gap-14 py-16 md:grid-cols-2 md:py-24">
        {c.challenge && (
          <Reveal>
            <p className="tag-label">{"<!-- the challenge -->"}</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Where it was falling short</h2>
            <p className="mt-4 text-muted">{c.challenge}</p>
          </Reveal>
        )}
        {c.solution.length > 0 && (
          <Reveal delay={0.06}>
            <p className="tag-label">{"<!-- what we did -->"}</p>
            <h2 className="mt-3 text-2xl md:text-3xl">The approach</h2>
            <ul className="mt-5 space-y-3.5">
              {c.solution.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cobalt" aria-hidden="true" />
                  <span className="text-muted">{s}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>

      <section className="border-t border-line">
        <Link href={`/work/${next.slug}`} className="group block" data-cursor="Next project ↗">
          <div className="container-editorial flex flex-col gap-2 py-14 md:flex-row md:items-center md:justify-between md:py-20">
            <div>
              <p className="mono text-sm text-muted">Next project</p>
              <h2 className="mt-2 text-3xl transition-colors group-hover:text-cobalt md:text-5xl">{next.name}</h2>
              <p className="mono mt-2 text-sm text-muted">{[next.sector, next.services.join(" + ")].filter(Boolean).join(" · ")}</p>
            </div>
            <ArrowRight className="h-9 w-9 shrink-0 text-cobalt transition-transform duration-200 group-hover:translate-x-2" aria-hidden="true" />
          </div>
        </Link>
      </section>

      <section className="band">
        <div className="container-editorial py-16 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl text-3xl text-paper md:text-4xl">Want results like {c.name}&rsquo;s?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[color:var(--color-paper-dim)]">Tell us where your current site is falling short. We&rsquo;ll show you what a faster, sharper one could do.</p>
          <div className="mt-8 flex justify-center">
            <Magnetic><Button href="/contact" variant="invert">Start a project</Button></Magnetic>
          </div>
        </div>
      </section>
    </article>
  );
}
