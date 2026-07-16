// Provider-agnostic AI for the portal (pitch writing + enrichment).
// Reads config.json (provider / apiKey / model / baseUrl). Ported from the
// standalone Leads Manager. Supports gemini, openrouter/groq/openai (OpenAI-
// compatible), ollama, anthropic.
import fs from "node:fs";
import path from "node:path";

type Defaults = { base: string; model: string; keyRequired: boolean; oai?: boolean };
const PROVIDER_DEFAULTS: Record<string, Defaults> = {
  gemini: { base: "https://generativelanguage.googleapis.com", model: "gemini-2.5-flash-lite", keyRequired: true },
  groq: { base: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", keyRequired: true, oai: true },
  openrouter: { base: "https://openrouter.ai/api/v1", model: "deepseek/deepseek-chat", keyRequired: true, oai: true },
  ollama: { base: "http://localhost:11434/v1", model: "llama3.2", keyRequired: false, oai: true },
  openai: { base: "https://api.openai.com/v1", model: "gpt-4o-mini", keyRequired: true, oai: true },
  anthropic: { base: "https://api.anthropic.com", model: "claude-haiku-4-5", keyRequired: true },
};

function cfg() {
  let provider = (process.env.AI_PROVIDER || "").toLowerCase();
  let key = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY || "";
  let model = process.env.AI_MODEL || "";
  let base = process.env.AI_BASE_URL || "";
  try {
    const c = JSON.parse(fs.readFileSync(path.join(process.cwd(), "config.json"), "utf8"));
    if (c.provider) provider = String(c.provider).toLowerCase();
    if (!key) key = c.apiKey || c.anthropicApiKey || "";
    if (c.model) model = c.model;
    if (c.baseUrl) base = c.baseUrl;
  } catch { /* no config */ }
  if (!provider) provider = key ? "anthropic" : (base ? "ollama" : "");
  const def = PROVIDER_DEFAULTS[provider] || ({} as Defaults);
  if (!model) model = def.model || "";
  if (!base) base = def.base || "";
  return { provider, key, model, base, def };
}

export function aiStatus() {
  const { provider, key, model, def } = cfg();
  const enabled = !!provider && !!PROVIDER_DEFAULTS[provider] && (def.keyRequired ? !!key : true);
  return { enabled, provider: provider || "", model: model || "" };
}
export const aiEnabled = () => aiStatus().enabled;

async function callOnce(system: string, userText: string, maxTokens = 400): Promise<string> {
  const { provider, key, model, base, def } = cfg();
  if (!(!!provider && (def.keyRequired ? !!key : true))) throw new Error("no_api_key");

  if (provider === "anthropic") {
    const r = await fetch(base + "/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: userText }] }),
    });
    const j: any = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || "HTTP " + r.status);
    return (j.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("").trim();
  }
  if (provider === "gemini") {
    const url = base + "/v1beta/models/" + encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(key);
    const r = await fetch(url, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: userText }] }], generationConfig: { maxOutputTokens: maxTokens, thinkingConfig: { thinkingBudget: 0 } } }),
    });
    const j: any = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || "HTTP " + r.status);
    const c = (j.candidates || [])[0];
    return ((c && c.content && c.content.parts) || []).map((p: any) => p.text || "").join("").trim();
  }
  // OpenAI-compatible (openrouter / deepseek / groq / ollama / openai)
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (key) headers["authorization"] = "Bearer " + key;
  if (provider === "openrouter") { headers["HTTP-Referer"] = "http://localhost:3001"; headers["X-Title"] = "PremiumMarkup Leads"; }
  const r = await fetch(base.replace(/\/$/, "") + "/chat/completions", {
    method: "POST", headers,
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "system", content: system }, { role: "user", content: userText }] }),
  });
  const j: any = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || j?.error || "HTTP " + r.status);
  return (j.choices?.[0]?.message?.content || "").trim();
}

export async function aiGenerate(system: string, userText: string, maxTokens = 400): Promise<string> {
  let lastErr: unknown;
  for (let n = 0; n < 3; n++) {
    try { return await callOnce(system, userText, maxTokens); }
    catch (e) {
      lastErr = e;
      const msg = String((e as any)?.message || e);
      const retryable = /HTTP 429|HTTP 500|HTTP 503|demand|overload|unavailable|temporarily|try again|rate.?limit|resource_exhausted|timeout|ECONNRESET|ETIMEDOUT/i.test(msg);
      if (n < 2 && retryable) { await new Promise((r) => setTimeout(r, 1200 * (n + 1))); continue; }
      throw e;
    }
  }
  throw lastErr;
}

export function buildPitchPrompt(lead: any, s: any = {}) {
  const facts: string[] = [];
  facts.push("Business name: " + (lead.name || ""));
  facts.push("Category: " + (lead.main_category || lead.group || ""));
  if (lead.city || lead.state_name) facts.push("Location: " + [lead.city, lead.state_name].filter(Boolean).join(", "));
  if (lead.rating != null) facts.push("Google rating: " + lead.rating + " from " + (lead.reviews || 0) + " reviews");
  facts.push("Has a website: " + (lead.website ? "yes (" + lead.website + ")" : "NO"));
  if (lead.owner) facts.push("Owner/contact: " + lead.owner);
  const sys =
    "You write short, friendly WhatsApp outreach messages for a salesperson approaching a local business as a cold lead. " +
    "Rules: 4-6 short lines, warm and human, NOT salesy or robotic. Plain text only (no markdown). " +
    "Open with a specific, genuine observation about THIS business (rating, reviews, missing website, or category). " +
    'Greet the owner by first name only if a real personal name is given; otherwise use "Hi there". ' +
    "End with the exact call to action provided. Do not invent facts. Return ONLY the message text.";
  const usr =
    "Here is the lead:\n" + facts.join("\n") +
    "\n\nAbout me (the sender):\nName: " + (s.yourName || "(not given)") +
    "\nCompany: " + (s.company || "(not given)") +
    "\nWhat I offer: " + (s.offer || "help local businesses get more clients online") +
    "\nCall to action: " + (s.cta || "Would you be open to a quick chat this week?") +
    "\n\nWrite the WhatsApp message now.";
  return { sys, usr };
}

export async function enrichLead(row: any) {
  const sys = "You are a B2B sales research assistant. Return ONLY compact JSON with keys \"summary\",\"pitch\",\"decision_maker\",\"tags\" (tags = array of 3-5 short strings). summary: one specific sentence on what they do. pitch: one warm personalized cold-email opener. decision_maker: likely role to contact; do not invent names.";
  const facts = { name: row.name, category: row.main_category, address: row.address, phone: row.phone, website: row.website, rating: row.rating, reviews: row.reviews, email: row.email };
  const usr = "BUSINESS:\n" + JSON.stringify(facts) + "\n\nWEBSITE TEXT (may be empty):\n" + ((row._siteSnippet || "").slice(0, 1200)) + "\n\nReturn the JSON now.";
  const txt = await aiGenerate(sys, usr, 400);
  let p: any = {};
  try { p = JSON.parse(String(txt).replace(/^```json\s*|\s*```$/g, "")); } catch { /* */ }
  const tags = Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || "");
  return { ai_summary: p.summary || "", ai_pitch: p.pitch || "", ai_decision_maker: p.decision_maker || "", ai_tags: tags };
}
