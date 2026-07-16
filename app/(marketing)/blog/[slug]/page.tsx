import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PostCTA } from "@/components/site/post-cta";
import { siteConfig } from "@/site.config";

export const revalidate = false;
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ where: { status: "published" }, select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

async function getPost(slug: string) {
  return prisma.post.findFirst({ where: { slug, status: "published" } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  return {
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.excerpt || undefined,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: p.coverImage ? { images: [p.coverImage] } : undefined,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="border-b border-line">
        <div className="container-editorial pt-16 pb-12 md:pt-24 md:pb-14">
          <Link href="/blog" className="link-underline mono inline-flex items-center gap-2 text-sm text-muted">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Journal
          </Link>
          <p className="tag-label mt-6">{"<article>"}</p>
          <h1 className="mt-3 max-w-4xl text-4xl md:text-5xl">{post.title}</h1>
          <p className="mono mt-4 text-sm text-muted">
            {post.publishedAt ? post.publishedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}
            {post.readingTime ? ` · ${post.readingTime}` : ""}
          </p>
        </div>
      </header>

      {post.coverImage && (
        <div className="container-editorial pt-10">
          <img src={post.coverImage} alt="" className="mx-auto max-h-[440px] w-full max-w-4xl rounded-[10px] border border-line object-cover" />
        </div>
      )}

      <div className="container-editorial">
        <div
          className="rich mx-auto max-w-4xl py-12 md:py-16"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      <PostCTA />
    </article>
  );
}
