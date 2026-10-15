import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
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

// Opt-in: with CMS_DB=turso the CMS (posts, users, projects...) lives in hosted Turso, so
// edits made on the live site persist. Without it nothing changes (local file / bundled copy).
function makeClient() {
  const log = process.env.NODE_ENV === "development" ? (["error", "warn"] as const) : (["error"] as const);
  if (process.env.CMS_DB === "turso" && process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const adapter = new PrismaLibSQL({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    return new PrismaClient({ adapter, log: [...log] });
  }
  const dbUrl = resolveDbUrl();
  return new PrismaClient({ ...(dbUrl ? { datasourceUrl: dbUrl } : {}), log: [...log] });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
