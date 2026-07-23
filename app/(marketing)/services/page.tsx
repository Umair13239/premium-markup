import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { Faq } from "@/components/site/faq";
import { Button } from "@/components/site/button";
import Image from "next/image";
import { Magnetic } from "@/components/site/magnetic";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services — web design, development, e-commerce, SEO & more",
  description:
    "Digital services built for better online experiences: website design and development, animated web experiences, e-commerce, UI/UX, SEO, redesign, landing pages, maintenance and graphic design.",
  alternates: { canonical: "/services" },
};

const hubFaqs = [
  { q: "Can I combine several services?", a: "Yes — most projects do. A typical engagement pairs design and development, often with SEO foundations and some graphic design. We scope it as one project." },
  { q: "Do you work with clients outside the UK and USA?", a: "Yes. We work remotely with businesses internationally. Time zones and currency are easy to work around; clear communication matters more." },
  { q: "How do projects usually start?", a: "With a short call and a clear brief. We agree scope and a fixed price in writing before any work begins, so there are no surprises." },
  { q: "How much does a project cost?", a: "Most sites land between £1,000 and £6,000 depending on scope; larger builds and e-commerce more. We quote a fixed price after understanding what you need." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        label="services"
        title="Digital services built for better online experiences."
        intro="From the first idea to the final launch, we handle the creative and technical detail needed to build a digital presence that feels considered, credible and ready to grow. Take one service or the whole project."
      />

      {/* service rows */}
      <div className="container-editorial py-16 md:py-24">
        <div className="flex flex-col gap-20 md:gap-28">
          {services.map((s, i) => (
            <Reveal key={s.slug}>
              <div className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="group/img relative overflow-hidden rounded-[10px] border border-line" style={{ aspectRatio: "16 / 9" }}>
                  <Image src={`/generated/service-${s.slug}.webp`} alt={`${s.title} — Premium Markup`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                </div>
                <div>
                  <p className="tag-label">{`<!-- ${s.keyword} -->`}</p>
                  <h2 className="mt-3 text-3xl md:text-4xl">{s.title}</h2>
                  <p className="mt-4 text-lg text-muted">{s.tagline}</p>
                  <p className="mt-4 text-muted">{s.intro}</p>
                  <Link href={`/services/${s.slug}`} className="group mt-6 inline-flex items-center gap-2 font-medium text-cobalt" data-cursor="Explore ↗">
                    Explore {s.title.toLowerCase()}
                    <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* process preview */}
      <section className="border-t border-line bg-surface">
        <div className="container-editorial py-16 md:py-20">
          <Reveal>
            <p className="tag-label">{"<!-- how we work -->"}</p>
            <h2 className="mt-3 max-w-2xl text-3xl md:text-4xl">A clear process, whichever service you take.</h2>
            <p className="mt-4 max-w-2xl text-muted">Discover, define, design, develop, refine, launch. Fixed scope and price agreed up front, and you see the real thing in the browser as it comes together.</p>
            <Link href="/process" className="group mt-6 inline-flex items-center gap-2 font-medium text-cobalt" data-cursor="See process ↗">
              See the full process
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-editorial py-16 md:py-24">
        <Reveal>
          <p className="tag-label">{"<!-- faq -->"}</p>
          <h2 className="mt-3 text-3xl md:text-4xl">Common questions</h2>
        </Reveal>
        <div className="mt-10">
          <Faq items={hubFaqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="band">
        <div className="container-editorial py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-2xl text-3xl text-paper md:text-5xl">Not sure which you need?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[color:var(--color-paper-dim)]">Tell us the goal and we&rsquo;ll tell you the shortest route to it — honestly, even if it&rsquo;s less work for us.</p>
          <div className="mt-8 flex justify-center">
            <Magnetic><Button href="/contact" variant="invert">Start a project</Button></Magnetic>
          </div>
        </div>
      </section>
    </>
  );
}
