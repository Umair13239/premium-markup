import { NextResponse } from "next/server";
import { count } from "@/lib/portal/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, count: count() });
}
