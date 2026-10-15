// SEO analysis for a blog post. Pure functions, no server-only imports, so the editor
// can run it live while the author types. Every check explains the mistake and why it matters.

export type SeoInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML from the editor
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  coverImage: string;
  tags: string;
};

export type CheckStatus = "pass" | "warn" | "fail";

export type SeoCheck = {
  id: string;
  group: "Title & meta" | "Keyword" | "Content" | "Structure" | "Media & links";
  label: string;
  status: CheckStatus;
  weight: number;
  message: string; // what is wrong or right, with the actual numbers
  why: string; // why it matters for ranking / clicks
  fix: string; // exactly what to do
};

export type SeoResult = {
  score: number; // 0-100
  grade: "Excellent" | "Good" | "Needs work" | "Poor";
  checks: SeoCheck[];
  stats: {
    words: number;
    readingMinutes: number;
    headings: number;
    images: number;
    imagesMissingAlt: number;
    internalLinks: number;
    externalLinks: number;
    keywordCount: number;
    keywordDensity: number; // percent
    avgSentenceWords: number;
  };
};

const stripTags = (html: string) =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const normalise = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();

function countMatches(haystack: string, needle: string) {
  if (!needle) return 0;
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) {
    n += 1;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return n;
}

export function analyseSeo(input: SeoInput): SeoResult {
  const title = input.title.trim();
  const seoTitle = (input.seoTitle || title).trim();
  const desc = input.seoDescription.trim();
  const excerpt = input.excerpt.trim();
  const keyword = normalise(input.focusKeyword || "");
  const slug = input.slug.trim();
  const text = stripTags(input.content);
  const plain = normalise(text);
  const words = plain ? plain.split(" ").length : 0;
  const first100 = plain.split(" ").slice(0, 100).join(" ");
  const tagCount = input.tags.split(",").filter((t) => t.trim()).length;

  // structure
  const h2 = (input.content.match(/<h2[\s>]/gi) || []).length;
  const h3 = (input.content.match(/<h3[\s>]/gi) || []).length;
  const hasH1 = /<h1[\s>]/i.test(input.content);
  const h2Texts = (input.content.match(/<h2[^>]*>[\s\S]*?<\/h2>/gi) || []).map((h) => normalise(stripTags(h)));

  // media and links
  const imgs = input.content.match(/<img\b[^>]*>/gi) || [];
  const imagesMissingAlt = imgs.filter((t) => !/\balt="[^"]+"/i.test(t)).length;
  const links = [...input.content.matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map((m) => m[1]);
  const internalLinks = links.filter((h) => h.startsWith("/") || h.includes("premiummarkup.com")).length;
  const externalLinks = links.filter((h) => /^https?:\/\//.test(h) && !h.includes("premiummarkup.com")).length;

  // readability: average sentence length
  const sentences = text.split(/[.!?]+\s/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length > 2);
  const avgSentenceWords = sentences.length ? Math.round(words / sentences.length) : 0;

  const kwCount = keyword ? countMatches(plain, keyword) : 0;
  const density = keyword && words ? Math.round((kwCount * keyword.split(" ").length / words) * 1000) / 10 : 0;

  const checks: SeoCheck[] = [];
  const add = (c: SeoCheck) => checks.push(c);

  // --- Title & meta
  const tl = seoTitle.length;
  add({
    id: "title-length", group: "Title & meta", label: "SEO title length", weight: 10,
    status: tl === 0 ? "fail" : tl >= 30 && tl <= 60 ? "pass" : "warn",
    message: tl === 0 ? "No title yet." : `${tl} characters. Ideal is 30 to 60.`,
    why: "Google cuts titles longer than about 60 characters with '...', and very short titles say little. The title is the first thing a searcher reads in the results.",
    fix: tl > 60 ? "Shorten it. Keep the main keyword near the start." : tl < 30 ? "Add the topic and the benefit, for example 'Website design for salons: 7 things that bring bookings'." : "Fine.",
  });

  const dl = desc.length;
  add({
    id: "desc-length", group: "Title & meta", label: "Meta description length", weight: 10,
    status: dl === 0 ? "fail" : dl >= 120 && dl <= 160 ? "pass" : "warn",
    message: dl === 0 ? "No meta description. Google will pick a random snippet from the page." : `${dl} characters. Ideal is 120 to 160.`,
    why: "The meta description is the grey text under your title in search. A good one raises click-through rate, which is a ranking signal in practice.",
    fix: dl === 0 ? "Write one sentence that promises the result and mentions the keyword." : dl < 120 ? "Add a clear benefit and a call to read on." : dl > 160 ? "Cut it to 160 characters so it is not truncated." : "Fine.",
  });

  add({
    id: "slug", group: "Title & meta", label: "URL slug", weight: 6,
    status: !slug ? "fail" : /^[a-z0-9-]+$/.test(slug) && slug.length <= 75 && !/--/.test(slug) ? "pass" : "warn",
    message: !slug ? "No slug." : `/blog/${slug}`,
    why: "Short, lowercase, hyphenated URLs are easier to read, share and understand. Long URLs with stop words dilute the keyword.",
    fix: !slug ? "Set a slug from the title." : /^[a-z0-9-]+$/.test(slug) && slug.length <= 75 ? "Use only lowercase letters, numbers and hyphens, no double hyphens." : "Rewrite it: lowercase letters, numbers and hyphens only, under 75 characters.",
  });

  add({
    id: "excerpt", group: "Title & meta", label: "Excerpt (blog index summary)", weight: 4,
    status: !excerpt ? "warn" : excerpt.length >= 50 && excerpt.length <= 160 ? "pass" : "warn",
    message: !excerpt ? "No excerpt. The blog list will show the start of the article instead." : `${excerpt.length} characters.`,
    why: "The excerpt is used on the blog index and as a fallback description. A clear one makes the index look finished and helps readers choose.",
    fix: !excerpt ? "Write 1 to 2 sentences summarising the post." : "Aim for 50 to 160 characters.",
  });

  // --- Keyword
  add({
    id: "keyword-set", group: "Keyword", label: "Focus keyword set", weight: 8,
    status: keyword ? "pass" : "fail",
    message: keyword ? `Focus keyword: "${keyword}"` : "No focus keyword. The score cannot check keyword use without one.",
    why: "One clear target phrase tells you and Google what the article is about. Without it, the title, intro and headings drift.",
    fix: "Enter the phrase a customer would type into Google, for example 'restaurant website design'.",
  });

  if (keyword) {
    add({
      id: "kw-title", group: "Keyword", label: "Keyword in SEO title", weight: 10,
      status: normalise(seoTitle).includes(keyword) ? "pass" : "fail",
      message: normalise(seoTitle).includes(keyword) ? "The keyword is in the title." : "The keyword is missing from the title.",
      why: "Title match is one of the strongest on-page signals. Google also bolds matching words in the results, which catches the eye.",
      fix: "Put the exact phrase in the title, ideally near the start.",
    });

    add({
      id: "kw-desc", group: "Keyword", label: "Keyword in meta description", weight: 6,
      status: normalise(desc).includes(keyword) ? "pass" : "warn",
      message: normalise(desc).includes(keyword) ? "The keyword is in the description." : "The keyword is missing from the description.",
      why: "Searchers' own words are highlighted in the snippet, which makes your result look like the answer.",
      fix: "Use the phrase once, naturally, in the description.",
    });

    add({
      id: "kw-intro", group: "Keyword", label: "Keyword in the first 100 words", weight: 8,
      status: first100.includes(keyword) ? "pass" : "fail",
      message: first100.includes(keyword) ? "The keyword appears early." : "The keyword does not appear in the opening 100 words.",
      why: "Search engines and readers judge the topic from the introduction. Late mentions look like filler.",
      fix: "Use the phrase in the first or second sentence of the intro.",
    });

    add({
      id: "kw-slug", group: "Keyword", label: "Keyword in the URL slug", weight: 4,
      status: slug.includes(keyword.replace(/\s+/g, "-")) ? "pass" : "warn",
      message: slug.includes(keyword.replace(/\s+/g, "-")) ? "The slug contains the keyword." : "The slug does not contain the keyword.",
      why: "The URL is a small but real relevance signal and is shown in results.",
      fix: "Make the slug the keyword with hyphens, for example 'restaurant-website-design'.",
    });

    add({
      id: "kw-density", group: "Keyword", label: "Keyword density", weight: 6,
      status: words < 100 ? "warn" : density >= 0.5 && density <= 2.5 ? "pass" : density > 2.5 ? "fail" : "warn",
      message: words < 100 ? "Not enough text to measure." : `${kwCount} uses in ${words} words (${density}%). Ideal is 0.5% to 2.5%.`,
      why: "Above about 2.5% reads as keyword stuffing, which search engines penalise. Below 0.5% the topic is weakly signalled.",
      fix: density > 2.5 ? "Replace some repeats with synonyms or 'this' and 'it'." : "Use the phrase in a few more natural places, especially headings.",
    });

    add({
      id: "kw-heading", group: "Keyword", label: "Keyword or close variant in a heading", weight: 4,
      status: h2Texts.some((t) => t.includes(keyword)) ? "pass" : "warn",
      message: h2Texts.some((t) => t.includes(keyword)) ? "A subheading uses the keyword." : "No subheading uses the keyword.",
      why: "Subheadings are scanned by readers and by search engines to understand the structure.",
      fix: "Add one H2 that uses the phrase or a close variant.",
    });
  }

  // --- Content
  add({
    id: "word-count", group: "Content", label: "Length", weight: 8,
    status: words >= 800 ? "pass" : words >= 400 ? "warn" : "fail",
    message: `${words} words, about ${Math.max(1, Math.round(words / 200))} min read.`,
    why: "Thin posts rarely rank for competitive topics. Under 400 words usually does not cover the question well enough.",
    fix: words < 400 ? "Answer the question fully: add examples, steps or a short FAQ." : words < 800 ? "Aim for 800+ words for a guide-style article." : "Fine.",
  });

  add({
    id: "sentences", group: "Content", label: "Readability (average sentence length)", weight: 6,
    status: avgSentenceWords === 0 ? "warn" : avgSentenceWords <= 20 ? "pass" : avgSentenceWords <= 25 ? "warn" : "fail",
    message: avgSentenceWords === 0 ? "No sentences yet." : `Average ${avgSentenceWords} words per sentence. Ideal is 20 or fewer.`,
    why: "Long sentences tire readers, and readers who leave early send negative engagement signals.",
    fix: "Split long sentences at 'and', 'but' and commas. Keep one idea per sentence.",
  });

  add({
    id: "tags", group: "Content", label: "Tags", weight: 3,
    status: tagCount >= 2 ? "pass" : "warn",
    message: `${tagCount} tag(s).`,
    why: "Tags group related posts and create useful topic pages for readers.",
    fix: "Add 2 to 5 tags, for example 'Web design, Restaurants, Pakistan'.",
  });

  // --- Structure
  add({
    id: "h1", group: "Structure", label: "Single H1", weight: 6,
    status: hasH1 ? "fail" : "pass",
    message: hasH1 ? "The content has an H1 heading. The post title is already the H1." : "Good: one H1 (the post title).",
    why: "Two H1s confuse the page's main topic. The title is already the H1, so body text should start at H2.",
    fix: hasH1 ? "Change the H1 in the body to H2." : "Fine.",
  });

  add({
    id: "h2", group: "Structure", label: "Section headings (H2)", weight: 6,
    status: words < 300 ? "warn" : h2 >= 3 ? "pass" : h2 >= 1 ? "warn" : "fail",
    message: `${h2} H2 heading(s), ${h3} H3.`,
    why: "Headings break the text into scannable parts. Google uses them to understand structure, and they lift time on page.",
    fix: "Add an H2 every 250 to 300 words, phrased as a question or clear topic.",
  });

  // --- Media and links
  add({
    id: "cover", group: "Media & links", label: "Cover image", weight: 5,
    status: input.coverImage ? "pass" : "fail",
    message: input.coverImage ? "Cover image set." : "No cover image.",
    why: "Posts with an image get more shares and clicks from the blog index and social cards.",
    fix: "Upload a relevant image, ideally 1200 x 630 px.",
  });

  add({
    id: "alt", group: "Media & links", label: "Image alt text", weight: 6,
    status: imgs.length === 0 ? "warn" : imagesMissingAlt === 0 ? "pass" : "fail",
    message: imgs.length === 0 ? "No images in the body." : `${imagesMissingAlt} of ${imgs.length} body image(s) have no alt text.`,
    why: "Alt text is how screen readers and image search understand a picture. Missing alt is also an accessibility failure.",
    fix: "Add a short, descriptive alt text to each image.",
  });

  add({
    id: "internal", group: "Media & links", label: "Internal links", weight: 5,
    status: internalLinks >= 2 ? "pass" : internalLinks === 1 ? "warn" : "fail",
    message: `${internalLinks} internal link(s).`,
    why: "Internal links spread authority across the site and help Google discover related pages.",
    fix: "Link to 2 to 3 related pages or posts, such as the pricing page or another article.",
  });

  add({
    id: "external", group: "Media & links", label: "External source links", weight: 3,
    status: externalLinks >= 1 ? "pass" : "warn",
    message: `${externalLinks} external link(s).`,
    why: "Citing a credible source builds trust for claims, statistics and definitions.",
    fix: "Link to a reputable source for any statistic or claim you make.",
  });

  const totalWeight = checks.reduce((a, c) => a + c.weight, 0);
  const earned = checks.reduce((a, c) => a + c.weight * (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0), 0);
  let score = Math.round((earned / totalWeight) * 100);
  // A thin post cannot be "good" no matter how well the meta is filled in
  if (words < 300) score = Math.min(score, 55);
  else if (words < 600) score = Math.min(score, 80);
  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Needs work" : "Poor";

  return {
    score,
    grade,
    checks,
    stats: {
      words,
      readingMinutes: Math.max(1, Math.round(words / 200)),
      headings: h2 + h3,
      images: imgs.length,
      imagesMissingAlt,
      internalLinks,
      externalLinks,
      keywordCount: kwCount,
      keywordDensity: density,
      avgSentenceWords,
    },
  };
}
