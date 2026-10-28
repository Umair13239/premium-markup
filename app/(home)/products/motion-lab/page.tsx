import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MotionLab } from "@/components/products/motion-lab";

// Dev-only page to check every product-page motion primitive in one place. 404 in production.
export const metadata: Metadata = { title: "Motion lab", robots: { index: false, follow: false } };

export default function MotionLabRoute() {
  if (process.env.NODE_ENV === "production") notFound();
  return <MotionLab />;
}
