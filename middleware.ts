import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Edge middleware — gates /admin using the edge-safe config.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
