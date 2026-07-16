import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import type { PortfolioProject, PortfolioCategory } from "@/lib/portfolio-types";

function isLogoCover(p: PortfolioProject) {
  if (p.coverFit === "contain") return true;
  if (p.coverFit === "cover") return false;
  return !p.website && !p.posts?.length && !p.thumbs?.length && !!p.logos?.length;
}

// Homepage teaser: a few real projects as engaging cards that link through to
// the full /work explorer. Server-rendered; hover motion is pure CSS.
export function WorkTeaser({ projects, categories }: { projects: PortfolioProject[]; categories: PortfolioCategory[] }) {
  const label = (id: string) => categories.find((c) => c.id === id)?.label || id;
  return (
    <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => {
        const logo = isLogoCover(p);
        return (
          <Reveal key={p.id} delay={(i % 3) * 0.05}>
            <Link
              href="/work"
              className="group block transition-transform duration-300 ease-out hover:-translate-y-1.5"
              data-cursor="View work ↗"
              style={{ ["--acc" as string]: p.accent || "var(--color-cobalt)" }}
            >
              <div className="relative overflow-hidden rounded-[12px] border border-line transition-colors duration-300 group-hover:border-cobalt/50">
                <div
                  className="relative"
                  style={{
                    aspectRatio: "16 / 11",
                    background: logo
                      ? "radial-gradient(125% 125% at 28% 18%, color-mix(in srgb, var(--acc) 22%, #f2ede1), #eae3d5)"
                      : "var(--color-surface-2)",
                  }}
                >
                  {p.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.cover}
                      alt={p.name}
                      loading="lazy"
                      className={`h-full w-full transition-transform duration-700 group-hover:scale-[1.05] ${logo ? "object-contain p-[13%]" : "object-cover object-top"}`}
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-sm">
                    {label(p.category)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg transition-colors group-hover:text-cobalt md:text-xl">{p.name}</h3>
                  {p.role && <p className="mono mt-1 text-xs text-muted">{p.role}</p>}
                </div>
                <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-cobalt transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
