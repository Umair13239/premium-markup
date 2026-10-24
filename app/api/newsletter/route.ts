import { NextRequest, NextResponse } from "next/server";

// Newsletter sign-up from the website footer. The subscriber list lives in the Leads Portal (with the
// one-click unsubscribe link), so this route only checks the email and passes it on.
const PORTAL = "https://leads.premiummarkup.com/api/public/newsletter";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 160) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  try {
    const r = await fetch(PORTAL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(12000),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: j.error || "Could not subscribe right now. Try again." }, { status: r.status });
    }
    return NextResponse.json({ ok: true, message: j.message || "Thanks! You are on the list." });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not subscribe right now. Try again." }, { status: 502 });
  }
}
