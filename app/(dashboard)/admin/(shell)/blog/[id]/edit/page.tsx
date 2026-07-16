import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostEditor, type PostDTO } from "@/components/admin/post-editor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.post.findUnique({ where: { id } });
  if (!p) notFound();
  const dto: PostDTO = {
    id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
    coverImage: p.coverImage, tags: p.tags, status: p.status, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
  };
  return <PostEditor post={dto} />;
}
