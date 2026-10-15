"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Code2,
  Link2, ImagePlus, Undo2, Redo2, Loader2, Trash2, Eye, Save, PenLine, ChevronDown,
  CheckCircle2, AlertTriangle, XCircle, Gauge,
} from "lucide-react";
import * as blog from "@/lib/blog-actions";
import { analyseSeo, type SeoCheck, type CheckStatus } from "@/lib/seo-score";

export type PostDTO = {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  coverImage: string | null; tags: string; status: string; seoTitle: string | null; seoDescription: string | null;
  focusKeyword: string | null;
};

async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const j = await res.json();
  return j.url || null;
}

const STATUS_STYLE: Record<CheckStatus, { color: string; icon: typeof CheckCircle2; label: string }> = {
  pass: { color: "#137a47", icon: CheckCircle2, label: "Good" },
  warn: { color: "#b45309", icon: AlertTriangle, label: "Improve" },
  fail: { color: "#b42318", icon: XCircle, label: "Fix" },
};

function Tb({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button" title={title} onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-[6px] border text-sm transition-colors ${active ? "border-cobalt bg-cobalt/10 text-cobalt" : "border-line text-muted hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const imgInput = useRef<HTMLInputElement>(null);
  const addLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1.5 rounded-t-[8px] border border-line bg-surface p-2">
      <Tb title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></Tb>
      <Tb title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></Tb>
      <span className="mx-1 h-5 w-px bg-line" />
      <Tb title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Tb>
      <Tb title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Tb>
      <Tb title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Tb>
      <Tb title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Tb>
      <span className="mx-1 h-5 w-px bg-line" />
      <Tb title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Tb>
      <Tb title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Tb>
      <Tb title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Tb>
      <Tb title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 className="h-4 w-4" /></Tb>
      <span className="mx-1 h-5 w-px bg-line" />
      <Tb title="Link" active={editor.isActive("link")} onClick={addLink}><Link2 className="h-4 w-4" /></Tb>
      <Tb title="Insert image (alt text is asked for)" onClick={() => imgInput.current?.click()}><ImagePlus className="h-4 w-4" /></Tb>
      <input
        ref={imgInput} type="file" accept="image/*" hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const url = await uploadImage(f);
          if (url) {
            // alt text is what the SEO check looks for, so ask for it up front
            const alt = window.prompt("Describe this image for screen readers and search (alt text)", "") || "";
            editor.chain().focus().setImage({ src: url, alt }).run();
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ScoreRing({ score, reduce }: { score: number; reduce: boolean | null }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const color = score >= 85 ? "#137a47" : score >= 70 ? "#2563eb" : score >= 50 ? "#b45309" : "#b42318";
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--color-line)" strokeWidth="9" />
        <motion.circle
          cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c - (c * score) / 100 }}
          transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span key={score} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold" style={{ color }}>
          {score}
        </motion.span>
        <span className="mono text-[10px] text-muted">/ 100</span>
      </div>
    </div>
  );
}

function CheckRow({ check, open, onToggle }: { check: SeoCheck; open: boolean; onToggle: () => void }) {
  const s = STATUS_STYLE[check.status];
  const Icon = s.icon;
  return (
    <div className="border-b border-line last:border-0">
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-paper">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: s.color }} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{check.label}</span>
          <span className="block text-xs text-muted">{check.message}</span>
        </span>
        <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-3 pb-3 pl-9 text-xs leading-relaxed">
              <p><span className="font-semibold text-ink">Why it matters: </span><span className="text-muted">{check.why}</span></p>
              <p><span className="font-semibold text-ink">What to do: </span><span className="text-muted">{check.fix}</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PostEditor({ post }: { post?: PostDTO }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [tags, setTags] = useState(post?.tags || "");
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || "");
  const [focusKeyword, setFocusKeyword] = useState(post?.focusKeyword || "");
  const [html, setHtml] = useState(post?.content || "");
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [msg, setMsg] = useState("");
  const [view, setView] = useState<"write" | "preview">("write");
  const [seoFilter, setSeoFilter] = useState<"all" | "todo">("todo");
  const [openCheck, setOpenCheck] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const coverInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Start with the answer to the reader's question, then go deeper…" }),
    ],
    content: post?.content || "",
    editorProps: { attributes: { class: "rich min-h-[320px] outline-none" } },
    onUpdate: ({ editor: e }) => setHtml(e.getHTML()),
  });

  // live SEO analysis, recomputed as the author types
  const seo = useMemo(
    () => analyseSeo({ title, slug, excerpt, content: html, seoTitle, seoDescription, focusKeyword, coverImage, tags }),
    [title, slug, excerpt, html, seoTitle, seoDescription, focusKeyword, coverImage, tags],
  );
  const failCount = seo.checks.filter((c) => c.status === "fail").length;
  const visibleChecks = seoFilter === "todo" ? seo.checks.filter((c) => c.status !== "pass") : seo.checks;
  const groups = Array.from(new Set(visibleChecks.map((c) => c.group)));

  async function save(status: "draft" | "published") {
    if (!title.trim()) { setMsg("Add a title first."); return; }
    if (status === "published" && failCount > 0) {
      const ok = window.confirm(`${failCount} SEO item(s) still fail. Publish anyway? Your score is ${seo.score}/100.`);
      if (!ok) return;
    }
    setSaving(status); setMsg("");
    const data = { title, slug, excerpt, content: html, coverImage, tags, status, seoTitle, seoDescription, focusKeyword };
    try {
      if (post) {
        const r = await blog.updatePost(post.id, data);
        setMsg(r.ok ? (status === "published" ? "Published." : "Saved.") : (r.error || "Error"));
      } else {
        const r = await blog.createPost(data);
        router.push(`/admin/blog/${r.id}/edit`);
      }
    } catch (e) { setMsg(String((e as Error).message)); }
    setSaving(null);
  }

  const fadeUp = (delay = 0) =>
    reduce ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay, ease: [0.2, 0.8, 0.2, 1] as const } };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      {/* header */}
      <motion.div {...fadeUp()} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl">{post ? "Edit post" : "New post"}</h1>
          <div className="flex gap-1 rounded-[8px] border border-line bg-surface p-1">
            {(["write", "preview"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} className={`relative rounded-[6px] px-3 py-1 text-sm capitalize ${view === v ? "text-white" : "text-muted hover:text-ink"}`}>
                {view === v && <motion.span layoutId="view-pill" className="absolute inset-0 rounded-[6px] bg-cobalt" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative inline-flex items-center gap-1.5">{v === "write" ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{v}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post?.status === "published" && (
            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-3 text-sm hover:border-cobalt">
              <Eye className="h-4 w-4" /> View live
            </a>
          )}
          <button onClick={() => save("draft")} disabled={!!saving} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-4 text-sm hover:border-cobalt disabled:opacity-60">
            {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft
          </button>
          <button onClick={() => save("published")} disabled={!!saving} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60">
            {saving === "published" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Publish
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {msg && (
          <motion.p key={msg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mono mt-3 text-sm text-cobalt">{msg}</motion.p>
        )}
      </AnimatePresence>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ===== writing column ===== */}
        <motion.div {...fadeUp(0.05)} className="min-w-0">
          {view === "write" ? (
            <>
              <textarea
                value={title}
                rows={2}
                onChange={(e) => { setTitle(e.target.value.replace(/\n/g, " ")); if (!post) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")); }}
                placeholder="Post title"
                className="w-full resize-none bg-transparent text-3xl font-extrabold leading-tight tracking-tight outline-none placeholder:text-muted"
              />
              <div className="mono mt-2 flex items-center gap-2 text-sm text-muted">
                <span>/blog/</span>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" className="flex-1 bg-transparent outline-none" />
              </div>
              <div className="mt-6">
                {editor && <Toolbar editor={editor} />}
                <div className="rounded-b-[8px] border border-t-0 border-line bg-surface p-5">
                  <EditorContent editor={editor} />
                </div>
                <p className="mono mt-2 text-right text-xs text-muted">{seo.stats.words} words · {seo.stats.readingMinutes} min read</p>
              </div>
            </>
          ) : (
            <article className="rounded-[8px] border border-line bg-surface p-6 md:p-10">
              {coverImage && <img src={coverImage} alt="" className="mb-6 aspect-[1200/630] w-full rounded-[8px] object-cover" />}
              <p className="mono text-xs text-muted">{seo.stats.readingMinutes} min read</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{title || "Untitled"}</h1>
              {excerpt && <p className="mt-3 text-lg text-muted">{excerpt}</p>}
              <div className="rich mt-8" dangerouslySetInnerHTML={{ __html: html || "<p><em>Nothing written yet.</em></p>" }} />
            </article>
          )}

          {/* settings */}
          <div className="mt-8 rounded-[8px] border border-line bg-surface">
            <button type="button" onClick={() => setShowSettings((v) => !v)} className="flex w-full items-center justify-between px-5 py-4 text-left">
              <span className="mono text-xs font-medium text-muted">Post settings & search appearance</span>
              <ChevronDown className={`h-4 w-4 text-muted transition-transform ${showSettings ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {showSettings && (
                <motion.div key="settings" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="space-y-5 border-t border-line p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mono text-xs text-muted">Focus keyword (the phrase this post should rank for)</span>
                        <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="e.g. restaurant website design" className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
                      </label>
                      <label className="block">
                        <span className="mono text-xs text-muted">Tags (comma-separated, 2 to 5)</span>
                        <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
                      </label>
                    </div>
                    <label className="block">
                      <span className="mono text-xs text-muted">Excerpt (shown on the blog index, 50 to 160 characters)</span>
                      <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="mt-1 w-full rounded-[6px] border border-line bg-surface p-2.5 text-sm outline-none focus:border-cobalt" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mono text-xs text-muted">SEO title {seoTitle ? "" : <button type="button" onClick={() => setSeoTitle(title)} className="ml-2 text-cobalt hover:underline">use post title</button>}</span>
                        <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
                        <span className="mono mt-1 block text-[11px] text-muted">{(seoTitle || title).length} / 60 characters</span>
                      </label>
                      <label className="block">
                        <span className="mono text-xs text-muted">Meta description</span>
                        <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} className="mt-1 w-full rounded-[6px] border border-line bg-surface p-2.5 text-sm outline-none focus:border-cobalt" />
                        <span className="mono mt-1 block text-[11px] text-muted">{seoDescription.length} / 160 characters</span>
                      </label>
                    </div>
                    {/* search preview */}
                    <div className="rounded-[8px] border border-dashed border-line p-4">
                      <p className="mono text-[11px] text-muted">Google preview</p>
                      <p className="mt-1 truncate text-sm text-[#1a0dab]">{(seoTitle || title || "Post title")}</p>
                      <p className="mono truncate text-xs text-[#137a47]">premiummarkup.com/blog/{slug || "your-slug"}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">{seoDescription || excerpt || "Add a meta description to control what appears under the title."}</p>
                    </div>
                    <div>
                      <span className="mono text-xs text-muted">Cover image (1200 × 630 px recommended)</span>
                      <div className="mt-1 flex items-center gap-3">
                        {coverImage ? <img src={coverImage} alt="" className="h-16 w-24 rounded-[6px] border border-line object-cover" /> : <div className="flex h-16 w-24 items-center justify-center rounded-[6px] border border-dashed border-line text-xs text-muted">none</div>}
                        <button type="button" onClick={() => coverInput.current?.click()} className="rounded-[6px] border border-line px-3 py-2 text-sm hover:border-cobalt">Upload</button>
                        {coverImage && <button type="button" onClick={() => setCoverImage("")} className="text-muted hover:text-tag"><Trash2 className="h-4 w-4" /></button>}
                        <input ref={coverInput} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadImage(f); if (url) setCoverImage(url); e.target.value = ""; }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {post && (
            <button
              onClick={() => { if (confirm("Delete this post?")) blog.deletePost(post.id).then(() => router.push("/admin/blog")); }}
              className="mt-6 inline-flex items-center gap-2 text-sm text-tag hover:underline"
            >
              <Trash2 className="h-4 w-4" /> Delete post
            </button>
          )}
        </motion.div>

        {/* ===== SEO panel ===== */}
        <motion.aside {...fadeUp(0.12)} className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-[8px] border border-line bg-surface">
            <div className="flex items-center gap-4 p-5">
              <ScoreRing score={seo.score} reduce={!!reduce} />
              <div className="min-w-0">
                <p className="mono flex items-center gap-1.5 text-xs text-muted"><Gauge className="h-3.5 w-3.5" /> SEO score</p>
                <p className="mt-1 text-lg font-semibold">{seo.grade}</p>
                <p className="mt-1 text-xs text-muted">
                  {failCount === 0 ? "No blocking issues." : `${failCount} item(s) need fixing before publish.`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-px border-y border-line bg-line text-center">
              {[
                ["Words", seo.stats.words],
                ["Headings", seo.stats.headings],
                ["Links", seo.stats.internalLinks + seo.stats.externalLinks],
              ].map(([k, v]) => (
                <div key={k as string} className="bg-surface py-3">
                  <div className="text-base font-semibold">{v}</div>
                  <div className="mono text-[10px] text-muted">{k}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-px bg-line text-center">
              <div className="bg-surface py-3">
                <div className="text-base font-semibold">{seo.stats.keywordCount}× <span className="text-xs text-muted">({seo.stats.keywordDensity}%)</span></div>
                <div className="mono text-[10px] text-muted">Keyword uses</div>
              </div>
              <div className="bg-surface py-3">
                <div className="text-base font-semibold">{seo.stats.avgSentenceWords}</div>
                <div className="mono text-[10px] text-muted">Words / sentence</div>
              </div>
            </div>

            <div className="flex items-center gap-1 border-b border-line p-2 text-xs">
              {(["todo", "all"] as const).map((f) => (
                <button key={f} type="button" onClick={() => setSeoFilter(f)} className={`rounded-[6px] px-2.5 py-1 ${seoFilter === f ? "bg-cobalt text-white" : "text-muted hover:text-ink"}`}>
                  {f === "todo" ? `To fix (${seo.checks.filter((c) => c.status !== "pass").length})` : `All checks (${seo.checks.length})`}
                </button>
              ))}
            </div>

            <div className="max-h-[52vh] overflow-y-auto">
              {groups.map((g) => (
                <div key={g}>
                  <p className="mono bg-paper px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted">{g}</p>
                  {visibleChecks.filter((c) => c.group === g).map((c) => (
                    <CheckRow key={c.id} check={c} open={openCheck === c.id} onToggle={() => setOpenCheck(openCheck === c.id ? null : c.id)} />
                  ))}
                </div>
              ))}
              {visibleChecks.length === 0 && <p className="p-6 text-center text-sm text-muted">Every check passes. Ready to publish.</p>}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
