import { Reveal } from "./reveal";

// Accessible FAQ accordion — native <details>/<summary> (keyboard + screen-reader
// friendly, answers stay in the DOM for crawlers) with a rotating +/- marker.
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-[color:var(--color-line)] border-y border-line">
      {items.map((f, i) => (
        <Reveal key={f.q} delay={Math.min(i, 4) * 0.03}>
          <details className="group py-5" {...(i === 0 ? { open: true } : {})}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium" data-cursor="Toggle">
              {f.q}
              <span className="mono shrink-0 text-xl text-tag transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-3 max-w-3xl text-muted">{f.a}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
