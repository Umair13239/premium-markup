import Link from "next/link";
import { Globe, Phone, Star, RefreshCw } from "lucide-react";
import { getProspects, getProspectStats, tursoEnabled } from "@/lib/turso";

export const dynamic = "force-dynamic";

export const metadata = { title: "Prospects" };

function timeAgo(iso: string | null) {
  if (!iso) return "never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  return `${Math.round(hrs / 24)} day(s) ago`;
}

const chip = "rounded-full border border-line px-3 py-1 text-xs transition-colors hover:border-cobalt hover:text-cobalt";
const chipOn = "rounded-full border border-cobalt bg-cobalt/10 px-3 py-1 text-xs text-cobalt";

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; group?: string; wa?: string }>;
}) {
  const sp = await searchParams;

  if (!tursoEnabled()) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl">Prospects</h1>
        <p className="mt-4 rounded-[10px] border border-line bg-surface p-6 text-sm text-muted">
          Turso isn&apos;t configured. Add <code className="mono">TURSO_DATABASE_URL</code> and{" "}
          <code className="mono">TURSO_AUTH_TOKEN</code> to your environment variables to see live prospects here.
        </p>
      </div>
    );
  }

  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const q = sp.q || "";
  const group = sp.group || "";
  const wa = sp.wa || "";

  const [data, stats] = await Promise.all([
    getProspects({ page, search: q, group, wa, perPage: 26 }),
    getProspectStats(),
  ]);

  const qs = (next: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q, group, wa, page, ...next };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "" && !(k === "page" && v === 1)) p.set(k, String(v));
    }
    const s = p.toString();
    return s ? `/admin/prospects?${s}` : "/admin/prospects";
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl">Prospects</h1>
          <p className="mt-1 text-sm text-muted">
            <b className="text-ink">{stats.total.toLocaleString()}</b> collected ·{" "}
            <b className="text-ink">{stats.onWhatsapp.toLocaleString()}</b> on WhatsApp
          </p>
        </div>
        <p className="mono flex items-center gap-1.5 text-xs text-muted">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          synced {timeAgo(stats.syncedAt)}
        </p>
      </div>

      {/* search + filters */}
      <form className="mt-6 flex flex-wrap gap-2" action="/admin/prospects">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, city, phone, category…"
          className="min-h-10 min-w-56 flex-1 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt"
        />
        {group && <input type="hidden" name="group" value={group} />}
        {wa && <input type="hidden" name="wa" value={wa} />}
        <button className="min-h-10 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white">Search</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={qs({ group: "", page: 1 })} className={group ? chip : chipOn}>All</Link>
        {stats.groups.slice(0, 6).map((g) => (
          <Link key={g.name} href={qs({ group: g.name, page: 1 })} className={group === g.name ? chipOn : chip}>
            {g.name} <span className="opacity-60">{g.count}</span>
          </Link>
        ))}
        <span className="mx-1 h-4 w-px bg-[color:var(--color-line)]" />
        {[
          { k: "", l: "Any" },
          { k: "yes", l: "On WhatsApp" },
          { k: "no", l: "No WhatsApp" },
          { k: "unchecked", l: "Unchecked" },
        ].map((o) => (
          <Link key={o.l} href={qs({ wa: o.k, page: 1 })} className={wa === o.k ? chipOn : chip}>{o.l}</Link>
        ))}
      </div>

      {/* table */}
      <div className="mt-6 overflow-x-auto rounded-[10px] border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2 text-left">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Location</th>
              <th className="p-3 font-medium">Rating</th>
              <th className="p-3 font-medium">Contact</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted">No prospects match those filters.</td></tr>
            )}
            {data.rows.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="p-3">
                  <span className="flex items-center gap-1.5">
                    {r.starred ? <Star className="h-3.5 w-3.5 fill-current text-cobalt" aria-hidden="true" /> : null}
                    {r.link ? (
                      <a href={r.link} target="_blank" rel="noopener noreferrer" className="hover:text-cobalt">{r.name}</a>
                    ) : r.name}
                  </span>
                </td>
                <td className="p-3 text-muted">{r.main_category || r.group_name || "—"}</td>
                <td className="p-3 text-muted">{[r.city, r.state].filter(Boolean).join(", ") || "—"}</td>
                <td className="mono p-3 text-muted">{r.rating != null ? `★ ${Number(r.rating).toFixed(1)} (${r.reviews || 0})` : "—"}</td>
                <td className="p-3">
                  <span className="flex flex-wrap items-center gap-2 text-muted">
                    {r.phone && (
                      <span className={`mono inline-flex items-center gap-1 text-xs ${r.wa === "yes" ? "text-cobalt" : ""}`}>
                        <Phone className="h-3 w-3" aria-hidden="true" />{r.phone}
                      </span>
                    )}
                    {r.website && (
                      <a href={r.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs hover:text-cobalt">
                        <Globe className="h-3 w-3" aria-hidden="true" />site
                      </a>
                    )}
                    {!r.phone && !r.website && "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {data.totalPages > 1 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={qs({ page: Math.max(1, page - 1) })}
            aria-disabled={page <= 1}
            className={`min-h-9 rounded-[6px] border border-line px-3 py-1.5 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-cobalt hover:text-cobalt"}`}
          >
            ‹ Prev
          </Link>
          <span className="mono px-2 text-xs text-muted">
            Page {page} of {data.totalPages} · {data.total.toLocaleString()} total
          </span>
          <Link
            href={qs({ page: Math.min(data.totalPages, page + 1) })}
            aria-disabled={page >= data.totalPages}
            className={`min-h-9 rounded-[6px] border border-line px-3 py-1.5 text-sm ${page >= data.totalPages ? "pointer-events-none opacity-40" : "hover:border-cobalt hover:text-cobalt"}`}
          >
            Next ›
          </Link>
        </div>
      )}
    </div>
  );
}
