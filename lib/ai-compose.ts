"use server";

import { aiGenerate, aiEnabled, aiStatus } from "@/lib/portal/ai";
import { siteConfig } from "@/site.config";

type LeadFacts = {
  name?: string | null;
  company?: string | null;
  email?: string | null;
  website?: string | null;
  budget?: string | null;
  projectType?: string | null;
  message?: string | null;
  niche?: string | null;
};

export async function aiComposeStatus() {
  return aiStatus(); // { enabled, provider, model }
}

// Strips the tells that make an email read as AI-written: em/en dashes (the
// giveaway Umair hates), markdown, and stray leading bullets. Code-level so it is
// guaranteed even when a cheap model ignores the prompt.
function deAiify(s: string): string {
  return String(s || "")
    .replace(/\s*[—–]\s*/g, ", ")     // em/en dash → comma (the #1 AI tell)
    .replace(/\s-\s/g, ", ")          // spaced hyphen used as a dash
    .replace(/[*_`#>]+/g, "")          // markdown emphasis / headings / quotes
    .replace(/^\s*[-•]\s+/gm, "")      // leading bullets
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type ColdBrief = {
  business?: string;
  niche?: string;
  contactName?: string;
  gap?: string;                 // what they're missing (e.g. "no website")
  brief?: string;               // free-text description of the business
  mode?: "cold" | "follow-up";
};

/**
 * The AI cold-email writer. You describe a business (often one with NO website)
 * and it returns 3 punchy subject options + a 4-line-max body that follows a
 * proven cold-outreach formula: specific observation → the cost of the gap →
 * the concrete fix → one soft question. Attention-first, never salesy.
 */
export async function aiComposeColdEmail(input: ColdBrief) {
  if (!aiEnabled()) return { error: "AI is not configured. Add a key in config.json or env." };

  const me = siteConfig.founder?.name || "Umair";
  const company = siteConfig.name || "Premium Markup";
  const followUp = input.mode === "follow-up";

  const sys =
    `You are ${me}, founder of ${company}, a UK web design and development agency. ` +
    `Write a COLD outreach email to a business you have never spoken to. ` +
    (followUp
      ? "This is a short SECOND-touch follow-up to a cold email they didn't reply to. Assume no reply yet; be light and low-pressure, not annoyed. "
      : "This is the FIRST email. The only goal is to earn a reply, not to sell. ") +
    "Follow this exact structure, one sentence per line, 4 LINES MAXIMUM for the body:\n" +
    "Line 1: a specific, genuine observation about THIS business (their trade, their reviews, or that they have no website). Never generic.\n" +
    "Line 2: name the real cost of the gap in plain words (e.g. people search, find nothing, and go to a competitor).\n" +
    "Line 3: the concrete fix and the outcome, honest and specific, no hype.\n" +
    "Line 4: one soft, easy question as the call to action (never 'book a call now').\n\n" +
    "HARD RULES:\n" +
    "- Total body under 65 words. Short, tight, human. Write like a real person texting, not a brochure.\n" +
    "- NOT salesy. Do not praise yourself. No 'we are the best', no case studies, no pricing, no promises you can't keep.\n" +
    "- BANNED words: seamless, cutting-edge, leverage, elevate, unlock, boost, supercharge, robust, synergy, tailored solutions, in today's world, I hope this email finds you.\n" +
    "- NEVER use a dash of any kind (no -, no em dash, no en dash). Use commas or full stops.\n" +
    "- UK English. Address them by first name only if a real one is given, otherwise no name.\n" +
    "- Sign off simply as " + me + ".\n" +
    "Also write 3 SUBJECT LINES: each 2 to 5 words, lower-key and curiosity-driven, feels personal not mass-sent. No clickbait, no ALL CAPS, no emojis, no 'Re:'.\n" +
    'Return ONLY compact JSON: {"subjects":["..","..",".."],"body":".."}';

  const facts = {
    business: input.business || "",
    industry: input.niche || "",
    contactFirstName: input.contactName || "",
    whatTheyAreMissing: input.gap || "",
    description: input.brief || "",
  };
  const usr =
    "BUSINESS TO EMAIL:\n" + JSON.stringify(facts, null, 2) +
    "\n\nWrite the subjects and the 4-line email now as JSON.";

  try {
    const txt = await aiGenerate(sys, usr, 500);
    let parsed: any = {};
    try { parsed = JSON.parse(String(txt).replace(/^```json\s*|\s*```$/g, "").trim()); }
    catch { parsed = { subjects: [], body: txt }; }
    const subjects: string[] = (Array.isArray(parsed.subjects) ? parsed.subjects : [])
      .map((s: any) => deAiify(String(s || "")).replace(/^["']|["']$/g, "").trim())
      .filter(Boolean)
      .slice(0, 3);
    const body = deAiify(parsed.body || txt || "");
    if (!body) return { error: "The model returned nothing usable. Try again." };
    return { subjects, body };
  } catch (e) {
    return { error: String((e as any)?.message || e) };
  }
}

/**
 * Writes the best email REPLY to a website enquiry using the configured AI
 * (DeepSeek via OpenRouter, from config.json). Tailors to the lead's data and
 * what they said they need. Returns { subject, body } or { error }.
 */
export async function aiComposeReply(lead: LeadFacts, mode: "reply" | "cold" = "reply") {
  if (!aiEnabled()) return { error: "AI is not configured. Add a key to config.json." };

  const sys =
    `You are ${siteConfig.founder.name}, founder of ${siteConfig.name}, a UK web development and social media agency. ` +
    (mode === "reply"
      ? "A potential client has submitted an enquiry through the website. Write a warm, specific, genuinely helpful EMAIL REPLY that speaks to exactly what they asked for. "
      : "Write a short, warm cold outreach email to this business. ") +
    "Rules: reference what THEY actually said or need; be concrete and honest; NO buzzwords or fluff (no 'seamless', 'cutting-edge', 'leverage'); UK English; 5-9 short lines; sign off as " +
    `${siteConfig.founder.name} from ${siteConfig.name}; end with a clear, low-pressure next step (a quick call this week). ` +
    'Do NOT invent prices, timelines, or facts. Return ONLY compact JSON: {"subject":"...","body":"..."}';

  const facts = {
    name: lead.name || "",
    company: lead.company || "",
    website: lead.website || "",
    niche: lead.niche || "",
    budget: lead.budget || "",
    projectType: lead.projectType || "",
    theirMessage: lead.message || "",
  };
  const usr = "ENQUIRY DATA:\n" + JSON.stringify(facts, null, 2) + "\n\nWrite the email now as JSON.";

  try {
    const txt = await aiGenerate(sys, usr, 600);
    let parsed: any = {};
    try { parsed = JSON.parse(String(txt).replace(/^```json\s*|\s*```$/g, "").trim()); }
    catch { parsed = { subject: "", body: txt }; }
    return { subject: (parsed.subject || "").trim(), body: (parsed.body || txt || "").trim() };
  } catch (e) {
    return { error: String((e as any)?.message || e) };
  }
}
