"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function login(
  _prev: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    // Which area to open after sign-in — whitelisted.
    const dest = String(formData.get("destination") || "/admin");
    const redirectTo = dest === "/portal/index.html" ? "/portal/index.html" : "/admin";
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "That email and password don't match. Please try again.";
    }
    // Re-throw the redirect (and anything else) so navigation works.
    throw error;
  }
}
