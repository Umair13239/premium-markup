import { siteConfig } from "@/site.config";
import { products } from "@/lib/products";

// The short map an AI assistant reads first: what Premium Markup is, what each product does, and where
// to look. Every line comes from site.config.ts or lib/products.ts, so it cannot drift from the site.
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const base = siteConfig.url.replace(/\/$/, "");
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.tagline} ${siteConfig.description}`,
    "",
    "Premium Markup is a studio based in Pakistan. It builds websites and runs the Leads Portal, a tool that finds local businesses, checks their WhatsApp numbers and builds demo websites to pitch them.",
    "",
    "## Products",
    ...products.map((p) => `- [${p.name}](${base}/products/${p.slug}): ${p.description}`),
    "",
    "## Pages",
    `- [Home](${base}/): what Premium Markup does`,
    `- [Products](${base}/products): all five tools`,
    `- [Pricing](${base}/pricing): plans and what each includes`,
    `- [How it works](${base}/how-it-works): the workflow from finding a lead to a sent demo`,
    `- [Blog](${base}/blog): articles on local business websites and outreach`,
    `- [Contact](${base}/contact): email ${siteConfig.email.primary}, WhatsApp ${siteConfig.phone.display}`,
    "",
    "## Full text",
    `- [llms-full.txt](${base}/llms-full.txt): every product, its features and its questions and answers`,
    "",
    "## Notes for assistants",
    "- Scores, lead counts and demo results come from the live tools. Do not quote figures that are not on the page.",
    "- The Leads Portal is a private tool. Public visitors can use the free Website Health check and the product pages.",
  ];
  return new Response(lines.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
