import { NextRequest, NextResponse } from "next/server";
import { aiGenerate, aiEnabled } from "@/lib/portal/ai";
import { chatSystemPrompt, chatTranscript, type ChatMessage } from "@/lib/chatbot";

// Best-effort in-memory rate limit per IP (mirrors app/api/contact).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
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

// Strip the AI tells (dashes, markdown) so the concierge reads human.
function clean(s: string): string {
  return String(s || "")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/[*_`#>]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "One moment — please slow down a little." }, { status: 429 });
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !String(last.content || "").trim()) {
    return NextResponse.json({ error: "Say something first." }, { status: 400 });
  }

  if (!aiEnabled()) {
    return NextResponse.json({
      reply:
        "Thanks for the message. Our assistant is briefly offline, but leave your name and email or WhatsApp number and Umair will get straight back to you.",
    });
  }

  try {
    const reply = await aiGenerate(chatSystemPrompt(), chatTranscript(messages), 350);
    return NextResponse.json({ reply: clean(reply) || "Could you say that another way?" });
  } catch (e) {
    console.error("[chat] ai error:", e);
    return NextResponse.json({
      reply:
        "Sorry, I hit a snag. Drop your name and email or WhatsApp number here and Umair will reply personally.",
    });
  }
}
