"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ProjectDTO } from "@/lib/projects";

// Filterable, animated portfolio grid. Filters re-flow with layout animation
// (no reload); cards reveal on scroll and carry a "View project" cursor label.
export function WorkGallery({ projects }: { projects: ProjectDTO[] }) {
  const reduce = useReducedMotion();

  // Derive filters from the data (every service across all projects).
  const filters = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.services.forEach((s) => set.add(s)));
    return ["All", ...Array.from(set)];
  }, [projects]);

  const [active, setActive] = useState("All");
  const shown = active === "All" ? projects : projects.filter((p) => p.services.includes(active));

  return (
    <div className="container-editorial py-14 md:py-20">
      {/* filter bar */}
      <div className="mb-10 flex flex-wrap gap-2.5" role="tablist" aria-label="Filter work by service">
        {filters.map((f) => {
          const on = f === active;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(f)}
              className={`mono relative rounded-full border px-4 py-2 text-sm transition-colors ${
                on ? "border-cobalt text-cobalt" : "border-line text-muted hover:border-cobalt/50 hover:text-ink"
              }`}
            >
              {on && !reduce && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "color-mix(in oklab, var(--color-cobalt) 10%, transparent)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{f}</span>
            </button>
          );
        })}
      </div>

      {/* grid */}
      <motion.div layout className="grid gap-x-8 gap-y-16 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={reduce ? false : { opacity: 0, y: 26 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (i % 2) * 0.06 }}
            >
              <Link href={`/work/${p.slug}`} className="group block" data-cursor={"View project ↗"}>
                <div className="relative overflow-hidden rounded-[8px] border border-line" style={{ aspectRatio: "16 / 11" }}>
                  <Image
                    src={p.image || "/generated/og.png"}
                    alt={`${p.name} — ${p.sector}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="pm-shot object-cover group-hover:scale-[1.05]"
                  />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "linear-gradient(180deg, transparent 55%, color-mix(in oklab, var(--color-cobalt) 30%, transparent))" }} />
                  <span className="absolute left-4 top-4 rounded-full border border-line bg-[color:var(--color-paper)]/70 px-3 py-1 font-mono text-xs text-muted backdrop-blur-sm">
                    {p.year}
                  </span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl transition-colors group-hover:text-cobalt md:text-2xl">{p.name}</h2>
                    <p className="mono mt-1.5 text-sm text-muted">{p.sector} · {p.services.join(" + ")}</p>
                    <p className="mt-3 max-w-md text-muted">{p.summary}</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-6 w-6 shrink-0 text-cobalt transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {shown.length === 0 && (
        <p className="py-16 text-center text-muted">No projects in this category yet — <Link href="/contact" className="text-cobalt link-underline">start one</Link>.</p>
      )}
    </div>
  );
}
