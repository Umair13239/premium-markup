import Link from "next/link";
import { Inbox, Radar, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { STATUSES, SOURCES, statusTone, weeklyBuckets } from "@/lib/leads-data";
import { LeadsChart } from "@/components/admin/leads-chart";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function AdminHome() {
  const leads = await prisma.lead.findMany({
    select: {
      id: true, name: true, company: true, status: true, source: true,
      createdAt: true, nextFollowUpDate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const total = leads.length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = leads.filter((l) => l.createdAt.getTime() > weekAgo).length;
  const won = leads.filter((l) => l.status === "Won").length;
  const lost = leads.filter((l) => l.status === "Lost").length;
  const closed = won + lost;
  const conversion = closed ? Math.round((won / closed) * 100) : 0;

  const byStatus = STATUSES.map((s) => ({ s, n: leads.filter((l) => l.status === s).length }));
  const bySource = SOURCES.map((s) => ({ s, n: leads.filter((l) => l.source === s).length }));
  const chart = weeklyBuckets(leads.map((l) => l.createdAt), 12);

  const today = startOfToday();
  const dueFollowUps = leads
    .filter((l) => l.nextFollowUpDate && l.nextFollowUpDate <= today && l.status !== "Won" && l.status !== "Lost")
    .sort((a, b) => (a.nextFollowUpDate!.getTime() - b.nextFollowUpDate!.getTime()));

  const cards = [
    { label: "New this week", value: newThisWeek },
    { label: "Total leads", value: total },
    { label: "Conversion", value: `${conversion}%`, hint: `${won} won / ${closed} closed` },
    { label: "Follow-ups due", value: dueFollowUps.length, tone: dueFollowUps.length ? "text-tag" : "text-ink" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <h1 className="text-2xl">Admin</h1>
      <p className="mt-1 text-sm text-muted">Choose a panel.</p>

      {/* two-panel hub */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Link href="/admin/leads" className="group rounded-[10px] border border-line bg-surface p-7 transition-all hover:border-cobalt hover:shadow-[var(--shadow)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-cobalt/10 text-cobalt">
            <Inbox className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 flex items-center gap-2 text-xl">
            Website Leads
            <ArrowRight className="h-5 w-5 text-cobalt transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </h2>
          <p className="mt-2 text-sm text-muted">
            Enquiries submitted through the website contact form. Track, tag, note and pitch them.
          </p>
          <p className="mono mt-4 text-sm">
            <span className="text-2xl font-semibold">{total}</span>
            <span className="text-muted"> total{newThisWeek ? ` · ${newThisWeek} new this week` : ""}</span>
          </p>
        </Link>

        <a href="/portal/index.html" className="group rounded-[10px] border border-line bg-surface p-7 transition-all hover:border-cobalt hover:shadow-[var(--shadow)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-cobalt/10 text-cobalt">
            <Radar className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 flex items-center gap-2 text-xl">
            Google Leads &amp; Scraper
            <ArrowRight className="h-5 w-5 text-cobalt transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </h2>
          <p className="mt-2 text-sm text-muted">
            The full portal: scan Google Maps for businesses, harvest contacts, check WhatsApp, and pitch.
          </p>
          <p className="mono mt-4 text-sm text-muted">Scan · enrich · WhatsApp · pitch</p>
        </a>
      </div>

      <h2 className="mt-12 text-lg font-semibold">Website leads overview</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[6px] border border-line bg-surface p-5">
            <p className="mono text-xs text-muted">{c.label}</p>
            <p className={`mono mt-2 text-3xl font-semibold ${c.tone ?? "text-ink"}`}>{c.value}</p>
            {c.hint && <p className="mono mt-1 text-xs text-muted">{c.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[6px] border border-line bg-surface p-5">
          <p className="font-medium">Leads per week</p>
          <p className="mono text-xs text-muted">Last 12 weeks</p>
          <div className="mt-4">
            <LeadsChart data={chart} />
          </div>
        </div>

        <div className="rounded-[6px] border border-line bg-surface p-5">
          <p className="font-medium">By status</p>
          <ul className="mt-4 space-y-2.5">
            {byStatus.map(({ s, n }) => (
              <li key={s} className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone[s]}`}>{s}</span>
                <span className="mono text-sm">{n}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 font-medium">By source</p>
          <ul className="mt-3 space-y-2">
            {bySource.map(({ s, n }) => (
              <li key={s} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted">{s}</span>
                <span className="mono">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-[6px] border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="font-medium">Follow-ups due today</p>
          <Link href="/admin/leads" className="mono text-xs text-cobalt link-underline">All leads →</Link>
        </div>
        {dueFollowUps.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing due. You&rsquo;re on top of it.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[color:var(--color-line)]">
            {dueFollowUps.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2.5">
                <Link href={`/admin/leads?open=${l.id}`} className="hover:text-cobalt">
                  <span className="font-medium">{l.name}</span>
                  {l.company && <span className="text-muted"> · {l.company}</span>}
                </Link>
                <span className="mono text-xs text-tag">
                  {l.nextFollowUpDate!.toLocaleDateString("en-GB")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
