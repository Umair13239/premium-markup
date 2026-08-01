import { prisma } from "@/lib/prisma";
import { sendLeadNotification } from "@/lib/email";
import { notifyTelegram } from "@/lib/notify-telegram";
import { notifyWhatsApp } from "@/lib/notify-whatsapp";

export const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
export const PHONE_RE = /\+?\d[\d\s().\-]{7,}\d/;

/** Shared lead-capture used by both the "Talk to a human" form and the bot's
 *  automatic detection. Saves to /admin and pings you (Telegram + WhatsApp). */
export async function captureChatLead(opts: {
  name?: string; email?: string; phone?: string;
  message?: string; wantsHuman?: boolean; transcript?: string;
}) {
  const name = (opts.name || "").trim().slice(0, 120);
  const email = (opts.email || "").trim().slice(0, 160);
  const phone = (opts.phone || "").trim().slice(0, 40);
  const note = (opts.message || "").trim().slice(0, 1200);
  const wantsHuman = !!opts.wantsHuman;
  if (!email && !phone) return { ok: false, error: "no contact" };

  // Don't create a second lead for a contact we already captured this run.
  const existing = email
    ? await prisma.lead.findFirst({ where: { email, source: "website" }, select: { id: true } })
    : null;

  const message =
    (wantsHuman ? "[Live chat: wants a human]\n" : "[Website chatbot]\n") +
    (note || "(no message)") +
    (opts.transcript ? "\n\n--- conversation ---\n" + opts.transcript.slice(0, 2000) : "");

  const lead = existing
    ? await prisma.lead.update({ where: { id: existing.id }, data: { message, phone: phone || undefined, unread: true } })
    : await prisma.lead.create({
        data: {
          name: name || "Website chat", email: email || null, phone: phone || null,
          source: "website", status: "New", message,
          tags: wantsHuman ? "chatbot,live-chat" : "chatbot,auto-capture", unread: true,
        },
      });

  try { await sendLeadNotification(lead); } catch {}
  const alert =
    (wantsHuman ? "🔔 Live chat request" : "🔔 New lead from website chat") +
    "\nName: " + (name || "-") + "\nEmail: " + (email || "-") +
    "\nPhone: " + (phone || "-") + "\nMessage: " + (note || "(none)");
  const [tg, wa] = await Promise.all([notifyTelegram(alert), notifyWhatsApp(alert)]);
  return { ok: true, id: lead.id, pinged: tg || wa };
}
