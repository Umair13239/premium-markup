"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ChangePasswordState = { ok?: string; error?: string } | undefined;

const MIN_LENGTH = 10;

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  // Defence in depth: this action verifies the session itself rather than
  // trusting the middleware matcher alone.
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { error: "You're signed out — please sign in again." };

  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!current || !next || !confirm) return { error: "Please fill in every field." };
  if (next.length < MIN_LENGTH) return { error: `New password must be at least ${MIN_LENGTH} characters.` };
  if (next !== confirm) return { error: "The new passwords don't match." };
  if (next === current) return { error: "The new password must be different from the current one." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Account not found." };

  const ok = await bcrypt.compare(current, user.passwordHash);
  if (!ok) return { error: "Your current password isn't right." };

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });

  return { ok: "Password changed. Use it next time you sign in." };
}
