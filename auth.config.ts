import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma/bcrypt imports) — used by middleware to gate
// routes. The full config with the Credentials provider lives in auth.ts.
export const authConfig = {
  // Required for self-hosted / non-Vercel deploys and localhost `next start`.
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      // Public API surface (contact form + auth + the portfolio data feed for
      // /cv) stays open; the portal APIs are gated.
      if (pathname.startsWith("/api/")) {
        if (
          pathname.startsWith("/api/contact") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/portfolio")
        )
          return true;
        return isLoggedIn;
      }

      if (pathname === "/admin/login") {
        if (isLoggedIn) return Response.redirect(new URL("/admin", request.nextUrl));
        return true;
      }

      // Admin dashboard + the embedded leads portal both require login.
      if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) return isLoggedIn;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
