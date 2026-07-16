import { NextRequest, NextResponse } from "next/server";
import * as d from "@/lib/portal/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ deleted: d.deleteNote(decodeURIComponent(id)) });
}
