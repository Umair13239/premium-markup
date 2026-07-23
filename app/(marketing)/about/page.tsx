import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/site/button";
import { Magnetic } from "@/components/site/magnetic";
import { MediaReveal } from "@/components/site/media-reveal";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "About — the developer behind PremiumMarkup",
  description:
    "PremiumMarkup is a hands-on UK developer who builds every website personally. No account managers, no outsourcing — just careful, hand-coded work.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Own the craft",
    body: "Every line is written by hand. If a shortcut would slow your site or muddy your code, we don't take it.",
  },
  {
    title: "Say it straight",
    body: "Fixed scope, fixed price, in writing. If something isn't worth doing, we'll tell you — even if it's less work for us.",
  },
  {
    title: "Build to last",
    body: "You own the code and hosting. No platform rent, no lock-in, no surprise renewal that holds your site hostage.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="about"
        title="One developer. Every site, built personally."
        intro="PremiumMarkup isn't a faceless studio that outsources your project. It's a hands-on developer who writes the code, talks to you directly, and cares how it turns out."
      />

      <div className="container-editorial pt-10 md:pt-14">
        <MediaReveal className="overflow-hidden rounded-[10px] border border-line">
          <div className="relative" style={{ aspectRatio: "16 / 7" }}>
            <Image src="/generated/about.webp" alt="Craft and code — the Premium Markup approach" fill sizes="100vw" className="object-cover" />
          </div>
        </MediaReveal>
      </div>

      <div className="container-editorial grid gap-14 py-16 md:grid-cols-[1.4fr_1fr] md:py-20">
        <Reveal>
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-ink">
            <p>
              I started PremiumMarkup after watching too many small businesses pay
              for websites that quietly worked against them — slow to load, invisible
              in search, and impossible to change without paying the same agency again.
            </p>
            <p>
              So I do the opposite. I build every site by hand, from scratch, for
              speed and search. There&rsquo;s no account manager between us and no
              junior quietly doing the real work. You talk to the person writing the
              code, and you see the site take shape in the browser — not as a flat
              picture, but as the real thing, on real devices.
            </p>
            <p>
              I work remotely with businesses across the UK. That keeps overheads low
              and pricing honest, and it means where you are never limits who can build
              you something excellent.
            </p>
            <p className="text-muted">
              If you&rsquo;ve been burned by a cheap website before, I get it — most of
              my clients have. The fix is boring and effective: clear scope, fixed
              price, and code you own at the end.
            </p>
          </div>

          <div className="mt-10 border-t border-line pt-6">
            <p className="font-display text-2xl">{siteConfig.founder.name}</p>
            <p className="mono mt-1 text-sm text-muted">{siteConfig.founder.role}</p>
            <a
              href={`mailto:${siteConfig.email.founder}`}
              className="link-underline mono mt-2 inline-block text-sm text-cobalt"
            >
              {siteConfig.email.founder}
            </a>
          </div>
        </Reveal>

        <aside>
          <div className="rounded-[6px] border border-line bg-surface p-7 transition-all duration-300 hover:border-cobalt/40 hover:shadow-[0_24px_60px_-34px_rgba(37,99,235,0.5)]">
            <p className="tag-label">{"<!-- how we work -->"}</p>
            <ul className="mt-4 space-y-5">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.08}>
                  <li>
                    <p className="font-medium">{v.title}</p>
                    <p className="mt-1 text-sm text-muted">{v.body}</p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <Magnetic strength={0.25} className="block">
              <Button href="/contact" className="w-full">
                Work with us
              </Button>
            </Magnetic>
          </div>
        </aside>
      </div>
    </>
  );
}
