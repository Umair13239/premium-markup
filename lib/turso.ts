import { createClient, type Client } from "@libsql/client";

// Hosted SQLite (Turso) holding the prospects collected by the Leads Manager on
// the office PC, which mirrors its local leads.db up here every 10 minutes.
// Vercel's filesystem is read-only, so this is how the live admin reads them.
// Server-only: never import this from a client component.

let client: Client | null = null;

export function tursoEnabled() {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

function db(): Client {
  if (!tursoEnabled()) throw new Error("Turso is not configured");
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return client;
}

export type Prospect = {
  id: string;
  name: string;
  phone: string | null;
  website: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  state_name: string | null;
  main_category: string | null;
  group_name: string | null;
  rating: number | null;
  reviews: number | null;
  status: string | null;
  wa: string | null;
  starred: number | null;
  link: string | null;
};

export type ProspectQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  group?: string;
  wa?: string;
};

const SELECT_COLS =
  'id, name, phone, website, email, city, state, state_name, main_category, group_name, rating, reviews, status, wa, starred, link';

// Builds the shared WHERE clause + args for both the count and the page query.
function buildWhere(q: ProspectQuery) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  const search = (q.search || "").trim();
  if (search) {
    where.push("(name LIKE ? OR city LIKE ? OR phone LIKE ? OR main_category LIKE ?)");
    const like = `%${search}%`;
    args.push(like, like, like, like);
  }
  if (q.group) { where.push("group_name = ?"); args.push(q.group); }
  if (q.wa === "yes" || q.wa === "no") { where.push("wa = ?"); args.push(q.wa); }
  else if (q.wa === "unchecked") { where.push("(wa IS NULL OR wa = '')"); }
  return { clause: where.length ? ` WHERE ${where.join(" AND ")}` : "", args };
}

export async function getProspects(q: ProspectQuery = {}) {
  const page = Math.max(1, q.page || 1);
  const perPage = Math.min(100, Math.max(1, q.perPage || 26));
  const { clause, args } = buildWhere(q);
  const c = db();

  const totalRes = await c.execute({ sql: `SELECT COUNT(*) AS n FROM leads${clause}`, args });
  const total = Number(totalRes.rows[0]?.n ?? 0);

  const rowsRes = await c.execute({
    sql: `SELECT ${SELECT_COLS} FROM leads${clause} ORDER BY name COLLATE NOCASE LIMIT ? OFFSET ?`,
    args: [...args, perPage, (page - 1) * perPage],
  });

  return {
    rows: rowsRes.rows as unknown as Prospect[],
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProspectStats() {
  const c = db();
  const [count, wa, meta, groups] = await Promise.all([
    c.execute("SELECT COUNT(*) AS n FROM leads"),
    c.execute("SELECT COUNT(*) AS n FROM leads WHERE wa = 'yes'"),
    c.execute("SELECT synced_at, lead_count FROM sync_meta WHERE id = 1").catch(() => null),
    c.execute("SELECT group_name, COUNT(*) AS n FROM leads WHERE group_name IS NOT NULL AND group_name <> '' GROUP BY group_name ORDER BY n DESC"),
  ]);
  return {
    total: Number(count.rows[0]?.n ?? 0),
    onWhatsapp: Number(wa.rows[0]?.n ?? 0),
    syncedAt: (meta?.rows?.[0]?.synced_at as string) || null,
    groups: (groups.rows as unknown as { group_name: string; n: number }[]).map((g) => ({
      name: g.group_name,
      count: Number(g.n),
    })),
  };
}
