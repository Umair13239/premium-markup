import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminWorkPage() {
  const projects = await prisma.project.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Work / Projects</h1>
          <p className="mt-1 text-sm text-muted">Case studies shown on the Work page and homepage.</p>
        </div>
        <Link href="/admin/work/new" className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)]">
          <Plus className="h-4 w-4" /> New project
        </Link>
      </div>

      <div className="mt-8 divide-y divide-[color:var(--color-line)] rounded-[8px] border border-line bg-surface">
        {projects.length === 0 && <p className="p-6 text-sm text-muted">No projects yet — add your first.</p>}
        {projects.map((p) => (
          <Link key={p.id} href={`/admin/work/${p.id}/edit`} className="flex items-center gap-4 p-4 transition-colors hover:bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image || "/generated/og.png"} alt="" className="h-14 w-24 shrink-0 rounded-[6px] border border-line object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{p.name}</span>
                {p.featured && <Star className="h-3.5 w-3.5 fill-cobalt text-cobalt" aria-label="Featured" />}
              </div>
              <p className="mono mt-0.5 truncate text-xs text-muted">{p.sector} · {p.services}</p>
            </div>
            <span className={`mono shrink-0 rounded-full px-2.5 py-1 text-[11px] ${p.status === "published" ? "bg-cobalt/10 text-cobalt" : "bg-paper text-muted"}`}>{p.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
