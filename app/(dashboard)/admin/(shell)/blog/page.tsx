import Link from "next/link";
import { Plus, Pencil, ExternalLink, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { analyseSeo } from "@/lib/seo-score";

export const dynamic = "force-dynamic";

type SP = Promise<{ status?: string; q?: string }>;

// Same engine the editor uses, so the list and the editor always agree
function seoGaps(p: { title: string; slug: string; excerpt: string | null; content: string; seoTitle: string | null; seoDescription: string | null; focusKeyword: string | null; coverImage: string | null; tags: string }) {
  const r = analyseSeo({
    title: p.title, slug: p.slug, excerpt: p.excerpt || "", content: p.content,
    seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "", focusKeyword: p.focusKeyword || "",
    coverImage: p.coverImage || "", tags: p.tags,
  });
  return r.checks.filter((c) => c.status === "fail").map((c) => c.label);
}

const tabs = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

export default async function AdminBlogPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const status = tabs.some((t) => t.key === sp.status) ? sp.status! : "all";
  const q = (sp.q || "").trim();

  const all = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  const counts = {
    all: all.length,
    published: all.filter((p) => p.status === "published").length,
    draft: all.filter((p) => p.status !== "published").length,
  };
  const seoReady = all.filter((p) => seoGaps(p).length === 0).length;

  const shown = all
    .filter((p) => status === "all" || (status === "published" ? p.status === "published" : p.status !== "published"))
    .filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.slug.toLowerCase().includes(q.toLowerCase()));

  const stat = (label: string, value: number | string, hint?: string) => (
    <div className="rounded-[8px] border border-line bg-surface p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted">{hint}</div>}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl">Blog</h1>
          <p className="mt-1 text-sm text-muted">Write, edit and publish posts. Keep every post SEO-ready before you publish it.</p>
        </div>
        <Link href="/admin/blog/new" className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)]">
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stat("All posts", counts.all)}
        {stat("Published", counts.published)}
        {stat("Drafts", counts.draft)}
        {stat("SEO-ready", `${seoReady} / ${counts.all}`, "no failing SEO checks")}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-[8px] border border-line bg-surface p-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/blog?status=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-[6px] px-3 py-1.5 text-sm ${status === t.key ? "bg-cobalt text-white" : "text-muted hover:text-ink"}`}
            >
              {t.label} <span className="opacity-70">{counts[t.key as keyof typeof counts]}</span>
            </Link>
          ))}
        </div>
        <form className="flex items-center gap-2 rounded-[8px] border border-line bg-surface px-3" action="/admin/blog" method="get">
          <input type="hidden" name="status" value={status} />
          <Search className="h-4 w-4 text-muted" />
          <input name="q" defaultValue={q} placeholder="Search title or slug" className="h-9 w-56 bg-transparent text-sm outline-none" />
        </form>
      </div>

      <div className="mt-4 divide-y divide-[color:var(--color-line)] overflow-hidden rounded-[8px] border border-line bg-surface">
        <div className="hidden grid-cols-[1fr_auto_auto] gap-4 bg-paper px-4 py-2 text-xs font-medium text-muted md:grid">
          <span>Title</span><span>Status · SEO</span><span>Updated</span>
        </div>
        {shown.map((p) => {
          const gaps = seoGaps(p);
          return (
            <div key={p.id} className="grid grid-cols-1 gap-2 p-4 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-4">
              <div className="min-w-0">
                <Link href={`/admin/blog/${p.id}/edit`} className="font-medium hover:text-cobalt">{p.title || "Untitled"}</Link>
                <p className="mono mt-0.5 truncate text-xs text-muted">/blog/{p.slug}{p.readingTime ? ` · ${p.readingTime}` : ""}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.status === "published" ? "bg-[#25d07d]/15 text-[#137a47]" : "bg-[color:var(--color-line)] text-muted"}`}>
                  {p.status}
                </span>
                {gaps.length === 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#137a47]"><CheckCircle2 className="h-3.5 w-3.5" /> SEO ready</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#b45309]" title={`Missing: ${gaps.join(", ")}`}>
                    <AlertTriangle className="h-3.5 w-3.5" /> missing {gaps.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>{p.updatedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                {p.status === "published" && (
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" className="hover:text-cobalt" aria-label="View post"><ExternalLink className="h-4 w-4" /></a>
                )}
                <Link href={`/admin/blog/${p.id}/edit`} className="hover:text-cobalt" aria-label="Edit post"><Pencil className="h-4 w-4" /></Link>
              </div>
            </div>
          );
        })}
        {shown.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">
            {counts.all === 0 ? "No posts yet. Write your first one." : "No posts match this filter."}
          </p>
        )}
      </div>
    </div>
  );
}
