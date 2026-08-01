import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLeadNotification } from "@/lib/email";
import { notifyWhatsApp } from "@/lib/notify-whatsapp";
import { notifyTelegram } from "@/lib/notify-telegram";

// Share of the contact route's simple per-IP guard.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, { count: number; start: number }>();
function limited(ip: string) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) { hits.set(ip, { count: 1, start: now }); return false; }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

type Body = { name?: string; email?: string; phone?: string; message?: string; wantsHuman?: boolean; transcript?: string };

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many just now — try again in a minute." }, { status: 429 });

  let b: Body;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const name = String(b.name || "").trim().slice(0, 120);
  const email = String(b.email || "").trim().slice(0, 160);
  const phone = String(b.phone || "").trim().slice(0, 40);
  const note = String(b.message || "").trim().slice(0, 1200);
  const wantsHuman = !!b.wantsHuman;

  // Need at least one way to reach them.
  if (!email && !phone) {
    return NextResponse.json({ error: "Please leave an email or WhatsApp number so we can reply." }, { status: 400 });
  }

  const message =
    (wantsHuman ? "[Live chat: wants a human]\n" : "[Website chatbot]\n") +
    (note || "(no message)") +
    (b.transcript ? "\n\n--- conversation ---\n" + String(b.transcript).slice(0, 2000) : "");

  try {
    const lead = await prisma.lead.create({
      data: {
        name: name || "Website chat",
        email: email || null,
        phone: phone || null,
        source: "website",
        status: "New",
        message,
        tags: wantsHuman ? "chatbot,live-chat" : "chatbot",
        unread: true,
      },
    });

    // Email alert (no-op without a Resend key).
    try { await sendLeadNotification(lead); } catch {}

    // Live-human request → ping you instantly (Telegram and/or WhatsApp,
    // whichever is configured via env).
    let pinged = false;
    if (wantsHuman) {
      const alert =
        "🔔 Live chat request on premiummarkup.com\n" +
        "Name: " + (name || "-") + "\n" +
        "Email: " + (email || "-") + "\n" +
        "WhatsApp/Phone: " + (phone || "-") + "\n" +
        "Message: " + (note || "(none)");
      const [tg, wa] = await Promise.all([notifyTelegram(alert), notifyWhatsApp(alert)]);
      pinged = tg || wa;
    }

    return NextResponse.json({ ok: true, wantsHuman, pinged });
  } catch (e) {
    console.error("[chat/lead] failed:", e);
    return NextResponse.json({ error: "Couldn't save that. Please try the contact page." }, { status: 500 });
  }
}
