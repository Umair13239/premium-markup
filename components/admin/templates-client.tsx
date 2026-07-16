"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import * as t from "@/lib/template-actions";

export type TemplateDTO = { id: string; name: string; kind: string; subject: string | null; body: string };

const KINDS = [
  { v: "cold-email", label: "Cold email" },
  { v: "follow-up-1", label: "Follow-up 1" },
  { v: "follow-up-2", label: "Follow-up 2" },
  { v: "linkedin-dm", label: "LinkedIn DM" },
];
const kindLabel = (v: string) => KINDS.find((k) => k.v === v)?.label || v;

export function TemplatesClient({ templates }: { templates: TemplateDTO[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<TemplateDTO | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Templates</h1>
          <p className="mt-1 text-sm text-muted">
            Reusable messages. Variables: <code className="mono text-tag">{"{firstName}"}</code>{" "}
            <code className="mono text-tag">{"{company}"}</code>{" "}
            <code className="mono text-tag">{"{auditFinding}"}</code>
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)]">
          <Plus className="h-4 w-4" /> New template
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {templates.map((tpl) => (
          <div key={tpl.id} className="rounded-[6px] border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{tpl.name}</p>
                  <span className="mono rounded-full bg-paper px-2 py-0.5 text-[11px] text-muted">{kindLabel(tpl.kind)}</span>
                </div>
                {tpl.subject && <p className="mt-1 text-sm text-muted">Subject: {tpl.subject}</p>}
                <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-muted">{tpl.body}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setEditing(tpl)} className="rounded-[6px] border border-line px-3 py-1.5 text-sm hover:border-cobalt">Edit</button>
                <button onClick={() => { if (confirm(`Delete "${tpl.name}"?`)) { t.deleteTemplate(tpl.id).then(() => router.refresh()); } }} className="rounded-[6px] border border-line px-2 py-1.5 text-muted hover:border-tag hover:text-tag" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && <p className="text-sm text-muted">No templates yet.</p>}
      </div>

      {(creating || editing) && (
        <TemplateModal
          template={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

function TemplateModal({ template, onClose, onSaved }: { template: TemplateDTO | null; onClose: () => void; onSaved: () => void }) {
  const [pending, setPending] = useState(false);
  const [kind, setKind] = useState(template?.kind || "cold-email");

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(560px,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-[6px] border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{template ? "Edit template" : "New template"}</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-muted hover:text-ink" /></button>
        </div>
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const fd = new FormData(e.currentTarget);
            const data = { name: String(fd.get("name")), kind, subject: String(fd.get("subject") || ""), body: String(fd.get("body")) };
            if (template) await t.updateTemplate(template.id, data);
            else await t.createTemplate(data);
            setPending(false);
            onSaved();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mono text-xs text-muted">Name *</span>
              <input name="name" required defaultValue={template?.name} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
            </label>
            <label>
              <span className="mono text-xs text-muted">Kind</span>
              <select value={kind} onChange={(e) => setKind(e.target.value)} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-2 text-sm">
                {KINDS.map((k) => <option key={k.v} value={k.v}>{k.label}</option>)}
              </select>
            </label>
          </div>
          <label>
            <span className="mono text-xs text-muted">Subject (email only)</span>
            <input name="subject" defaultValue={template?.subject || ""} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
          </label>
          <label>
            <span className="mono text-xs text-muted">Body *</span>
            <textarea name="body" required rows={8} defaultValue={template?.body} className="mt-1 w-full rounded-[6px] border border-line bg-surface p-3 text-sm outline-none focus:border-cobalt" />
          </label>
          <button type="submit" disabled={pending} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} {template ? "Save changes" : "Create template"}
          </button>
        </form>
      </div>
    </>
  );
}
