import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Dot } from "lucide-react";
import { Button } from "@/components/site/button";
import { Magnetic } from "@/components/site/magnetic";
import { Reveal } from "@/components/site/reveal";
import { KineticHeading } from "@/components/site/kinetic-heading";
import Image from "next/image";
import { Faq } from "@/components/site/faq";
import { services, getService, relatedServices } from "@/lib/services";
import { getProjectsForService } from "@/lib/projects";
import { siteConfig } from "@/site.config";

export const revalidate = false;
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: { canonical: `/services/${s.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  const related = relatedServices(s.related);
  const work = await getProjectsForService(s.slug, 3);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    serviceType: s.keyword,
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    areaServed: ["United Kingdom", "United States", "Worldwide"],
    description: s.seoDescription,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* HERO */}
      <header className="relative overflow-hidden border-b border-line">
        <div className="spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-editorial relative grid items-center gap-10 pt-16 pb-14 md:grid-cols-2 md:pt-24 md:pb-20">
          <div>
            <Link href="/services" className="link-underline mono text-sm text-muted" data-cursor="All services">← All services</Link>
            <p className="tag-label mt-5">{`<!-- ${s.keyword} -->`}</p>
            <KineticHeading text={s.h1} as="h1" mode="mount" delay={0.1} className="mt-3 text-4xl md:text-6xl" />
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-xl text-lg text-muted">{s.tagline}</p>
              <div className="mt-8">
                <Magnetic><Button href="/contact">Start a project</Button></Magnetic>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-[10px] border border-line" style={{ aspectRatio: "16 / 9" }}>
              <Image src={`/generated/service-${s.slug}.webp`} alt={`${s.title} — Premium Markup`} fill priority sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </header>

      {/* INTRO */}
      <section className="container-editorial py-16 md:py-20">
        <Reveal>
          <p className="max-w-3xl text-xl leading-relaxed md:text-2xl">{s.intro}</p>
        </Reveal>
      </section>

      {/* PROBLEMS + WHO FOR */}
      <section className="border-y border-line bg-surface">
        <div className="container-editorial grid gap-12 py-16 md:grid-cols-2 md:py-20">
          <Reveal>
            <p className="tag-label">{"<!-- problems we solve -->"}</p>
            <h2 className="mt-3 text-2xl md:text-3xl">What this fixes</h2>
            <ul className="mt-6 space-y-3.5">
              {s.problems.map((p) => (
                <li key={p} className="flex gap-3 text-muted">
                  <Dot className="mt-0.5 h-6 w-6 shrink-0 text-tag" aria-hidden="true" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="tag-label">{"<!-- who it's for -->"}</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Who it&rsquo;s for</h2>
            <ul className="mt-6 space-y-3.5">
              {s.whoFor.map((w) => (
                <li key={w} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cobalt" aria-hidden="true" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="container-editorial py-16 md:py-24">
        <Reveal>
          <p className="tag-label">{"<!-- what you get -->"}</p>
          <h2 className="mt-3 max-w-2xl text-3xl md:text-4xl">What&rsquo;s included</h2>
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-[8px] border border-line bg-[color:var(--color-line)] sm:grid-cols-2 lg:grid-cols-3">
          {s.deliverables.map((d, i) => (
            <Reveal key={d} delay={Math.min(i, 5) * 0.04}>
              <div className="flex h-full items-start gap-3 bg-[color:var(--color-paper)] p-6">
                <span className="mono text-sm text-cobalt">{String(i + 1).padStart(2, "0")}</span>
                <span>{d}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line">
        <div className="container-editorial py-16 md:py-20">
          <Reveal>
            <p className="tag-label">{"<!-- questions -->"}</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Questions, answered</h2>
          </Reveal>
          <div className="mt-10"><Faq items={s.faqs} /></div>
        </div>
      </section>

      {/* RELATED WORK */}
      {work.length > 0 && (
        <section className="border-t border-line">
          <div className="container-editorial py-16 md:py-20">
            <Reveal><p className="tag-label">{"<!-- related work -->"}</p><h2 className="mt-3 text-2xl md:text-3xl">Work in this area</h2></Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {work.map((w, i) => (
                <Reveal key={w.slug} delay={i * 0.05}>
                  <Link href={`/work/${w.slug}`} className="group block" data-cursor="View project ↗">
                    <div className="relative overflow-hidden rounded-[8px] border border-line" style={{ aspectRatio: "16 / 11" }}>
                      <Image src={w.image || "/generated/og.png"} alt={`${w.name} — ${w.sector}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="pm-shot object-cover group-hover:scale-[1.05]" />
                    </div>
                    <h3 className="mt-4 text-lg group-hover:text-cobalt">{w.name}</h3>
                    <p className="mono mt-1 text-sm text-muted">{w.sector}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RELATED SERVICES */}
      {related.length > 0 && (
        <section className="border-t border-line bg-surface">
          <div className="container-editorial py-16 md:py-20">
            <Reveal><h2 className="text-2xl md:text-3xl">Related services</h2></Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {related.map((r, i) => (
                <Reveal key={r.slug} delay={i * 0.05}>
                  <Link href={`/services/${r.slug}`} className="group flex h-full flex-col rounded-[8px] border border-line bg-[color:var(--color-paper)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cobalt/40" data-cursor="Explore ↗">
                    <h3 className="text-xl group-hover:text-cobalt">{r.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-muted">{r.tagline}</p>
                    <ArrowRight className="mt-4 h-5 w-5 text-cobalt transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="band">
        <div className="container-editorial py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-2xl text-3xl text-paper md:text-4xl">Ready to talk {s.title.toLowerCase()}?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[color:var(--color-paper-dim)]">Tell us about the project and what a good result looks like. We reply within one working day.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Magnetic><Button href="/contact" variant="invert">Start a project</Button></Magnetic>
            <Button href="/work" variant="secondary" className="border-[color:#31353f] text-paper hover:bg-surface hover:text-ink">See our work</Button>
          </div>
        </div>
      </section>
    </article>
  );
}
