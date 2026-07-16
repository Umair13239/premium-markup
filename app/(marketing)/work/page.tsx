import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { PortfolioExplorer } from "@/components/site/portfolio-explorer";
import { getPortfolio } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Work — websites, branding & design by Premium Markup",
  description:
    "Selected client work by Premium Markup — websites, brand identities, social campaigns, training design and more. Filter by category and open any project to explore the live site, posts, logos and certificates.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const { data } = await getPortfolio();
  return (
    <>
      <PageHeader
        label="selected work"
        title="Work that earned its keep."
        intro="Websites, brand systems, social campaigns and training design — built for businesses across the UK, US and beyond. Filter by category, then open any project to explore the live site and the work itself."
      />
      <PortfolioExplorer data={data} />
    </>
  );
}
