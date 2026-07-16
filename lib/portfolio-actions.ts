"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { PortfolioData } from "@/lib/portfolio";

// Persists the whole portfolio. The editor sends the complete object each save;
// we validate it's shaped right, then store it as JSON. /cv reads it live via
// /api/portfolio, so no rebuild is needed.
export async function savePortfolio(data: PortfolioData, visible: boolean) {
  if (!data || !Array.isArray(data.projects) || !Array.isArray(data.categories)) {
    return { ok: false, error: "Malformed portfolio data." };
  }
  await prisma.portfolio.upsert({
    where: { id: "portfolio" },
    update: { data: JSON.stringify(data), visible },
    create: { id: "portfolio", data: JSON.stringify(data), visible },
  });
  revalidatePath("/cv");
  revalidatePath("/admin/portfolio");
  return { ok: true };
}
