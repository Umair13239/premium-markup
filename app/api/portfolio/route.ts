import { getPortfolio } from "@/lib/portfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Emits the portfolio data as the JS the static /portfolio page expects. The page's
// <script src="/portfolio/projects-data.js"> is rewritten here (see next.config.ts),
// so editing the portfolio in admin updates /portfolio with no rebuild.
export async function GET() {
  const { data } = await getPortfolio();
  const body = `window.PORTFOLIO_DATA = ${JSON.stringify(data)};`;
  return new Response(body, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
