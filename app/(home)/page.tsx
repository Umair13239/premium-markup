import type { Metadata } from "next";
import { HomeMarkup } from "@/components/home/home-markup";
import { HomeFx } from "@/components/home/home-fx-client";

export const metadata: Metadata = {
  title: { absolute: "Premium Markup | Leads Portal: find clients, win them faster" },
  description:
    "130,000 local businesses checked for WhatsApp, with one-click demo work to pitch them: websites, SEO audits, UI designs and an AI receptionist. Built in Pakistan by Premium Markup.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HomeMarkup />
      <HomeFx />
    </>
  );
}
