"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, Check, ExternalLink, Upload } from "lucide-react";
import type { SiteImage } from "@/lib/site-images";
import { siteImageExt, siteImagePath } from "@/lib/site-images";

type CardState = { prompt: string; provider: "qwen" | "cloudflare"; busy: boolean; msg: string; err: string; src: string };

export function ImagesClient({ images }: { images: SiteImage[] }) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [state, setState] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(images.map((i) => [i.name, { prompt: i.prompt, provider: "qwen", busy: false, msg: "", err: "", src: siteImagePath(i.name) }]))
  );
  const groups = useMemo(() => {
    const g: Record<string, SiteImage[]> = {};
    images.forEach((i) => (g[i.group] = g[i.group] || []).push(i));
    return g;
  }, [images]);

  const patch = (name: string, p: Partial<CardState>) => setState((s) => ({ ...s, [name]: { ...s[name], ...p } }));

  async function regenerate(name: string) {
    const cur = state[name];
    patch(name, { busy: true, msg: "", err: "" });
    try {
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, prompt: cur.prompt, provider: cur.provider }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Generation failed");
      patch(name, { busy: false, src: j.url, msg: `Updated via ${j.provider}${j.fallback ? " (fallback)" : ""}` });
    } catch (e) {
      patch(name, { busy: false, err: e instanceof Error ? e.message : "Failed" });
    }
  }

  async function upload(name: string, file: File) {
    patch(name, { busy: true, msg: "", err: "" });
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload failed");
      patch(name, { busy: false, src: j.url, msg: "Replaced with your upload" });
    } catch (e) {
      patch(name, { busy: false, err: e instanceof Error ? e.message : "Upload failed" });
    }
  }

  return (
    <div className="mt-8 space-y-10">
      {Object.entries(groups).map(([group, items]) => (
        <section key={group}>
          <h2 className="mono text-xs font-medium uppercase tracking-wide text-muted">{group}</h2>
          <div className="mt-3 grid gap-4">
            {items.map((img) => {
              const st = state[img.name];
              return (
                <div key={img.name} className="grid gap-5 rounded-[8px] border border-line bg-surface p-4 md:grid-cols-[minmax(0,320px)_1fr]">
                  {/* preview */}
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={st.src} alt={img.label} className="aspect-video w-full rounded-[6px] border border-line object-cover" />
                    <a href={st.src} target="_blank" rel="noopener noreferrer" className="mono mt-2 inline-flex items-center gap-1.5 text-xs text-muted hover:text-cobalt">
                      <ExternalLink className="h-3.5 w-3.5" /> /generated/{img.name}.{siteImageExt(img.name)}
                    </a>
                  </div>

                  {/* controls */}
                  <div className="flex flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-medium">{img.label}</h3>
                      <span className="mono text-[11px] text-muted">{img.where}</span>
                    </div>
                    <textarea
                      value={st.prompt}
                      onChange={(e) => patch(img.name, { prompt: e.target.value })}
                      rows={3}
                      className="mt-2 w-full resize-y rounded-[6px] border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"
                      placeholder="Describe the image you want…"
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <select
                        value={st.provider}
                        onChange={(e) => patch(img.name, { provider: e.target.value as "qwen" | "cloudflare" })}
                        className="min-h-10 rounded-[6px] border border-line bg-paper px-3 text-sm outline-none focus:border-cobalt"
                        disabled={st.busy}
                      >
                        <option value="qwen">Qwen (Wan) — default</option>
                        <option value="cloudflare">Cloudflare Flux</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => regenerate(img.name)}
                        disabled={st.busy}
                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60"
                      >
                        {st.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        {st.busy ? "Generating…" : "Regenerate & replace"}
                      </button>
                      <input
                        ref={(el) => { fileRefs.current[img.name] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(img.name, f); e.target.value = ""; }}
                      />
                      <button
                        type="button"
                        onClick={() => fileRefs.current[img.name]?.click()}
                        disabled={st.busy}
                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-4 text-sm font-medium transition-colors hover:border-cobalt disabled:opacity-60"
                      >
                        <Upload className="h-4 w-4" /> Upload
                      </button>
                      {st.msg && <span className="inline-flex items-center gap-1.5 text-sm text-cobalt"><Check className="h-4 w-4" /> {st.msg}</span>}
                      {st.err && <span role="alert" className="text-sm text-tag">{st.err}</span>}
                    </div>
                    {st.busy && <p className="mono mt-2 text-xs text-muted">This can take 10–40 seconds…</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
