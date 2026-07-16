import { prisma } from "@/lib/prisma";
import type { PortfolioData } from "@/lib/portfolio-types";

// Re-export the client-safe types/constants so existing server-side imports
// (`from "@/lib/portfolio"`) keep working. Client components should import from
// "@/lib/portfolio-types" directly to avoid pulling in prisma/node:* code.
export * from "@/lib/portfolio-types";

const EMPTY: PortfolioData = { categories: [], projects: [] };

export async function getPortfolio(): Promise<{ data: PortfolioData; visible: boolean }> {
  const row = await prisma.portfolio.findUnique({ where: { id: "portfolio" } });
  if (!row) return { data: EMPTY, visible: true };
  let data: PortfolioData;
  try {
    data = JSON.parse(row.data);
  } catch {
    data = EMPTY;
  }
  return { data, visible: row.visible };
}
