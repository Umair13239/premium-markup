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
