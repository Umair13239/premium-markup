import { NextResponse } from "next/server";
import { recentActivity } from "@/lib/portal/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ activity: recentActivity(40) });
}
