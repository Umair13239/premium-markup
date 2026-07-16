"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
function readingTime(html: string) {
  const words = (html.replace(/<[^>]+>/g, " ").match(/\S+/g) || []).length;
  return Math.max(1, Math.round(words / 200)) + " min read";
}
async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "post";
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

type PostInput = {
  title?: string; slug?: string; excerpt?: string; content?: string;
  coverImage?: string; tags?: string; status?: string;
  seoTitle?: string; seoDescription?: string;
};

function refresh(slug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPost(data: PostInput) {
  const title = (data.title || "Untitled post").trim();
  const slug = await uniqueSlug(data.slug ? slugify(data.slug) : slugify(title));
  const content = data.content || "";
  const status = data.status === "published" ? "published" : "draft";
  const post = await prisma.post.create({
    data: {
      title, slug, content,
      excerpt: data.excerpt || null,
      coverImage: data.coverImage || null,
      tags: data.tags || "",
      status,
      readingTime: readingTime(content),
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      publishedAt: status === "published" ? new Date() : null,
    },
  });
  refresh(slug);
  return { ok: true, id: post.id, slug };
}

export async function updatePost(id: string, data: PostInput) {
  const current = await prisma.post.findUnique({ where: { id } });
  if (!current) return { error: "Not found" };
  const title = (data.title ?? current.title).trim();
  const slug = data.slug !== undefined ? await uniqueSlug(slugify(data.slug || title), id) : current.slug;
  const content = data.content ?? current.content;
  const status = data.status ?? current.status;
  await prisma.post.update({
    where: { id },
    data: {
      title, slug, content,
      excerpt: data.excerpt ?? current.excerpt,
      coverImage: data.coverImage ?? current.coverImage,
      tags: data.tags ?? current.tags,
      status,
      readingTime: readingTime(content),
      seoTitle: data.seoTitle ?? current.seoTitle,
      seoDescription: data.seoDescription ?? current.seoDescription,
      publishedAt: status === "published" ? (current.publishedAt || new Date()) : null,
    },
  });
  refresh(slug);
  refresh(current.slug);
  return { ok: true, slug };
}

export async function deletePost(id: string) {
  await prisma.post.delete({ where: { id } });
  refresh();
  return { ok: true };
}
