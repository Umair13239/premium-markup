const ITEMS = [
  "Next.js", "TypeScript", "React", "Tailwind CSS", "Framer Motion",
  "Core Web Vitals", "WCAG 2.1 AA", "Structured data", "Sub-second LCP",
  "Hand-coded", "SEO foundations", "You own the code",
];

// Pure-CSS infinite marquee (respects prefers-reduced-motion via globals).
export function TechMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section aria-label="What we build with" className="border-y border-line bg-surface/60 py-5">
      <div className="marquee-mask overflow-hidden">
        <div className="marquee flex w-max items-center gap-10 whitespace-nowrap">
          {row.map((t, i) => (
            <span key={i} className="mono flex items-center gap-3 text-sm text-muted">
              <span className="text-cobalt">/</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
