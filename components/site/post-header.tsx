import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPost, formatDate } from "@/lib/posts";

export function PostHeader({ slug }: { slug: string }) {
  const post = getPost(slug);
  if (!post) return null;
  return (
    <header className="border-b border-line">
      <div className="container-editorial pt-16 pb-12 md:pt-24 md:pb-14">
        <Link href="/blog" className="link-underline mono inline-flex items-center gap-2 text-sm text-muted">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Journal
        </Link>
        <p className="tag-label mt-6">{"<article>"}</p>
        <h1 className="mt-3 max-w-3xl text-3xl md:text-5xl">{post.title}</h1>
        <p className="mono mt-4 text-sm text-muted">
          {formatDate(post.date)} · {post.readingTime}
        </p>
      </div>
    </header>
  );
}
