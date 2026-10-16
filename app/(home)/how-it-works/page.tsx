import type { Metadata } from "next";
import { HowItWorks } from "@/components/home/how-it-works";
import { JsonLd, breadcrumb, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "How it works | Leads Portal by Premium Markup",
  description: "Six steps from a city name to a paid client: find businesses, check WhatsApp, audit their website, build a demo, redesign their site and pitch. Plus how Leads Portal compares with Apollo.io, Semrush, HubSpot and Wix.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={breadcrumb([{ name: "How it works", path: "/how-it-works" }])} />
      <HowItWorks />
    </>
  );
}
