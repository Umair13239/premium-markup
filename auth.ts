import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

// In production a real AUTH_SECRET is mandatory — without it (or with the
// example placeholder) session JWTs are forgeable. Checked at sign-in (runtime)
// rather than module scope, so it can't break the build. Dev is left alone.
function assertAuthSecret() {
  if (process.env.NODE_ENV !== "production") return;
  const secret = process.env.AUTH_SECRET || "";
  if (!secret || secret.length < 24 || secret.includes("replace-with")) {
    throw new Error(
      "AUTH_SECRET is missing or is still the placeholder. Set a long random value in your environment (e.g. Vercel → Settings → Environment Variables)."
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        assertAuthSecret();
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
