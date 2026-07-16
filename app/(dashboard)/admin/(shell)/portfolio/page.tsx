import { getPortfolio } from "@/lib/portfolio";
import { PortfolioEditor } from "@/components/admin/portfolio-editor";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const { data, visible } = await getPortfolio();
  return <PortfolioEditor initial={data} initialVisible={visible} />;
}
