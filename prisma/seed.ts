import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin account ---
  const email = process.env.ADMIN_EMAIL || "umair@premiummarkup.com";
  // Only sets a password when CREATING the admin. Re-running the seed no longer
  // resets an existing admin's password back to a default (that was a footgun).
  // To force a reset, set ADMIN_PASSWORD; otherwise a strong password stands.
  const password = process.env.ADMIN_PASSWORD || "change-me-" + Math.random().toString(36).slice(2, 10);
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  await prisma.user.upsert({
    where: { email },
    update: process.env.ADMIN_PASSWORD ? { passwordHash } : {},
    create: { email, passwordHash, name: "Umair Abbas" },
  });
  if (!existing && !process.env.ADMIN_PASSWORD) {
    console.log(`Admin created with a random password: ${password}  (save it, or set ADMIN_PASSWORD)`);
  }
  console.log(`Admin user ready: ${email}`);

  // --- Outreach templates ---
  const templates = [
    {
      name: "Cold email: website idea",
      kind: "cold-email",
      subject: "Quick idea for {company}",
      body:
        "Hi {firstName},\n\nI came across {company} online and had a look at your website. {auditFinding}\n\nWe build fast, professional websites by hand for businesses like yours, the kind that turn Google searches into real enquiries. A few examples of our recent work:\nhttps://www.premiummarkup.com/work\n\nIf it's useful, I'd happily put together a couple of specific, free ideas for {company}, no obligation.\n\nWorth a quick call this week?\n\nBest,\nUmair, Premium Markup\nhttps://www.premiummarkup.com",
    },
    {
      name: "Follow-up 1: gentle nudge",
      kind: "follow-up-1",
      subject: "Re: {company}'s website",
      body:
        "Hi {firstName},\n\nJust floating this back to the top of your inbox. No worries at all if the timing isn't right, I'm happy to share one specific idea for {company} either way.\n\nBest,\nUmair",
    },
    {
      name: "Follow-up 2: final",
      kind: "follow-up-2",
      subject: "Last one from me",
      body:
        "Hi {firstName},\n\nI'll leave it here so I'm not cluttering your inbox. If a faster website ever moves up the list for {company}, I'd be glad to help.\n\nAll the best,\nUmair",
    },
    {
      name: "LinkedIn DM",
      kind: "linkedin-dm",
      subject: null,
      body:
        "Hi {firstName}, I build hand coded websites for local businesses and noticed {company}'s could load a lot faster. Mind if I send a couple of specifics?",
    },
  ];
  for (const t of templates) {
    const existing = await prisma.template.findFirst({ where: { name: t.name } });
    if (!existing) await prisma.template.create({ data: t });
  }
  console.log(`Templates ready: ${templates.length}`);

  // No sample leads — Website Leads fill in only from real contact-form submissions.
}

main()
  .then(() => console.log("Seed complete."))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
