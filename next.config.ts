import type { NextConfig } from "next";
import path from "node:path";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow markdown / MDX files to act as pages (used by the blog).
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Bundle the SQLite database into the serverless functions so Prisma can read
  // it on Vercel (its read-only FS otherwise can't find the file).
  outputFileTracingIncludes: {
    "/**": ["./prisma/dev.db"],
  },
  // Keep heavy native/portal deps out of the server bundle (loaded at runtime).
  serverExternalPackages: ["playwright", "playwright-core", "whatsapp-web.js"],
  // Pin the workspace root to this project (a stray lockfile in the home dir
  // otherwise confuses Turbopack's root inference).
  turbopack: {
    root: path.join(__dirname),
  },
  // /cv is the standalone portfolio — a complete static document with its own
  // Lenis/GSAP stack, so it is served straight from public/ rather than mounted
  // in the root layout (which runs its own Lenis + cursor and would fight it).
  async rewrites() {
    return [
      { source: "/cv", destination: "/cv/index.html" },
      // The portfolio's project data is served from the DB so admin edits show
      // up on /cv without a rebuild. (The static public/cv/projects-data.js was
      // removed; without it this afterFiles rewrite takes effect.)
      { source: "/cv/projects-data.js", destination: "/api/portfolio" },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
