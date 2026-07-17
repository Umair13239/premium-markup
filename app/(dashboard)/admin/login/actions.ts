"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn } from "@/auth";

// Best-effort in-memory brute-force throttle (per IP). The login was previously
// unthrottled — the highest-value endpoint in the app. Resets on cold start;
// swap for Upstash/Redis if this ever scales horizontally.
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; start: number }>();

function tooManyAttempts(ip: string) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    attempts.set(ip, { count: 1, start: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export async function login(
  _prev: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (tooManyAttempts(ip)) {
    return "Too many sign-in attempts. Please wait a few minutes and try again.";
  }

  try {
    // Sign-in always lands on the admin dashboard. (The Leads Portal is a
    // separate always-on app reached via its own external link.)
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "That email and password don't match. Please try again.";
    }
    // Re-throw the redirect (and anything else) so navigation works.
    throw error;
  }
}
