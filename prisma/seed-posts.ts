import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const posts = [
  {
    slug: "why-your-wix-site-is-costing-you-customers",
    title: "Why your Wix site is costing you customers",
    excerpt: "A slow, template website quietly turns visitors away and hides you from search. How to tell if yours is one — and what to do about it.",
    readingTime: "5 min read",
    tags: "wix,speed,seo",
    content: `<p>When you built your Wix site, it probably felt like a win. It looked tidy, went live in a weekend, and cost almost nothing. So it's an uncomfortable idea that the same site might now be quietly losing you work.</p>
<p>But that's often exactly what happens — not with a dramatic crash, but with a slow, steady leak of visitors who arrive, wait, and leave.</p>
<h2>Speed is the silent killer</h2>
<p>Page builders ship a lot of code. Sliders, animations, tracking scripts and the builder's own framework all load before your visitor sees anything useful. On a mid-range phone over 4G, that adds up fast. As load time climbs from one second to three, the chance a visitor leaves rises sharply. People don't wait — they tap back and pick the next result.</p>
<h2>You're harder to find than you think</h2>
<p>Search engines read your site's code. Clean, well-structured markup is easy to understand; bloated, generic output is not. Template sites tend to produce the latter, which means you start with a handicap.</p>
<h2>The ownership problem</h2>
<p>On a hosted builder you don't own your website — you rent it. Stop paying and it disappears. Want to move somewhere faster? You usually can't take it with you.</p>
<h2>What to do about it</h2>
<ul><li><strong>Hand-built and light</strong>, so it loads in under a second.</li><li><strong>Structured for search</strong>, with the basics done properly.</li><li><strong>Yours to keep</strong>, with the code and hosting in your name.</li></ul>
<p>That's the whole point of moving off a builder: not a prettier site, but one that actually works for your business every time someone lands on it.</p>`,
  },
  {
    slug: "what-a-500-website-actually-gets-you",
    title: "What a £500 website actually gets you — and what it doesn't",
    excerpt: "A plain-English breakdown of what a £500 website buys a UK small business, where the limits are, and when cheap is exactly the right call.",
    readingTime: "6 min read",
    tags: "pricing,budget",
    content: `<p>There's nothing wrong with a £500 website. There is something wrong with paying for one and not knowing what it buys. So here's the honest breakdown.</p>
<h2>What £500 usually gets you</h2>
<ul><li>A tidy, ready-made template with your logo, colours and text dropped in.</li><li>A handful of pages — home, about, services, contact.</li><li>A contact form and your details wired up.</li></ul>
<p>For a brand-new business that just needs to exist online, that can be enough to start with.</p>
<h2>What £500 doesn't get you</h2>
<ul><li><strong>Custom design</strong> shaped around your customers.</li><li><strong>Real speed</strong> — builder templates are rarely fast on a phone.</li><li><strong>SEO beyond the basics.</strong></li><li><strong>Ownership</strong> — you're usually renting the platform.</li></ul>
<h2>The maths people miss</h2>
<p>A £500 site with a £25/month platform fee is £500 up front and £300 a year, forever. Over three years that's £1,400 — for something you still don't own. A hand-built site costs more at the start and little to nothing to run, so past the first couple of years it's usually the cheaper option.</p>
<h2>So when is cheap the right call?</h2>
<p>When you're testing an idea, when the website genuinely isn't where your customers come from, or when cash is tight and a simple page now beats a perfect page in six months. All fair reasons — just go in with your eyes open about the ceiling.</p>`,
  },
];

async function main() {
  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, status: "published", publishedAt: new Date("2026-02-10") },
    });
  }
  console.log(`Seeded ${posts.length} blog posts.`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
