import { PrismaClient } from "@prisma/client";
import { caseStudies } from "../lib/work-seed";

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < caseStudies.length; i++) {
    const c = caseStudies[i];
    await prisma.project.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        name: c.name,
        sector: c.sector,
        url: c.url,
        year: c.year,
        services: c.services.join(", "),
        summary: c.summary,
        challenge: c.challenge,
        solution: c.solution.join("\n"),
        results: JSON.stringify(c.results),
        image: `/generated/work-${c.slug}.png`,
        status: "published",
        featured: i === 0,
        order: i,
        seoTitle: `${c.name} — ${c.sector} case study`,
        seoDescription: c.summary,
      },
    });
    console.log("seeded", c.slug);
  }
  await prisma.$disconnect();
}
main();
