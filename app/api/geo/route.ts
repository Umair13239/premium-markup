import { NextResponse } from "next/server";

// Visitor's country from the edge (Vercel sets this header). Drives regional pricing on /pricing.
export function GET(req: Request) {
  const country = (req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "").slice(0, 2).toUpperCase();
  return NextResponse.json({ country }, { headers: { "Cache-Control": "no-store" } });
}
