import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal — web design & marketing for UK small businesses",
  description:
    "Plain-English writing on websites, speed, SEO and getting more from your online presence — for UK small business owners.",
  alternates: { canonical: "/blog" },
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        label="journal"
        title="Plain-English notes on getting online right."
        intro="No jargon, no hot takes. Practical writing for business owners who want a website that pulls its weight."
      />
      <div className="container-editorial py-16 md:py-20">
        {posts.length === 0 ? (
          <p className="text-muted">No articles published yet — check back soon.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-line)] border-y border-line">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={Math.min(i, 4) * 0.04}>
                <li>
                  <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-4 py-8 md:flex-row md:items-center md:gap-10">
                    {post.coverImage && (
                      <img src={post.coverImage} alt="" className="h-40 w-full shrink-0 rounded-[8px] border border-line object-cover md:h-28 md:w-44" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="mono text-sm text-muted">
                        {post.publishedAt ? fmt(post.publishedAt) : ""}{post.readingTime ? ` · ${post.readingTime}` : ""}
                      </p>
                      <h2 className="mt-2 text-2xl group-hover:text-cobalt">{post.title}</h2>
                      {post.excerpt && <p className="mt-2 text-muted">{post.excerpt}</p>}
                    </div>
                    <span className="mono inline-flex shrink-0 items-center gap-2 text-sm text-cobalt">
                      Read <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
