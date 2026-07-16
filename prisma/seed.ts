import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin account ---
  const email = process.env.ADMIN_EMAIL || "umair@premiummarkup.com";
  const password = process.env.ADMIN_PASSWORD || "premiummarkup-dev";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Umair" },
  });
  console.log(`Admin user ready: ${email}`);

  // --- Outreach templates ---
  const templates = [
    {
      name: "Cold email — website audit",
      kind: "cold-email",
      subject: "A quick note about {company}'s website",
      body:
        "Hi {firstName},\n\nI came across {company} and had a look at your website. {auditFinding}\n\nI hand-build fast, search-friendly sites for businesses like yours, and I think a few small changes could bring you more enquiries.\n\nWould you be open to a quick, no-pressure chat this week?\n\nBest,\nUmair — PremiumMarkup",
    },
    {
      name: "Follow-up 1 — gentle nudge",
      kind: "follow-up-1",
      subject: "Re: {company}'s website",
      body:
        "Hi {firstName},\n\nJust floating this back to the top of your inbox. No worries at all if the timing's not right — happy to share one specific idea for {company} either way.\n\nBest,\nUmair",
    },
    {
      name: "Follow-up 2 — final",
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
        "Hi {firstName} — I build hand-coded websites for local businesses and noticed {company}'s could load a lot faster. Mind if I send a couple of specifics?",
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
