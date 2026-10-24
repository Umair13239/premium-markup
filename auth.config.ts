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
    // role must be copied here (not only in auth.ts) because middleware runs this edge-safe config alone
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role || "admin";
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = (token.role as string) || "admin";
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      // Public API surface (contact form + auth + the portfolio data feed for
      // /cv) stays open; the portal APIs are gated.
      if (pathname.startsWith("/api/")) {
        if (
          pathname.startsWith("/api/contact") ||
          pathname.startsWith("/api/chat") ||
          pathname.startsWith("/api/newsletter") ||
          pathname.startsWith("/api/geo") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/portfolio")
        )
          return true;
        return isLoggedIn;
      }

      // Blog-only accounts now write posts in the Leads Portal (Blog & SEO tab), not in this admin
      const role = (auth?.user as { role?: string } | undefined)?.role;
      if (isLoggedIn && role === "blog" && pathname.startsWith("/admin") && pathname !== "/admin/login") {
        return Response.redirect("https://leads.premiummarkup.com/login.html");
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
