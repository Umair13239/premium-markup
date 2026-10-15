// One-off, idempotent: create the CMS tables in Turso and copy rows from the local dev.db.
// Usage: node scripts/cms-to-turso.cjs <schema.sql>   (needs TURSO_DATABASE_URL / TURSO_AUTH_TOKEN in .env)
// Never overwrites: tables use IF NOT EXISTS and rows use INSERT OR IGNORE.
require("dotenv").config({ path: ".env" });
const fs = require("fs");
const { createClient } = require("@libsql/client");
const { DatabaseSync } = require("node:sqlite");

(async () => {
  const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  const ddl = fs.readFileSync(process.argv[2], "utf8")
    .split(/;\s*\n/).map((x) => x.replace(/--.*$/gm, "").trim()).filter(Boolean)
    .map((x) => x.replace(/^CREATE TABLE /i, "CREATE TABLE IF NOT EXISTS ").replace(/^CREATE UNIQUE INDEX /i, "CREATE UNIQUE INDEX IF NOT EXISTS ").replace(/^CREATE INDEX /i, "CREATE INDEX IF NOT EXISTS "));
  for (const sql of ddl) await turso.execute(sql);
  console.log("schema ok:", ddl.length, "statements");

  const local = new DatabaseSync("prisma/dev.db", { readOnly: true });
  const tables = local.prepare("select name from sqlite_master where type='table' and name not like '_prisma%' and name not like 'sqlite_%'").all().map((r) => r.name);
  for (const t of tables) {
    const rows = local.prepare(`select * from "${t}"`).all();
    let n = 0;
    for (const r of rows) {
      const cols = Object.keys(r);
      const args = cols.map((c) => (typeof r[c] === "bigint" ? Number(r[c]) : r[c]));
      const res = await turso.execute({ sql: `INSERT OR IGNORE INTO "${t}" (${cols.map((c) => `"${c}"`).join(",")}) VALUES (${cols.map(() => "?").join(",")})`, args });
      n += res.rowsAffected;
    }
    const total = (await turso.execute(`select count(*) n from "${t}"`)).rows[0].n;
    console.log(t.padEnd(10), "local", rows.length, "inserted", n, "turso now", total);
  }
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
