"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, Search, X, Trash2, Loader2, Check, Paperclip } from "lucide-react";
import { STATUSES, SOURCES, statusTone } from "@/lib/leads-data";
import * as actions from "@/lib/lead-actions";

export type NoteDTO = { id: string; body: string; createdAt: string };
export type LeadDTO = {
  id: string; name: string; company: string | null; email: string | null;
  phone: string | null; website: string | null; niche: string | null; tags: string;
  source: string; status: string; budget: string | null; projectType: string | null;
  message: string | null; attachmentUrl: string | null; attachmentName: string | null;
  unread: boolean; createdAt: string; nextFollowUpDate: string | null;
  hasSsl: boolean | null; mobileFriendly: boolean | null; pageSpeedNote: string | null; socialsFound: string | null;
  auditSlow: boolean; auditDated: boolean; auditNotMobile: boolean; auditNoSeo: boolean; auditNotes: string | null;
  notes: NoteDTO[];
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export function LeadsClient({ leads, openId }: { leads: LeadDTO[]; openId?: string }) {
  const [rows, setRows] = useState(leads);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [sort, setSort] = useState<{ key: "name" | "createdAt" | "status"; dir: 1 | -1 }>({ key: "createdAt", dir: -1 });
  const [openLeadId, setOpenLeadId] = useState<string | null>(openId ?? null);
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState<"table" | "board">("table");
  const [, startTransition] = useTransition();

  function moveStatus(id: string, status: string) {
    patchRow(id, { status, unread: false });
    startTransition(() => actions.setStatus(id, status));
  }

  useEffect(() => setRows(leads), [leads]);
  useEffect(() => {
    if (openId) startTransition(() => actions.markRead(openId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = rows.find((r) => r.id === openLeadId) || null;

  function patchRow(id: string, patch: Partial<LeadDTO>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows
      .filter((r) => (status ? r.status === status : true))
      .filter((r) => (source ? r.source === source : true))
      .filter((r) =>
        term
          ? [r.name, r.company, r.email, r.phone, r.niche, r.tags].some((v) => (v || "").toLowerCase().includes(term))
          : true
      )
      .sort((a, b) => {
        const dir = sort.dir;
        if (sort.key === "name") return a.name.localeCompare(b.name) * dir;
        if (sort.key === "status") return a.status.localeCompare(b.status) * dir;
        return (a.createdAt < b.createdAt ? -1 : 1) * dir;
      });
  }, [rows, q, status, source, sort]);

  function toggleSort(key: "name" | "createdAt" | "status") {
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl">Leads</h1>
          <p className="mt-1 text-sm text-muted">{rows.length} total · {filtered.length} shown</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add lead
        </button>
      </div>

      {/* toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, company, email…"
            className="w-full min-h-10 rounded-[6px] border border-line bg-surface pl-9 pr-3 text-sm outline-none focus:border-cobalt"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm capitalize">
          <option value="">All sources</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="ml-auto flex rounded-[6px] border border-line bg-surface p-0.5 text-sm">
          <button onClick={() => setView("table")} className={`rounded-[5px] px-3 py-1.5 ${view === "table" ? "bg-cobalt text-white" : "text-muted hover:text-ink"}`}>Table</button>
          <button onClick={() => setView("board")} className={`rounded-[5px] px-3 py-1.5 ${view === "board" ? "bg-cobalt text-white" : "text-muted hover:text-ink"}`}>Board</button>
        </div>
      </div>

      {/* board */}
      {view === "board" && (
        <KanbanBoard leads={filtered} onOpen={setOpenLeadId} onMove={moveStatus} />
      )}

      {/* table */}
      {view === "table" && (
      <div className="mt-5 overflow-x-auto rounded-[6px] border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <Th onClick={() => toggleSort("name")} active={sort.key === "name"} dir={sort.dir}>Lead</Th>
              <Th onClick={() => toggleSort("status")} active={sort.key === "status"} dir={sort.dir}>Status</Th>
              <th className="px-4 py-3 mono text-xs font-medium text-muted">Source</th>
              <th className="px-4 py-3 mono text-xs font-medium text-muted">Follow-up</th>
              <Th onClick={() => toggleSort("createdAt")} active={sort.key === "createdAt"} dir={sort.dir}>Added</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr
                key={l.id}
                onClick={() => { setOpenLeadId(l.id); if (l.unread) { patchRow(l.id, { unread: false }); startTransition(() => actions.markRead(l.id)); } }}
                className="cursor-pointer border-b border-line last:border-0 hover:bg-paper"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {l.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-cobalt" title="Unread" />}
                    <div>
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted">{l.company || l.email || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone[l.status] || ""}`}>{l.status}</span></td>
                <td className="px-4 py-3 capitalize text-muted">{l.source}</td>
                <td className="px-4 py-3 mono text-xs">{l.nextFollowUpDate ? fmt(l.nextFollowUpDate) : <span className="text-muted">—</span>}</td>
                <td className="px-4 py-3 mono text-xs text-muted">{fmt(l.createdAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted">No leads match those filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {selected && (
        <LeadDrawer
          lead={selected}
          onClose={() => setOpenLeadId(null)}
          patchRow={patchRow}
          onDelete={(id) => setRows((rs) => rs.filter((r) => r.id !== id))}
          startTransition={startTransition}
        />
      )}
      {adding && <AddLeadModal onClose={() => setAdding(false)} />}
    </div>
  );
}

function Th({ children, onClick, active, dir }: { children: React.ReactNode; onClick: () => void; active: boolean; dir: 1 | -1 }) {
  return (
    <th className="px-4 py-3">
      <button onClick={onClick} className="mono flex items-center gap-1 text-xs font-medium text-muted hover:text-ink">
        {children}
        {active && <span aria-hidden="true">{dir === 1 ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}

function LeadDrawer({
  lead, onClose, patchRow, onDelete, startTransition,
}: {
  lead: LeadDTO;
  onClose: () => void;
  patchRow: (id: string, patch: Partial<LeadDTO>) => void;
  onDelete: (id: string) => void;
  startTransition: (cb: () => void) => void;
}) {
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  function saveField(key: keyof LeadDTO, value: string) {
    if ((lead[key] || "") === value) return;
    patchRow(lead.id, { [key]: value } as Partial<LeadDTO>);
    startTransition(() => actions.updateLead(lead.id, { [key]: value }));
  }

  function saveResearch(key: keyof LeadDTO, value: boolean | string) {
    patchRow(lead.id, { [key]: value } as Partial<LeadDTO>);
    startTransition(() => actions.updateResearch(lead.id, { [key]: value }));
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="fixed right-0 top-0 z-50 flex h-dvh w-[min(460px,94vw)] flex-col overflow-y-auto border-l border-line bg-surface">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{lead.name}</h2>
            <p className="text-xs text-muted">{lead.company || "—"} · added {fmt(lead.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(`Delete "${lead.name}"? This can't be undone.`)) {
                  onClose();
                  onDelete(lead.id);
                  startTransition(() => actions.deleteLead(lead.id));
                }
              }}
              aria-label="Delete lead"
              className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-line text-muted hover:border-tag hover:text-tag"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-line text-muted hover:text-ink">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-5">
          {/* status + follow-up */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mono text-xs text-muted">Status</span>
              <select
                defaultValue={lead.status}
                onChange={(e) => { patchRow(lead.id, { status: e.target.value }); startTransition(() => actions.setStatus(lead.id, e.target.value)); }}
                className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-2 text-sm"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mono text-xs text-muted">Next follow-up</span>
              <input
                type="date"
                defaultValue={lead.nextFollowUpDate ? lead.nextFollowUpDate.slice(0, 10) : ""}
                onChange={(e) => { const v = e.target.value || null; patchRow(lead.id, { nextFollowUpDate: v ? new Date(v).toISOString() : null }); startTransition(() => actions.setFollowUp(lead.id, v)); }}
                className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-2 text-sm"
              />
            </label>
          </div>

          {/* editable contact */}
          <div className="space-y-3">
            <p className="mono text-xs font-medium text-muted">Contact</p>
            <EditField label="Name" value={lead.name} onSave={(v) => saveField("name", v)} />
            <EditField label="Company" value={lead.company} onSave={(v) => saveField("company", v)} />
            <EditField label="Email" value={lead.email} onSave={(v) => saveField("email", v)} type="email" />
            <EditField label="Phone" value={lead.phone} onSave={(v) => saveField("phone", v)} type="tel" />
            <EditField label="Website" value={lead.website} onSave={(v) => saveField("website", v)} />
            <EditField label="Niche" value={lead.niche} onSave={(v) => saveField("niche", v)} />
            <EditField label="Tags" value={lead.tags} onSave={(v) => saveField("tags", v)} />
          </div>

          {(lead.budget || lead.projectType || lead.message || lead.attachmentUrl) && (
            <div className="rounded-[6px] border border-line bg-paper p-4 text-sm">
              {lead.budget && <p><span className="text-muted">Budget:</span> {lead.budget}</p>}
              {lead.projectType && <p className="mt-1"><span className="text-muted">Type:</span> {lead.projectType}</p>}
              {lead.message && <p className="mt-2 whitespace-pre-wrap text-muted">{lead.message}</p>}
              {lead.attachmentUrl && (
                <a
                  href={lead.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-[6px] border border-line bg-surface px-3 py-2 text-cobalt transition-colors hover:border-cobalt"
                >
                  <Paperclip className="h-4 w-4" aria-hidden="true" />
                  {lead.attachmentName || "Download attachment"}
                </a>
              )}
            </div>
          )}

          {/* research + audit */}
          <div>
            <p className="mono text-xs font-medium text-muted">Research &amp; audit</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ToggleChip label="Has SSL" on={!!lead.hasSsl} onToggle={(v) => saveResearch("hasSsl", v)} />
              <ToggleChip label="Mobile-friendly" on={!!lead.mobileFriendly} onToggle={(v) => saveResearch("mobileFriendly", v)} />
              <ToggleChip label="Slow site" on={lead.auditSlow} onToggle={(v) => saveResearch("auditSlow", v)} warn />
              <ToggleChip label="Dated design" on={lead.auditDated} onToggle={(v) => saveResearch("auditDated", v)} warn />
              <ToggleChip label="Not mobile" on={lead.auditNotMobile} onToggle={(v) => saveResearch("auditNotMobile", v)} warn />
              <ToggleChip label="No SEO basics" on={lead.auditNoSeo} onToggle={(v) => saveResearch("auditNoSeo", v)} warn />
            </div>
            <label className="mt-3 flex items-center gap-3">
              <span className="mono w-20 shrink-0 text-xs text-muted">Speed</span>
              <input defaultValue={lead.pageSpeedNote || ""} onBlur={(e) => saveResearch("pageSpeedNote", e.target.value.trim())} placeholder="e.g. 4.2s on mobile" className="flex-1 min-h-9 rounded-[6px] border border-line bg-surface px-2.5 text-sm outline-none focus:border-cobalt" />
            </label>
            <label className="mt-2 flex items-center gap-3">
              <span className="mono w-20 shrink-0 text-xs text-muted">Socials</span>
              <input defaultValue={lead.socialsFound || ""} onBlur={(e) => saveResearch("socialsFound", e.target.value.trim())} placeholder="e.g. IG, FB found" className="flex-1 min-h-9 rounded-[6px] border border-line bg-surface px-2.5 text-sm outline-none focus:border-cobalt" />
            </label>
            <label className="mt-2 block">
              <span className="mono text-xs text-muted">Audit notes (feeds {"{auditFinding}"} in outreach)</span>
              <textarea defaultValue={lead.auditNotes || ""} onBlur={(e) => saveResearch("auditNotes", e.target.value.trim())} rows={2} className="mt-1 w-full rounded-[6px] border border-line bg-surface p-2 text-sm outline-none focus:border-cobalt" />
            </label>
          </div>

          {/* notes timeline */}
          <div>
            <p className="mono text-xs font-medium text-muted">Notes</p>
            <div className="mt-2 flex gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Add a note…"
                className="flex-1 rounded-[6px] border border-line bg-surface p-2 text-sm outline-none focus:border-cobalt"
              />
            </div>
            <button
              disabled={!note.trim() || savingNote}
              onClick={async () => {
                const body = note.trim(); if (!body) return;
                setSavingNote(true);
                const optimistic = { id: "temp-" + Date.now(), body, createdAt: new Date().toISOString() };
                patchRow(lead.id, { notes: [...lead.notes, optimistic] });
                setNote("");
                await actions.addNote(lead.id, body);
                setSavingNote(false);
              }}
              className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-[6px] bg-ink px-3 text-sm text-paper disabled:opacity-50"
            >
              {savingNote && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add note
            </button>

            <ul className="mt-4 space-y-3">
              {[...lead.notes].reverse().map((n) => (
                <li key={n.id} className="group rounded-[6px] border border-line p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="whitespace-pre-wrap">{n.body}</p>
                    {!n.id.startsWith("temp-") && (
                      <button
                        onClick={() => { patchRow(lead.id, { notes: lead.notes.filter((x) => x.id !== n.id) }); startTransition(() => actions.deleteNote(n.id)); }}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-4 w-4 text-muted hover:text-tag" />
                      </button>
                    )}
                  </div>
                  <p className="mono mt-1.5 text-[11px] text-muted">
                    {new Date(n.createdAt).toLocaleString("en-GB")}
                  </p>
                </li>
              ))}
              {lead.notes.length === 0 && <li className="text-sm text-muted">No notes yet.</li>}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}

function EditField({ label, value, onSave, type = "text" }: { label: string; value: string | null; onSave: (v: string) => void; type?: string }) {
  return (
    <label className="flex items-center gap-3">
      <span className="mono w-20 shrink-0 text-xs text-muted">{label}</span>
      <input
        type={type}
        defaultValue={value || ""}
        onBlur={(e) => onSave(e.target.value.trim())}
        className="flex-1 min-h-9 rounded-[6px] border border-line bg-surface px-2.5 text-sm outline-none focus:border-cobalt"
      />
    </label>
  );
}

function AddLeadModal({ onClose }: { onClose: () => void }) {
  const [pending, setPending] = useState(false);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(460px,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-[6px] border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add a prospect</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-muted hover:text-ink" /></button>
        </div>
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const fd = new FormData(e.currentTarget);
            const patch = Object.fromEntries(fd.entries()) as Record<string, string>;
            await actions.createLead(patch);
            setPending(false);
            onClose();
          }}
        >
          {[
            { name: "name", label: "Name *", required: true },
            { name: "company", label: "Company" },
            { name: "email", label: "Email", type: "email" },
            { name: "website", label: "Website" },
            { name: "niche", label: "Niche" },
          ].map((f) => (
            <label key={f.name} className="block">
              <span className="mono text-xs text-muted">{f.label}</span>
              <input name={f.name} type={f.type || "text"} required={f.required} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
            </label>
          ))}
          <label className="block">
            <span className="mono text-xs text-muted">Notes</span>
            <textarea name="notes" rows={2} className="mt-1 w-full rounded-[6px] border border-line bg-surface p-2 text-sm outline-none focus:border-cobalt" />
          </label>
          <button type="submit" disabled={pending} className="mt-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save prospect
          </button>
        </form>
      </div>
    </>
  );
}

function KanbanBoard({
  leads, onOpen, onMove,
}: {
  leads: LeadDTO[];
  onOpen: (id: string) => void;
  onMove: (id: string, status: string) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  return (
    <div className="mt-5 flex gap-3 overflow-x-auto pb-4">
      {STATUSES.map((st) => {
        const items = leads.filter((l) => l.status === st);
        return (
          <div
            key={st}
            onDragOver={(e) => { e.preventDefault(); setOverCol(st); }}
            onDragLeave={() => setOverCol((c) => (c === st ? null : c))}
            onDrop={(e) => { e.preventDefault(); if (dragId) onMove(dragId, st); setDragId(null); setOverCol(null); }}
            className={`w-72 shrink-0 rounded-[6px] border bg-paper/60 ${overCol === st ? "border-cobalt ring-2 ring-cobalt/20" : "border-line"}`}
          >
            <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone[st] || ""}`}>{st}</span>
              <span className="mono text-xs text-muted">{items.length}</span>
            </div>
            <div className="min-h-24 space-y-2 p-2">
              {items.map((l) => (
                <div
                  key={l.id}
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  onDragEnd={() => { setDragId(null); setOverCol(null); }}
                  onClick={() => onOpen(l.id)}
                  className={`cursor-grab rounded-[6px] border border-line bg-surface p-3 transition-colors hover:border-cobalt active:cursor-grabbing ${dragId === l.id ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {l.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" />}
                    <p className="text-sm font-medium">{l.name}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{l.company || l.email || "—"}</p>
                  {l.nextFollowUpDate && (
                    <p className="mono mt-1.5 text-[11px] text-tag">↳ {fmt(l.nextFollowUpDate)}</p>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-muted">Drop here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ToggleChip({ label, on, onToggle, warn }: { label: string; on: boolean; onToggle: (v: boolean) => void; warn?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!on)}
      className={`flex items-center gap-2 rounded-[6px] border px-2.5 py-1.5 text-xs transition-colors ${
        on
          ? warn
            ? "border-tag bg-[color:#fbeeed] text-tag"
            : "border-cobalt bg-cobalt/10 text-cobalt"
          : "border-line text-muted hover:border-ink"
      }`}
    >
      <span className={`grid h-3.5 w-3.5 place-items-center rounded-[3px] border ${on ? (warn ? "border-tag bg-tag" : "border-cobalt bg-cobalt") : "border-line"}`}>
        {on && <Check className="h-2.5 w-2.5 text-white" />}
      </span>
      {label}
    </button>
  );
}
