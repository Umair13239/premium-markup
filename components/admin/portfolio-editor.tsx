"use client";

import { useState } from "react";
import { Loader2, Check, ExternalLink, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { savePortfolio } from "@/lib/portfolio-actions";
import type { PortfolioData, PortfolioProject, PortfolioImage } from "@/lib/portfolio-types";
import { GROUP_KEYS } from "@/lib/portfolio-types";

const GROUP_LABELS: Record<(typeof GROUP_KEYS)[number], string> = {
  posts: "Social posts",
  thumbs: "Thumbnails",
  logos: "Logos",
  flyers: "Flyers",
  certs: "Certificates",
  covers: "Book Covers",
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

function firstImage(p: PortfolioProject): string {
  for (const k of GROUP_KEYS) {
    const arr = p[k]; if (arr?.length && arr[0].src) return arr[0].src;
  }
  return p.website?.shot || "";
}

const emptyProject = (category: string): PortfolioProject => ({
  id: "",
  category,
  name: "",
  role: "",
  accent: "#e8a33d",
  cover: "",
  website: null,
  posts: [],
  thumbs: [],
  logos: [],
  flyers: [],
  certs: [],
});

const label = "mono text-xs text-muted";
const input =
  "mt-1 w-full min-h-9 rounded-[6px] border border-line bg-paper px-2.5 text-sm outline-none focus:border-cobalt";

export function PortfolioEditor({
  initial,
  initialVisible,
}: {
  initial: PortfolioData;
  initialVisible: boolean;
}) {
  const [data, setData] = useState<PortfolioData>(initial);
  const [visible, setVisible] = useState(initialVisible);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const projects = data.projects;
  const categories = data.categories;

  function setProject(i: number, patch: Partial<PortfolioProject>) {
    setData((d) => {
      const next = [...d.projects];
      next[i] = { ...next[i], ...patch };
      return { ...d, projects: next };
    });
  }

  function setGroupItem(i: number, key: (typeof GROUP_KEYS)[number], j: number, patch: Partial<PortfolioImage>) {
    setData((d) => {
      const next = [...d.projects];
      const arr = [...(next[i][key] ?? [])];
      arr[j] = { ...arr[j], ...patch };
      next[i] = { ...next[i], [key]: arr };
      return { ...d, projects: next };
    });
  }

  function addGroupItem(i: number, key: (typeof GROUP_KEYS)[number]) {
    setData((d) => {
      const next = [...d.projects];
      next[i] = { ...next[i], [key]: [...(next[i][key] ?? []), { src: "", title: "" }] };
      return { ...d, projects: next };
    });
  }

  function removeGroupItem(i: number, key: (typeof GROUP_KEYS)[number], j: number) {
    setData((d) => {
      const next = [...d.projects];
      next[i] = { ...next[i], [key]: (next[i][key] ?? []).filter((_, x) => x !== j) };
      return { ...d, projects: next };
    });
  }

  function addProject() {
    const i = projects.length;
    setData((d) => ({ ...d, projects: [...d.projects, emptyProject(categories[0]?.id || "")] }));
    setOpen((o) => ({ ...o, [i]: true }));
  }

  function removeProject(i: number) {
    if (!confirm(`Delete “${projects[i].name || "this project"}”?`)) return;
    setData((d) => ({ ...d, projects: d.projects.filter((_, x) => x !== i) }));
  }

  function moveProject(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= projects.length) return;
    setData((d) => {
      const next = [...d.projects];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...d, projects: next };
    });
  }

  // categories
  function setCategory(i: number, patch: Partial<{ id: string; label: string }>) {
    setData((d) => {
      const next = [...d.categories];
      next[i] = { ...next[i], ...patch };
      return { ...d, categories: next };
    });
  }
  function addCategory() {
    setData((d) => ({ ...d, categories: [...d.categories, { id: "", label: "" }] }));
  }
  function removeCategory(i: number) {
    setData((d) => ({ ...d, categories: d.categories.filter((_, x) => x !== i) }));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    // Normalise before saving: give every project a stable id and a cover, and
    // drop image rows with no URL (empty fields the user added but didn't fill).
    const cleaned: PortfolioData = {
      categories: categories
        .map((c) => ({ id: slugify(c.id || c.label), label: c.label.trim() }))
        .filter((c) => c.label),
      projects: projects.map((p) => {
        const out: PortfolioProject = { ...p };
        out.id = p.id || slugify(p.name);
        for (const k of GROUP_KEYS) out[k] = (p[k] ?? []).filter((im) => im.src.trim());
        out.website = p.website && p.website.url.trim() ? p.website : p.website?.shot?.trim() ? p.website : null;
        out.cover = p.cover.trim() || firstImage(out);
        return out;
      }),
    };
    try {
      const r = await savePortfolio(cleaned, visible);
      if (r.ok) {
        setData(cleaned);
        setMsg("Saved — refresh /cv to see it live.");
      } else setMsg(r.error || "Save failed");
    } catch {
      setMsg("Save failed");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl">Portfolio</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            The projects shown at <code className="rounded bg-paper px-1 py-0.5">/cv</code>. Images are URLs (paste an
            imgbb or any hosted link). Edits go live on save — no rebuild.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/cv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-3 text-sm hover:border-cobalt"
          >
            <ExternalLink className="h-4 w-4" /> View /cv
          </a>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--color-cobalt)]"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
          />
          Visible <span className="text-muted">(off → /cv projects hidden)</span>
        </label>
        {msg && <span className="text-sm text-cobalt">{msg}</span>}
      </div>

      {/* categories */}
      <section className="mt-8 rounded-[8px] border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Categories <span className="text-muted">(the filter bar)</span></h2>
          <button onClick={addCategory} className="inline-flex items-center gap-1 text-xs text-cobalt hover:underline">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {categories.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={input + " mt-0"}
                value={c.label}
                placeholder="Label (e.g. Branding & Identity)"
                onChange={(e) => setCategory(i, { label: e.target.value })}
              />
              <button onClick={() => removeCategory(i)} className="shrink-0 text-muted hover:text-tag" aria-label="Remove category">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* projects */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-medium">Projects <span className="text-muted">({projects.length})</span></h2>
        <button onClick={addProject} className="inline-flex items-center gap-1.5 rounded-[6px] border border-line px-3 py-1.5 text-sm hover:border-cobalt">
          <Plus className="h-4 w-4" /> Add project
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {projects.map((p, i) => {
          const isOpen = open[i] ?? false;
          const imgCount = GROUP_KEYS.reduce((n, k) => n + (p[k]?.length ?? 0), 0) + (p.website ? 1 : 0);
          return (
            <div key={i} className="rounded-[8px] border border-line bg-surface">
              {/* header */}
              <div className="flex items-center gap-2 p-3">
                <button onClick={() => setOpen((o) => ({ ...o, [i]: !isOpen }))} className="text-muted hover:text-ink" aria-label="Toggle">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: p.accent }} />
                <input
                  className="min-h-9 flex-1 rounded-[6px] border border-transparent bg-transparent px-1 text-sm font-medium outline-none hover:border-line focus:border-cobalt"
                  value={p.name}
                  placeholder="Project name"
                  onChange={(e) => setProject(i, { name: e.target.value })}
                />
                <span className="mono hidden text-[11px] text-muted sm:inline">{imgCount} img</span>
                <div className="flex items-center">
                  <button onClick={() => moveProject(i, -1)} disabled={i === 0} className="px-1 text-muted hover:text-ink disabled:opacity-30" aria-label="Move up">↑</button>
                  <button onClick={() => moveProject(i, 1)} disabled={i === projects.length - 1} className="px-1 text-muted hover:text-ink disabled:opacity-30" aria-label="Move down">↓</button>
                </div>
                <button onClick={() => removeProject(i)} className="text-muted hover:text-tag" aria-label="Delete project">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-line p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className={label}>Category</span>
                      <select className={input} value={p.category} onChange={(e) => setProject(i, { category: e.target.value })}>
                        {categories.map((c, x) => (
                          <option key={x} value={slugify(c.id || c.label)}>{c.label || "(unnamed)"}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className={label}>Accent colour</span>
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-9 w-10 shrink-0 rounded border border-line bg-paper" value={p.accent} onChange={(e) => setProject(i, { accent: e.target.value })} />
                        <input className={input + " mt-0"} value={p.accent} onChange={(e) => setProject(i, { accent: e.target.value })} />
                      </div>
                    </label>
                    <label className="block sm:col-span-2">
                      <span className={label}>Role / services line</span>
                      <input className={input} value={p.role} placeholder="Brand Identity · Web Design · Social" onChange={(e) => setProject(i, { role: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className={label}>Cover image URL <span className="opacity-70">(blank = first image)</span></span>
                      <input className={input} value={p.cover} placeholder="https://…" onChange={(e) => setProject(i, { cover: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className={label}>Cover fit</span>
                      <select
                        className={input}
                        value={p.coverFit || "auto"}
                        onChange={(e) => setProject(i, { coverFit: e.target.value === "auto" ? undefined : (e.target.value as "cover" | "contain") })}
                      >
                        <option value="auto">Auto (logos contained, else fill)</option>
                        <option value="cover">Fill / crop</option>
                        <option value="contain">Contain on brand panel (logos)</option>
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className={label}>Live URL</span>
                        <input
                          className={input}
                          value={p.website?.url || ""}
                          placeholder="https://…"
                          onChange={(e) => setProject(i, { website: { url: e.target.value, shot: p.website?.shot || "" } })}
                        />
                      </label>
                      <label className="block">
                        <span className={label}>Screenshot URL</span>
                        <input
                          className={input}
                          value={p.website?.shot || ""}
                          placeholder="https://…"
                          onChange={(e) => setProject(i, { website: { url: p.website?.url || "", shot: e.target.value } })}
                        />
                      </label>
                    </div>
                  </div>

                  {/* image groups */}
                  <div className="mt-5 space-y-4">
                    {GROUP_KEYS.map((key) => (
                      <div key={key}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{GROUP_LABELS[key]} <span className="text-muted">({(p[key] ?? []).length})</span></span>
                          <button onClick={() => addGroupItem(i, key)} className="inline-flex items-center gap-1 text-xs text-cobalt hover:underline">
                            <Plus className="h-3.5 w-3.5" /> Add
                          </button>
                        </div>
                        {(p[key] ?? []).length > 0 && (
                          <div className="mt-2 space-y-2">
                            {(p[key] ?? []).map((im, j) => (
                              <div key={j} className="flex items-center gap-2">
                                {im.src ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={im.src} alt="" className="h-9 w-9 shrink-0 rounded border border-line object-cover" />
                                ) : (
                                  <span className="h-9 w-9 shrink-0 rounded border border-dashed border-line" />
                                )}
                                <input className={input + " mt-0 flex-1"} value={im.src} placeholder="Image URL" onChange={(e) => setGroupItem(i, key, j, { src: e.target.value })} />
                                <input className={input + " mt-0 flex-1"} value={im.title} placeholder="Caption" onChange={(e) => setGroupItem(i, key, j, { title: e.target.value })} />
                                <button onClick={() => removeGroupItem(i, key, j)} className="shrink-0 text-muted hover:text-tag" aria-label="Remove image">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={addProject} className="mt-4 inline-flex items-center gap-1.5 rounded-[6px] border border-line px-3 py-2 text-sm hover:border-cobalt">
        <Plus className="h-4 w-4" /> Add project
      </button>
    </div>
  );
}
