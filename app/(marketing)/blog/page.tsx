import type { Metadata } from "next";
import { JsonLd, breadcrumb, pageMeta } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/site/section-label";
import { Reveal } from "@/components/site/reveal";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // posts written in the portal appear within a minute

export const metadata: Metadata = pageMeta({
  title: "Journal: Websites, Speed & SEO | Premium Markup",
  description:
    "Plain-English writing on websites, speed, SEO and getting more from your online presence — for small business owners.",
  path: "/blog",
});

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

type Post = Awaited<ReturnType<typeof prisma.post.findMany>>[number];

// The cover (or a quiet placeholder when a post has none) used by both the featured and the grid cards.
function Cover({ post, className }: { post: Post; className: string }) {
  if (post.coverImage) {
    return <img src={post.coverImage} alt="" loading="lazy" className={`${className} object-cover`} />;
  }
  return (
    <div className={`${className} flex items-center justify-center bg-[#F5F5F7]`} aria-hidden="true">
      <span className="mono text-sm text-[#6E6E73]">{"</>"}</span>
    </div>
  );
}

function Meta({ post }: { post: Post }) {
  const parts = [post.publishedAt ? fmt(post.publishedAt) : "", post.readingTime || ""].filter(Boolean);
  return <p className="mono text-sm text-[#6E6E73]">{parts.join("  ·  ")}</p>;
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  const [featured, ...rest] = posts;

  return (
    <div className="bg-white text-[#1D1D1F]">
      <JsonLd data={breadcrumb([{ name: "Journal", path: "/blog" }])} />

      <section className="border-b border-[#E5E5EA]">
        <div className="container-editorial pt-20 pb-14 md:pt-28 md:pb-16">
          <SectionLabel>journal</SectionLabel>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.08] text-[#1D1D1F] md:text-6xl">Notes on getting online right.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#6E6E73]">
            Practical writing for business owners: what a website should cost, why speed decides whether visitors stay, how
            Google decides who shows up first, and how to judge a designer before you pay a deposit. Written from real
            projects.
          </p>
        </div>
      </section>

      <div className="container-editorial py-14 md:py-20">
        {posts.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[#E5E5EA] bg-white p-10 text-center">
            <p className="text-lg text-[#1D1D1F]">No articles yet.</p>
            <p className="mt-2 text-[#6E6E73]">New notes are on the way. Check back soon.</p>
          </div>
        ) : (
          <>
            {featured && (
              <Reveal>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid overflow-hidden rounded-[12px] border border-[#E5E5EA] bg-white transition-colors duration-200 hover:border-[#683CE7] md:grid-cols-2"
                >
                  <Cover post={featured} className="aspect-[16/10] w-full md:h-full md:aspect-auto" />
                  <div className="flex flex-col justify-center gap-4 p-7 md:p-12">
                    <span className="mono text-sm text-[#683CE7]">Latest</span>
                    <h2 className="text-3xl leading-tight text-[#1D1D1F] transition-colors duration-200 group-hover:text-[#683CE7] md:text-4xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt && <p className="text-lg leading-relaxed text-[#6E6E73]">{featured.excerpt}</p>}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                      <Meta post={featured} />
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#683CE7]">
                        Read article <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )}

            {rest.length > 0 && (
              <ul className="mt-10 grid gap-x-8 gap-y-12 md:mt-14 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((post, i) => (
                  <Reveal key={post.id} delay={Math.min(i, 5) * 0.05}>
                    <li>
                      <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col gap-5">
                        <div className="overflow-hidden rounded-[12px] border border-[#E5E5EA]">
                          <Cover
                            post={post}
                            className="aspect-[16/10] w-full transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-3">
                          <Meta post={post} />
                          <h2 className="text-2xl leading-snug text-[#1D1D1F] transition-colors duration-200 group-hover:text-[#683CE7]">{post.title}</h2>
                          {post.excerpt && <p className="line-clamp-3 text-[#6E6E73]">{post.excerpt}</p>}
                          <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-[#683CE7]">
                            Read article <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  </Reveal>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
