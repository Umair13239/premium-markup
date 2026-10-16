import type { Metadata } from "next";
import { JsonLd, breadcrumb, pageMeta } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

// Same look as the pricing and how-it-works pages: lime pill eyebrow, big centred heading with the brand colour,
// soft grey cards with large radii. No code-style labels, rules or dashed boxes.
function Cover({ post, className }: { post: Post; className: string }) {
  if (post.coverImage) return <img src={post.coverImage} alt="" loading="lazy" className={`${className} object-cover`} />;
  return <div className={`${className} bg-[#EDEAF8]`} aria-hidden="true" />;
}

function Meta({ post }: { post: Post }) {
  const parts = [post.publishedAt ? fmt(post.publishedAt) : "", post.readingTime || ""].filter(Boolean);
  return <p className="text-sm text-[#6E6E73]">{parts.join(" · ")}</p>;
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  const [featured, ...rest] = posts;

  return (
    <div className="bg-white text-[#1D1D1F]">
      <JsonLd data={breadcrumb([{ name: "Blog", path: "/blog" }])} />

      <section className="pghead" style={{ paddingTop: 84 }}>
        <div className="eyebrow">Blog</div>
        <h1>
          Notes on getting
          <br />
          <span style={{ color: "var(--brand)" }}>online right.</span>
        </h1>
        <p className="lede mx-auto max-w-2xl text-lg leading-relaxed text-[#6E6E73]">
          What a website should cost, why speed keeps visitors, how Google picks who shows up first, and how to judge a
          designer before you pay a deposit.
        </p>
      </section>

      <div className="container-editorial pb-24">
        {posts.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-[28px] bg-[#F5F5F7] px-8 py-14 text-center">
            <p className="text-xl font-semibold">No articles yet.</p>
            <p className="mt-2 text-[#6E6E73]">New posts are on the way. Check back soon.</p>
          </div>
        ) : (
          <>
            {featured && (
              <Reveal>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid overflow-hidden rounded-[28px] bg-[#F5F5F7] transition-transform duration-300 hover:-translate-y-1 md:grid-cols-2"
                >
                  <Cover post={featured} className="aspect-[16/10] w-full md:aspect-auto md:h-full" />
                  <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#C5F541] px-3 py-1 text-sm font-semibold text-[#0C0819]">
                      Latest
                    </span>
                    <h2 className="text-3xl font-bold leading-tight tracking-tight transition-colors duration-200 group-hover:text-[#683CE7] md:text-4xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt && <p className="text-lg leading-relaxed text-[#6E6E73]">{featured.excerpt}</p>}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                      <Meta post={featured} />
                      <span className="inline-flex items-center gap-2 font-semibold text-[#683CE7]">
                        Read article <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )}

            {rest.length > 0 && (
              <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((post, i) => (
                  <Reveal key={post.id} delay={Math.min(i, 5) * 0.05}>
                    <li>
                      <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col gap-5">
                        <div className="overflow-hidden rounded-[24px] bg-[#F5F5F7]">
                          <Cover post={post} className="aspect-[16/10] w-full transition-transform duration-700 group-hover:scale-[1.03]" />
                        </div>
                        <div className="flex flex-1 flex-col gap-3">
                          <Meta post={post} />
                          <h2 className="text-2xl font-bold leading-snug tracking-tight transition-colors duration-200 group-hover:text-[#683CE7]">
                            {post.title}
                          </h2>
                          {post.excerpt && <p className="line-clamp-3 text-[#6E6E73]">{post.excerpt}</p>}
                          <span className="mt-auto inline-flex items-center gap-2 pt-2 font-semibold text-[#683CE7]">
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
