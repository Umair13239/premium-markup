import { Resend } from "resend";
import nodemailer from "nodemailer";

type LeadLike = {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  budget?: string | null;
  projectType?: string | null;
  message?: string | null;
};

function textBody(lead: LeadLike) {
  return [
    "New enquiry from the website.",
    "",
    `Name:     ${lead.name}`,
    `Company:  ${lead.company || "—"}`,
    `Email:    ${lead.email || "—"}`,
    `Phone:    ${lead.phone || "—"}`,
    `Budget:   ${lead.budget || "—"}`,
    `Type:     ${lead.projectType || "—"}`,
    "",
    "Message:",
    lead.message || "—",
  ].join("\n");
}

/**
 * Notify on a new website enquiry through whatever free channel is configured.
 * All channels are optional — the lead is always saved to the DB regardless, and
 * shows as "unread" in the admin. Set ANY of these in .env to get pushed alerts:
 *
 *  1. Resend (free tier, 100/day):  RESEND_API_KEY  (+ RESEND_FROM, LEAD_NOTIFICATION_EMAIL)
 *  2. SMTP (Gmail app password etc): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (+ LEAD_NOTIFICATION_EMAIL)
 *  3. Discord webhook:              DISCORD_WEBHOOK_URL
 *  4. Telegram bot:                 TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */
export async function sendLeadNotification(lead: LeadLike) {
  const to = process.env.LEAD_NOTIFICATION_EMAIL || "projects@premiummarkup.com";
  const from = process.env.RESEND_FROM || "PremiumMarkup <onboarding@resend.dev>";
  const subject = `New enquiry — ${lead.name}`;
  const body = textBody(lead);
  const fired: string[] = [];

  // 1. Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({ from, to, replyTo: lead.email || undefined, subject, text: body });
      fired.push("resend");
    } catch (e) { console.error("[email] resend failed:", e); }
  }

  // 2. SMTP (nodemailer) — works with any free SMTP incl. Gmail app passwords
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, replyTo: lead.email || undefined, subject, text: body });
      fired.push("smtp");
    } catch (e) { console.error("[email] smtp failed:", e); }
  }

  // 3. Discord webhook (free, instant)
  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: `**${subject}**\n\`\`\`\n${body}\n\`\`\`` }),
      });
      fired.push("discord");
    } catch (e) { console.error("[email] discord failed:", e); }
  }

  // 4. Telegram bot (free, instant)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `${subject}\n\n${body}` }),
      });
      fired.push("telegram");
    } catch (e) { console.error("[email] telegram failed:", e); }
  }

  if (!fired.length) {
    console.log(`[notify] new lead "${lead.name}" saved — no alert channel configured (it's in the admin, unread).`);
    return { skipped: true as const };
  }
  return { sent: fired };
}
