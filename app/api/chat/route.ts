import { NextRequest, NextResponse } from "next/server";
import { aiGenerate, aiEnabled } from "@/lib/portal/ai";
import { chatSystemPrompt, chatTranscript, type ChatMessage } from "@/lib/chatbot";
import { captureChatLead, EMAIL_RE, PHONE_RE } from "@/lib/capture-lead";

// Pull a first name if the visitor (or the bot) mentioned one.
function guessName(messages: ChatMessage[]): string {
  for (const m of messages) {
    const mm = m.content.match(/\b(?:i['’]?m|i am|my name is|name is|this is)\s+([A-Z][a-z]{1,20})/i);
    if (mm) return mm[1][0].toUpperCase() + mm[1].slice(1);
  }
  for (const m of messages) {
    if (m.role === "assistant") {
      const am = m.content.match(/\b(?:Thanks|Hi|Hello|Hey),?\s+([A-Z][a-z]{1,20})/);
      if (am) return am[1];
    }
  }
  return "";
}

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

  // Auto-capture: if the visitor just typed an email or phone, save the lead
  // and ping you — no "Talk to a human" button needed.
  const email = (last.content.match(EMAIL_RE) || [])[0] || "";
  const phoneM = last.content.match(PHONE_RE);
  const phone = phoneM ? phoneM[0].replace(/[^\d+]/g, "") : "";
  const phoneOk = phone.replace(/\D/g, "").length >= 8;
  if (email || phoneOk) {
    const transcript = messages.map((m) => (m.role === "user" ? "Visitor" : "PM") + ": " + m.content).join("\n");
    try {
      await captureChatLead({ name: guessName(messages), email, phone: phoneOk ? phone : "", message: last.content, transcript });
    } catch (e) { console.error("[chat] capture failed:", e); }
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
