// Create or update a website admin login.
//   npx tsx scripts/add-user.ts <email> <password> <admin|blog> [name]
// "blog" accounts can only open the blog dashboard. Run this yourself; never paste passwords into chat.
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const [email, password, role = "admin", ...rest] = process.argv.slice(2);
  if (!email || !password) {
    console.error("usage: npx tsx scripts/add-user.ts <email> <password> <admin|blog> [name]");
    process.exit(1);
  }
  if (password.length < 10) throw new Error("use a password of at least 10 characters");
  if (role !== "admin" && role !== "blog") throw new Error("role must be admin or blog");
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email: email.trim().toLowerCase() },
    update: { passwordHash, role, name: rest.join(" ") || undefined },
    create: { email: email.trim().toLowerCase(), passwordHash, role, name: rest.join(" ") || null },
  });
  console.log(`saved ${user.email} with role "${user.role}"`);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); }).finally(() => prisma.$disconnect());
