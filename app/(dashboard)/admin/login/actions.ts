"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function login(
  _prev: string | undefined,
  formData: FormData
): Promise<string | undefined> {
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
