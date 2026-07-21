"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Loader2, Save, Mail, Wand2, Radar, Search } from "lucide-react";
import { aiComposeColdEmail } from "@/lib/ai-compose";
import { createTemplate } from "@/lib/template-actions";
import { searchProspects, type PickedProspect } from "@/lib/prospect-pick";

type Mode = "cold" | "follow-up";

export function EmailWriterClient({
  aiReady,
  aiModel,
  prospectsAvailable,
}: {
  aiReady: boolean;
  aiModel: string;
  prospectsAvailable: boolean;
}) {
  const [business, setBusiness] = useState("");
  const [niche, setNiche] = useState("");
  const [contactName, setContactName] = useState("");
  const [gap, setGap] = useState("");
  const [brief, setBrief] = useState("");
  const [mode, setMode] = useState<Mode>("cold");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [copied, setCopied] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  // Prospect picker (pulls from the hosted Turso prospect DB)
  const [pickOpen, setPickOpen] = useState(false);
  const [pickQuery, setPickQuery] = useState("");
  const [pickBusy, setPickBusy] = useState(false);
  const [pickResults, setPickResults] = useState<PickedProspect[]>([]);
  const [pickSearched, setPickSearched] = useState(false);

  async function runProspectSearch() {
    if (!pickQuery.trim()) return;
    setPickBusy(true); setPickSearched(true);
    const rows = await searchProspects(pickQuery).catch(() => [] as PickedProspect[]);
    setPickResults(rows);
    setPickBusy(false);
  }

  function useProspect(p: PickedProspect) {
    setBusiness(p.name);
    setNiche(p.category);
    setGap(p.hasWebsite ? "Outdated or weak website" : "No website");
    const bits: string[] = [];
    bits.push(`${p.name}${p.category ? `, a ${p.category.toLowerCase()}` : ""}${p.city ? ` in ${p.city}` : ""}.`);
    if (p.rating != null) bits.push(`Google rating ${p.rating}${p.reviews ? ` from ${p.reviews} reviews` : ""}.`);
    bits.push(p.hasWebsite ? `Has a website (${p.website}).` : "Has NO website.");
    if (p.wa === "yes") bits.push("Reachable on WhatsApp.");
    setBrief(bits.join(" "));
    setSaveName(`${p.name} email`);
    setPickOpen(false);
  }

  async function write() {
    if (!brief.trim() && !business.trim()) { setErr("Describe the business first (even one line)."); return; }
    setBusy(true); setErr(""); setSaved(false);
    const r: any = await aiComposeColdEmail({ business, niche, contactName, gap, brief, mode });
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    const subs: string[] = r.subjects || [];
    setSubjects(subs);
    setSubject(subs[0] || "");
    setBody(r.body || "");
    if (!saveName) setSaveName((business.trim() || "Cold") + " email");
  }

  async function copy() {
    const text = subject ? `Subject: ${subject}\n\n${body}` : body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveTpl() {
    if (!body.trim()) return;
    setSaveBusy(true);
    const r: any = await createTemplate({
      name: (saveName.trim() || "Cold email"),
      kind: "cold-email",
      subject: subject || undefined,
      body,
    });
    setSaveBusy(false);
    if (r?.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    else setErr(r?.error || "Could not save template.");
  }

  const field = "mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt";
  const labelTxt = "mono text-xs text-muted";

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
      <div className="flex items-center gap-2">
        <Wand2 className="h-5 w-5 text-cobalt" aria-hidden="true" />
        <h1 className="text-2xl">AI cold email</h1>
      </div>
      <p className="mt-1 text-sm text-muted">
        Describe a business (especially one with no website). You get 3 punchy subject lines and a tight 4-line email built to earn a reply, never salesy.
      </p>

      {!aiReady && (
        <div className="mt-4 rounded-[6px] border border-tag/30 bg-tag/5 p-3 text-sm text-tag">
          AI is not configured. Add an AI provider key (config.json or the AI_* env vars) and reload.
        </div>
      )}

      {/* Inputs */}
      <div className="mt-6 rounded-[6px] border border-line bg-surface p-5">
        {prospectsAvailable && (
          <div className="mb-4 rounded-[6px] border border-cobalt/30 bg-cobalt/5 p-3">
            {!pickOpen ? (
              <button
                type="button"
                onClick={() => setPickOpen(true)}
                className="inline-flex items-center gap-2 text-sm font-medium text-cobalt"
              >
                <Radar className="h-4 w-4" /> Pull from a saved Prospect
              </button>
            ) : (
              <div>
                <span className={labelTxt}>Search your prospects</span>
                <div className="mt-1 flex gap-2">
                  <input
                    value={pickQuery}
                    onChange={(e) => setPickQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runProspectSearch(); } }}
                    placeholder="Name, city or category…"
                    className="min-h-10 flex-1 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={runProspectSearch}
                    disabled={pickBusy || !pickQuery.trim()}
                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-3 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60"
                  >
                    {pickBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => setPickOpen(false)} className="min-h-10 rounded-[6px] border border-line px-3 text-sm text-muted hover:text-ink">Close</button>
                </div>
                {pickSearched && !pickBusy && pickResults.length === 0 && (
                  <p className="mt-2 text-sm text-muted">No matches.</p>
                )}
                {pickResults.length > 0 && (
                  <ul className="mt-2 max-h-64 divide-y divide-line overflow-y-auto rounded-[6px] border border-line">
                    {pickResults.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => useProspect(p)}
                          className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-paper"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-ink">{p.name}</span>
                            <span className="block truncate text-xs text-muted">
                              {[p.category, p.city].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${p.hasWebsite ? "bg-line/60 text-muted" : "bg-cobalt/10 text-cobalt"}`}>
                            {p.hasWebsite ? "has site" : "no site"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <label className="block">
          <span className={labelTxt}>Describe the business *</span>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            placeholder="e.g. Local plumber in Leeds. Great Google reviews (4.9) but no website at all, only a Facebook page. Gets most jobs by word of mouth."
            className="mt-1 w-full rounded-[6px] border border-line bg-surface p-3 text-sm outline-none focus:border-cobalt"
          />
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelTxt}>Business name</span>
            <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Ace Plumbing" className={field} />
          </label>
          <label className="block">
            <span className={labelTxt}>Industry / niche</span>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Plumber" className={field} />
          </label>
          <label className="block">
            <span className={labelTxt}>Contact first name (optional)</span>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Dave" className={field} />
          </label>
          <label className="block">
            <span className={labelTxt}>What they&rsquo;re missing</span>
            <input value={gap} onChange={(e) => setGap(e.target.value)} placeholder="No website" className={field} />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-[6px] border border-line">
            <button
              type="button"
              onClick={() => setMode("cold")}
              className={`px-3 py-2 text-sm ${mode === "cold" ? "bg-cobalt text-white" : "bg-surface text-muted hover:text-ink"}`}
            >
              First email
            </button>
            <button
              type="button"
              onClick={() => setMode("follow-up")}
              className={`px-3 py-2 text-sm ${mode === "follow-up" ? "bg-cobalt text-white" : "bg-surface text-muted hover:text-ink"}`}
            >
              Follow-up
            </button>
          </div>

          <button
            onClick={write}
            disabled={busy || !aiReady}
            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Writing…" : "Write email"}
          </button>
          {aiModel && <span className="text-xs text-muted">{aiModel}</span>}
          {err && <span className="text-sm text-tag">{err}</span>}
        </div>
      </div>

      {/* Output */}
      {(subjects.length > 0 || body) && (
        <div className="mt-5 rounded-[6px] border border-line bg-surface p-5">
          {subjects.length > 0 && (
            <div>
              <span className={labelTxt}>Subject lines · tap to use</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {subjects.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSubject(s)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      subject === s ? "border-cobalt bg-cobalt/10 text-cobalt" : "border-line text-ink hover:border-cobalt"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="mt-4 block">
            <span className={labelTxt}>Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={field} />
          </label>

          <label className="mt-3 block">
            <span className={labelTxt}>Email · edit freely</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7} className="mt-1 w-full rounded-[6px] border border-line bg-surface p-3 text-sm leading-relaxed outline-none focus:border-cobalt" />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={copy} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)]">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-4 text-sm hover:border-cobalt"
            >
              <Mail className="h-4 w-4" /> Open in email
            </a>
            <div className="ml-auto flex items-center gap-2">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Template name"
                className="min-h-10 w-40 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt"
              />
              <button onClick={saveTpl} disabled={saveBusy || !body.trim()} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-4 text-sm hover:border-cobalt disabled:opacity-60">
                {saveBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Saved" : "Save as template"}
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">Saved templates appear in Templates and the Compose page, where variables like {"{firstName}"} fill in per lead.</p>
        </div>
      )}
    </div>
  );
}
