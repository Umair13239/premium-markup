import type { Metadata } from "next";
import { HowItWorks } from "@/components/home/how-it-works";

export const metadata: Metadata = {
  title: { absolute: "How it works | Leads Portal by Premium Markup" },
  description: "Six steps from a city name to a paid client: find businesses, check WhatsApp, audit their website, build a demo, redesign their site and pitch. Plus how Leads Portal compares with Apollo.io, Semrush, HubSpot and Wix.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return <HowItWorks />;
}
