import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

// On Vercel the filesystem is read-only except /tmp, and SQLite needs a
// writable location even to open for reads. So on Vercel we copy the bundled
// database into /tmp on cold start and point Prisma there. (Writes there are
// ephemeral — content is edited locally and redeployed. See DEPLOY-VERCEL.md.)
function resolveDbUrl(): string | undefined {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  if (process.env.VERCEL && url.startsWith("file:")) {
    const src = path.join(process.cwd(), "prisma", "dev.db");
    const tmp = "/tmp/pm.db";
    try {
      if (fs.existsSync(src) && !fs.existsSync(tmp)) fs.copyFileSync(src, tmp);
      return `file:${tmp}`;
    } catch {
      /* fall back to DATABASE_URL as-is */
    }
  }
  return undefined;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const dbUrl = resolveDbUrl();
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(dbUrl ? { datasourceUrl: dbUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
