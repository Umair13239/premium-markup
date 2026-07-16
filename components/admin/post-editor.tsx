"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Code2,
  Link2, ImagePlus, Undo2, Redo2, Loader2, Trash2, Eye, Save,
} from "lucide-react";
import * as blog from "@/lib/blog-actions";

export type PostDTO = {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  coverImage: string | null; tags: string; status: string; seoTitle: string | null; seoDescription: string | null;
};

async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const j = await res.json();
  return j.url || null;
}

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
      <Tb title="Insert image" onClick={() => imgInput.current?.click()}><ImagePlus className="h-4 w-4" /></Tb>
      <input
        ref={imgInput} type="file" accept="image/*" hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const url = await uploadImage(f);
          if (url) editor.chain().focus().setImage({ src: url }).run();
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function PostEditor({ post }: { post?: PostDTO }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [tags, setTags] = useState(post?.tags || "");
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || "");
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [msg, setMsg] = useState("");
  const coverInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Write your article… use the toolbar for headings, images, code, and more." }),
    ],
    content: post?.content || "",
    editorProps: { attributes: { class: "rich" } },
  });

  async function save(status: "draft" | "published") {
    if (!title.trim()) { setMsg("Add a title first."); return; }
    setSaving(status); setMsg("");
    const data = { title, slug, excerpt, content: editor?.getHTML() || "", coverImage, tags, status, seoTitle, seoDescription };
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">{post ? "Edit post" : "New post"}</h1>
        <div className="flex items-center gap-2">
          {post?.status === "published" && (
            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-3 text-sm hover:border-cobalt">
              <Eye className="h-4 w-4" /> View
            </a>
          )}
          <button onClick={() => save("draft")} disabled={!!saving} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-line px-4 text-sm hover:border-cobalt disabled:opacity-60">
            {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft
          </button>
          <button onClick={() => save("published")} disabled={!!saving} className="inline-flex min-h-10 items-center gap-2 rounded-[6px] bg-cobalt px-4 text-sm font-medium text-white hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60">
            {saving === "published" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Publish
          </button>
        </div>
      </div>
      {msg && <p className="mono mt-3 text-sm text-cobalt">{msg}</p>}

      <input
        value={title}
        onChange={(e) => { setTitle(e.target.value); if (!post) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")); }}
        placeholder="Post title"
        className="mt-5 w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none placeholder:text-muted"
      />
      <div className="mono mt-2 flex items-center gap-2 text-sm text-muted">
        <span>/blog/</span>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" className="flex-1 bg-transparent outline-none" />
      </div>

      {/* editor */}
      <div className="mt-6">
        {editor && <Toolbar editor={editor} />}
        <div className="rounded-b-[8px] border border-t-0 border-line bg-surface p-5">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* meta */}
      <div className="mt-8 space-y-5 rounded-[8px] border border-line bg-surface p-5">
        <p className="mono text-xs font-medium text-muted">Post settings</p>
        <label className="block">
          <span className="mono text-xs text-muted">Excerpt (shown on the blog index)</span>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="mt-1 w-full rounded-[6px] border border-line bg-surface p-2.5 text-sm outline-none focus:border-cobalt" />
        </label>
        <div>
          <span className="mono text-xs text-muted">Cover image</span>
          <div className="mt-1 flex items-center gap-3">
            {coverImage ? <img src={coverImage} alt="" className="h-16 w-24 rounded-[6px] border border-line object-cover" /> : <div className="flex h-16 w-24 items-center justify-center rounded-[6px] border border-dashed border-line text-xs text-muted">none</div>}
            <button type="button" onClick={() => coverInput.current?.click()} className="rounded-[6px] border border-line px-3 py-2 text-sm hover:border-cobalt">Upload</button>
            {coverImage && <button type="button" onClick={() => setCoverImage("")} className="text-muted hover:text-tag"><Trash2 className="h-4 w-4" /></button>}
            <input ref={coverInput} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadImage(f); if (url) setCoverImage(url); e.target.value = ""; }} />
          </div>
        </div>
        <label className="block">
          <span className="mono text-xs text-muted">Tags (comma-separated)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mono text-xs text-muted">SEO title (optional)</span>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
          </label>
          <label className="block">
            <span className="mono text-xs text-muted">SEO description (optional)</span>
            <input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="mt-1 w-full min-h-10 rounded-[6px] border border-line bg-surface px-3 text-sm outline-none focus:border-cobalt" />
          </label>
        </div>
        {post && (
          <button
            onClick={() => { if (confirm("Delete this post?")) blog.deletePost(post.id).then(() => router.push("/admin/blog")); }}
            className="inline-flex items-center gap-2 text-sm text-tag hover:underline"
          >
            <Trash2 className="h-4 w-4" /> Delete post
          </button>
        )}
      </div>
    </div>
  );
}
