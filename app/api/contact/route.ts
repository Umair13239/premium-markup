import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";
import { prisma } from "@/lib/prisma";
import { sendLeadNotification } from "@/lib/email";

// Best-effort in-memory rate limit (per IP). Resets on cold start — fine for a
// single-instance app; swap for Upstash/Redis if you scale horizontally.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; start: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages just now — please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Honeypot filled → almost certainly a bot. Accept silently, store nothing.
  if (data.website) return NextResponse.json({ ok: true });

  // Fold the extra enquiry context into the stored message so it shows in the
  // admin without needing new columns.
  const context = [
    data.currentWebsite ? `Current site: ${data.currentWebsite}` : "",
    data.timeline ? `Timeline: ${data.timeline}` : "",
    data.referral ? `Heard via: ${data.referral}` : "",
  ].filter(Boolean);
  const message = context.length ? `${context.join("  ·  ")}\n\n${data.message}` : data.message;

  try {
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        company: data.company || null,
        email: data.email,
        phone: data.phone || null,
        website: data.currentWebsite || null,
        source: "website",
        status: "New",
        budget: data.budget,
        projectType: data.projectType,
        message,
        attachmentUrl: data.attachmentUrl || null,
        attachmentName: data.attachmentName || null,
        unread: true,
      },
    });

    // Fire the notification (no-op without a Resend key).
    await sendLeadNotification(lead);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact] failed to save lead:", e);
    return NextResponse.json(
      { error: "We couldn't save your message. Please email us directly." },
      { status: 500 }
    );
  }
}
