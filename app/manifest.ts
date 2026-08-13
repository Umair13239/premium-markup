import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0d0c11",
    theme_color: "#0d0c11",
    icons: [{ src: "/pm-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
