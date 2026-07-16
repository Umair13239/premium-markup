"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Send, Sparkles, Loader2 } from "lucide-react";
import { setStatus, addNote } from "@/lib/lead-actions";
import { aiComposeReply, aiComposeStatus } from "@/lib/ai-compose";

export type ComposeLead = {
  id: string; name: string; company: string | null; email: string | null; website: string | null; niche: string | null;
  auditSlow: boolean; auditDated: boolean; auditNotMobile: boolean; auditNoSeo: boolean; auditNotes: string | null; status: string;
  message: string | null; budget: string | null; projectType: string | null;
};
export type ComposeTemplate = { id: string; name: string; kind: string; subject: string | null; body: string };

function auditFinding(l: ComposeLead) {
  if (l.auditNotes && l.auditNotes.trim()) return l.auditNotes.trim();
  const f: string[] = [];
  if (l.auditSlow) f.push("it loads slowly on mobile");
  if (l.auditNotMobile) f.push("it's tricky to use on a phone");
  if (l.auditDated) f.push("the design feels a little dated");
  if (l.auditNoSeo) f.push("it's missing a few SEO basics");
  return f.length
    ? `I had a look at your website and noticed ${f.join(", ")}.`
    : "I had a quick look at your website and spotted a few easy wins.";
}

function fill(text: string, l: ComposeLead) {
  const firstName = (l.name || "").split(/\s+/)[0] || "there";
  return text
    .replace(/\{firstName\}/g, firstName)
    .replace(/\{company\}/g, l.company || l.name)
    .replace(/\{name\}/g, l.name)
    .replace(/\{email\}/g, l.email || "")
    .replace(/\{website\}/g, l.website || "")
    .replace(/\{auditFinding\}/g, auditFinding(l));
}

export function ComposeClient({ leads, templates }: { leads: ComposeLead[]; templates: ComposeTemplate[] }) {
  const router = useRouter();
  const [leadId, setLeadId] = useState(leads[0]?.id ?? "");
  const [leadQuery, setLeadQuery] = useState("");
  const [tplId, setTplId] = useState(templates[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [marked, setMarked] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiModel, setAiModel] = useState("");
  const [aiErr, setAiErr] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => { aiComposeStatus().then((s) => { setAiReady(!!s.enabled); setAiModel(s.model || ""); }).catch(() => {}); }, []);

  async function writeWithAI() {
    if (!lead) return;
    setAiBusy(true); setAiErr("");
    const r: any = await aiComposeReply({ name: lead.name, company: lead.company, email: lead.email, website: lead.website, niche: lead.niche, budget: lead.budget, projectType: lead.projectType, message: lead.message });
    setAiBusy(false);
    if (r.error) { setAiErr(r.error); return; }
    if (r.subject) setSubject(r.subject);
    if (r.body) setBody(r.body);
  }

  const lead = useMemo(() => leads.find((l) => l.id === leadId), [leads, leadId]);
  const tpl = useMemo(() => templates.find((t) => t.id === tplId), [templates, tplId]);

  // Search leads by client name, company, website, email or niche.
  const matchLeads = (q: string) => {
    const s = q.trim().toLowerCase();
    if (!s) return leads;
    return leads.filter((l) =>
      [l.name, l.company, l.website, l.email, l.niche].some((v) => (v || "").toLowerCase().includes(s))
    );
  };
  const filteredLeads = useMemo(() => matchLeads(leadQuery), [leads, leadQuery]);

  // As the query changes, keep the selection valid by jumping to the first
  // match. Done in the change handler (not an effect) to avoid cascading renders.
  function onSearch(q: string) {
    setLeadQuery(q);
    const next = matchLeads(q);
    if (next.length && !next.some((l) => l.id === leadId)) setLeadId(next[0].id);
  }

  useEffect(() => {
    if (lead && tpl) {
      setSubject(tpl.subject ? fill(tpl.subject, lead) : "");
      setBody(fill(tpl.body, lead));
      setCopied(false);
      setMarked(false);
    }
  }, [lead, tpl]);

  async function copy() {
    const text = subject ? `Subject: ${subject}\n\n${body}` : body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function markContacted() {
    if (!lead) return;
    setMarked(true);
    startTransition(async () => {
      await setStatus(lead.id, "Contacted");
      await addNote(lead.id, `Sent "${tpl?.name}" via outreach.`);
      router.refresh();
    });
  }

  if (!leads.length) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
        <h1 className="text-2xl">Compose</h1>
        <p className="mt-3 text-sm text-muted">Add some leads first, then come back to write outreach.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
      <h1 className="text-2xl">Compose outreach</h1>
      <p className="mt-1 text-sm text-muted">Pick a lead and a template. Variables fill in automatically — edit freely, then copy.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mono text-xs text-muted">
            Lead{leadQuery.trim() ? ` · ${filteredLeads.length} match${filteredLeads.length === 1 ? "" : "es"}` : ` · ${leads.length}`}
          </span>
          <input
            value={leadQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by client, company or website…"
            className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt"
          />
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            size={leadQuery.trim() ? Math.min(8, Math.max(2, filteredLeads.length)) : undefined}
            className="mt-2 w-full min-h-10 rounded-[6px] border border-line bg-surface px-2 text-sm"
          >
            {filteredLeads.length === 0 && <option value="">No matches</option>}
            {filteredLeads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}{l.company ? ` · ${l.company}` : ""}{l.website ? ` — ${l.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mono text-xs text-muted">Template</span>
          <select value={tplId} onChange={(e) => setTplId(e.target.value)} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-2 text-sm">
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      {aiReady && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[6px] border border-cobalt/30 bg-cobalt/5 p-3">
          <button onClick={writeWithAI} disabled={aiBusy} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60">
            {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {aiBusy ? "Writing…" : "Write with AI"}
          </button>
          <span className="text-sm text-muted">
            Generates the best reply from this lead&rsquo;s details{aiModel ? ` · ${aiModel}` : ""}.
          </span>
          {aiErr && <span className="text-sm text-tag">{aiErr}</span>}
        </div>
      )}

      <div className="mt-5 rounded-[6px] border border-line bg-surface p-5">
        {subject !== "" && (
          <label className="block">
            <span className="mono text-xs text-muted">Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
          </label>
        )}
        <label className="mt-3 block">
          <span className="mono text-xs text-muted">Message</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} className="mt-1 w-full rounded-[6px] border border-line bg-surface p-3 text-sm outline-none focus:border-cobalt" />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={copy} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)]">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy to clipboard"}
          </button>
          {lead?.email && (
            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-4 text-sm hover:border-cobalt"
            >
              Open in email
            </a>
          )}
          <button onClick={markContacted} disabled={marked} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-4 text-sm hover:border-cobalt disabled:opacity-60">
            <Send className="h-4 w-4" /> {marked ? "Marked contacted" : "Mark contacted"}
          </button>
        </div>
      </div>
    </div>
  );
}
