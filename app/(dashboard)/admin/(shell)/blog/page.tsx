import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Blog</h1>
          <p className="mt-1 text-sm text-muted">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/blog/new" className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)]">
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      <div className="mt-6 divide-y divide-[color:var(--color-line)] rounded-[8px] border border-line bg-surface">
        {posts.map((p) => (
          <Link key={p.id} href={`/admin/blog/${p.id}/edit`} className="flex items-center justify-between gap-4 p-4 hover:bg-paper">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.status === "published" ? "bg-[#25d07d]/15 text-[#137a47]" : "bg-[color:var(--color-line)] text-muted"}`}>
                  {p.status}
                </span>
              </div>
              <p className="mono mt-1 truncate text-xs text-muted">/blog/{p.slug} · {p.readingTime || ""}</p>
            </div>
            <Pencil className="h-4 w-4 shrink-0 text-muted" />
          </Link>
        ))}
        {posts.length === 0 && <p className="p-8 text-center text-sm text-muted">No posts yet. Write your first one.</p>}
      </div>
    </div>
  );
}
