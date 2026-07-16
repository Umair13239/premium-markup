// Blog post metadata. The article body lives in each post's page.mdx;
// this list powers the /blog index, ordering, and post headers.
export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readingTime: string;
  keywords: string[];
};

export const posts: Post[] = [
  {
    slug: "why-your-wix-site-is-costing-you-customers",
    title: "Why your Wix site is costing you customers",
    excerpt:
      "It looked fine when you built it. But a slow, template site quietly turns visitors away and hides you from search. Here's how to tell, and what to do.",
    date: "2026-02-12",
    readingTime: "5 min read",
    keywords: ["Wix alternative", "small business website design UK", "website speed"],
  },
  {
    slug: "what-a-500-website-actually-gets-you",
    title: "What a £500 website actually gets you — and what it doesn't",
    excerpt:
      "There's nothing wrong with a small budget. There is something wrong with not knowing what it buys. A plain-English breakdown for UK business owners.",
    date: "2026-01-20",
    readingTime: "6 min read",
    keywords: ["cheap website UK", "website cost", "web development agency UK"],
  },
];

export const sortedPosts = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${months[m - 1]} ${y}`;
}
