"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Sparkles, Trash2, Eye } from "lucide-react";
import { createProject, updateProject, deleteProject, type ProjectInput } from "@/lib/project-actions";
import { services } from "@/lib/services";

export type ProjectFormData = {
  id?: string;
  name: string; slug: string; sector: string; location: string; url: string; year: string;
  services: string; summary: string; challenge: string; solution: string; resultsText: string;
  image: string; status: string; featured: boolean; relatedService: string; order: number; seoTitle: string; seoDescription: string;
};

const field = "w-full min-h-10 rounded-[6px] border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20";
const label = "mono text-xs font-medium text-muted";

export function ProjectEditor({ initial }: { initial: ProjectFormData }) {
  const router = useRouter();
  const [f, setF] = useState<ProjectFormData>(initial);
  const [saving, setSaving] = useState<"" | "draft" | "published">("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [imgPreview, setImgPreview] = useState(initial.image);
  const [uploading, setUploading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiProvider, setAiProvider] = useState<"qwen" | "cloudflare">("qwen");
  const [aiBusy, setAiBusy] = useState(false);

  const set = (k: keyof ProjectFormData, v: unknown) => setF((s) => ({ ...s, [k]: v }));
  const onName = (v: string) => setF((s) => ({ ...s, name: v, slug: s.id ? s.slug : v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") }));

  async function uploadFile(file?: File | null) {
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload failed");
      set("image", j.url); setImgPreview(j.url);
    } catch (e) { setErr(e instanceof Error ? e.message : "Upload failed"); }
    setUploading(false);
  }

  async function generateImage() {
    if (!aiPrompt.trim()) { setErr("Enter an image prompt first."); return; }
    setAiBusy(true); setErr("");
    try {
      const res = await fetch("/api/admin/project-image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: f.slug || f.name, prompt: aiPrompt, provider: aiProvider }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Generation failed");
      const clean = j.url.split("?")[0];
      set("image", clean); setImgPreview(j.url);
    } catch (e) { setErr(e instanceof Error ? e.message : "Generation failed"); }
    setAiBusy(false);
  }

  async function save(status: "draft" | "published") {
    setSaving(status); setErr(""); setMsg("");
    const payload: ProjectInput = { ...f, status };
    try {
      if (f.id) await updateProject(f.id, payload);
      else { const r = await createProject(payload); setF((s) => ({ ...s, id: r.id, slug: r.slug })); }
      setMsg("Saved");
      router.refresh();
      if (!f.id) router.push("/admin/work");
    } catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); }
    setSaving("");
  }

  async function remove() {
    if (!f.id || !confirm("Delete this project permanently?")) return;
    try { await deleteProject(f.id); router.push("/admin/work"); router.refresh(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Delete failed"); }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">{f.id ? "Edit project" : "New project"}</h1>
        <div className="flex items-center gap-2">
          {f.id && f.status === "published" && (
            <a href={`/work/${f.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-3 text-sm hover:border-cobalt"><Eye className="h-4 w-4" /> View</a>
          )}
          {f.id && <button onClick={remove} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-3 text-sm text-tag hover:border-tag"><Trash2 className="h-4 w-4" /> Delete</button>}
          <button onClick={() => save("draft")} disabled={!!saving} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-4 text-sm hover:border-cobalt disabled:opacity-60">{saving === "draft" && <Loader2 className="h-4 w-4 animate-spin" />} Save draft</button>
          <button onClick={() => save("published")} disabled={!!saving} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60">{saving === "published" && <Loader2 className="h-4 w-4 animate-spin" />} Publish</button>
        </div>
      </div>
      {err && <p role="alert" className="mt-4 rounded-[6px] border border-[color:#e3b6b5] bg-[color:#fbeeed] px-3 py-2 text-sm text-tag">{err}</p>}
      {msg && <p className="mt-4 text-sm text-cobalt">{msg}</p>}

      <div className="mt-6 grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className={label}>Project / client name</span><input className={`${field} mt-1.5`} value={f.name} onChange={(e) => onName(e.target.value)} /></label>
          <label className="block"><span className={label}>Slug</span><input className={`${field} mt-1.5`} value={f.slug} onChange={(e) => set("slug", e.target.value)} /></label>
          <label className="block"><span className={label}>Sector</span><input className={`${field} mt-1.5`} value={f.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Bespoke joinery" /></label>
          <label className="block"><span className={label}>Location (optional)</span><input className={`${field} mt-1.5`} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Leeds" /></label>
          <label className="block"><span className={label}>Live URL (optional)</span><input className={`${field} mt-1.5`} value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="example.co.uk" /></label>
          <label className="block"><span className={label}>Year</span><input className={`${field} mt-1.5`} value={f.year} onChange={(e) => set("year", e.target.value)} placeholder="2026" /></label>
        </div>

        <label className="block"><span className={label}>Services (comma-separated)</span><input className={`${field} mt-1.5`} value={f.services} onChange={(e) => set("services", e.target.value)} placeholder="Web Development, SEO" /></label>
        <label className="block"><span className={label}>Summary (shown on the card)</span><textarea rows={2} className={`${field} mt-1.5 resize-y`} value={f.summary} onChange={(e) => set("summary", e.target.value)} /></label>
        <label className="block"><span className={label}>The challenge</span><textarea rows={3} className={`${field} mt-1.5 resize-y`} value={f.challenge} onChange={(e) => set("challenge", e.target.value)} /></label>
        <label className="block"><span className={label}>The approach — one bullet per line</span><textarea rows={4} className={`${field} mt-1.5 resize-y`} value={f.solution} onChange={(e) => set("solution", e.target.value)} /></label>
        <label className="block"><span className={label}>Results — one per line as: stat | label</span><textarea rows={3} className={`${field} mt-1.5 resize-y font-mono text-xs`} value={f.resultsText} onChange={(e) => set("resultsText", e.target.value)} placeholder={"3× | more enquiries in 90 days\n0.7s | mobile load time"} /></label>

        {/* image */}
        <div className="rounded-[8px] border border-line p-4">
          <span className={label}>Case study image</span>
          {imgPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgPreview} alt="" className="mt-2 aspect-video w-full max-w-md rounded-[6px] border border-line object-cover" />
          ) : <p className="mt-2 text-sm text-muted">No image yet — upload one or generate with AI.</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[6px] border border-line px-3 text-sm hover:border-cobalt">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => uploadFile(e.target.files?.[0])} />
            </label>
            <input className={`${field} max-w-xs`} value={f.image} onChange={(e) => { set("image", e.target.value); setImgPreview(e.target.value); }} placeholder="/uploads/… or /generated/…" />
          </div>
          <div className="mt-3 rounded-[6px] bg-paper p-3">
            <span className={label}>…or generate with AI</span>
            <textarea rows={2} className={`${field} mt-1.5 resize-y`} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. a modern bakery shopfront at dusk, warm light, cinematic" />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value as "qwen" | "cloudflare")} className={`${field} max-w-[190px]`} disabled={aiBusy}>
                <option value="qwen">Qwen (Wan) — default</option>
                <option value="cloudflare">Cloudflare Flux</option>
              </select>
              <button onClick={generateImage} disabled={aiBusy} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60">{aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {aiBusy ? "Generating…" : "Generate"}</button>
              {aiBusy && <span className="mono text-xs text-muted">10–40s…</span>}
            </div>
          </div>
        </div>

        {/* placement — where this project appears */}
        <div className="rounded-[8px] border border-line p-4">
          <span className={label}>Placement — where this project shows</span>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[var(--color-cobalt)]" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Show in homepage showcase</label>
            <label className="block">
              <span className={label}>Also show on a service page</span>
              <select className={`${field} mt-1.5`} value={f.relatedService} onChange={(e) => set("relatedService", e.target.value)}>
                <option value="">— none —</option>
                {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
              </select>
            </label>
            <label className="block"><span className={label}>Display order</span><input type="number" className={`${field} mt-1.5 max-w-[140px]`} value={f.order} onChange={(e) => set("order", Number(e.target.value))} /></label>
          </div>
          <p className="mono mt-3 text-xs text-muted">Publishing shows it on the <b>Work</b> page. Tick <b>homepage showcase</b> for the homepage slider. Pick a <b>service</b> to feature it under that service&rsquo;s related work.</p>
        </div>

        <details className="rounded-[8px] border border-line p-4">
          <summary className="cursor-pointer text-sm font-medium">SEO (optional)</summary>
          <div className="mt-3 grid gap-4">
            <label className="block"><span className={label}>SEO title</span><input className={`${field} mt-1.5`} value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></label>
            <label className="block"><span className={label}>Meta description</span><textarea rows={2} className={`${field} mt-1.5 resize-y`} value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></label>
          </div>
        </details>
      </div>
    </div>
  );
}
