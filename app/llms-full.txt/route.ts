import { siteConfig } from "@/site.config";
import { products } from "@/lib/products";

// The full text for an AI assistant: every product with its features, steps, audience and FAQ, exactly as
// the product pages say them. Generated from lib/products.ts, the same source as the pages.
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const base = siteConfig.url.replace(/\/$/, "");
  const out: string[] = [`# ${siteConfig.name}: full product information`, "", siteConfig.description, ""];
  for (const p of products) {
    out.push(`## ${p.name}`, `URL: ${base}/products/${p.slug}`, "", p.lede, "", "### Features");
    out.push(...p.features.map((f) => `- ${f.title}: ${f.text}`), "", "### How it works");
    out.push(...p.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`), "", "### Who it is for");
    out.push(...p.forWho.map((w) => `- ${w}`), "");
    if (p.pricing) out.push("### Pricing", "Free: " + p.pricing.free.join("; "), "Paid: " + p.pricing.paid.join("; "), "");
    out.push("### Questions", ...p.faqs.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`, ""]));
  }
  out.push("## Contact", `Email: ${siteConfig.email.primary}`, `Phone or WhatsApp: ${siteConfig.phone.display}`, `Website: ${base}`);
  return new Response(out.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
