// Client-safe portfolio types + constants. NO server imports here (no prisma,
// no node:*), so client components can import these without dragging server-only
// code into the browser bundle. Server data-fetching lives in lib/portfolio.ts.

export type PortfolioImage = { src: string; title: string };
export type PortfolioProject = {
  id: string;
  category: string;
  name: string;
  role: string;
  accent: string;
  cover: string;
  // How the cover image sits in the card: "cover" crops to fill, "contain"
  // shows the whole mark on a brand-tinted panel (for logo-led projects).
  // Omitted = auto (logo-led projects contain, everything else fills).
  coverFit?: "cover" | "contain";
  website: { url: string; shot: string } | null;
  posts: PortfolioImage[];
  thumbs: PortfolioImage[];
  logos: PortfolioImage[];
  flyers: PortfolioImage[];
  certs: PortfolioImage[];
  covers?: PortfolioImage[];
  // Optional video reels (mp4). Rendered as inline players in a "Videos" tab.
  videos?: PortfolioImage[];
};
export type PortfolioCategory = { id: string; label: string };
export type PortfolioData = {
  categories: PortfolioCategory[];
  projects: PortfolioProject[];
};

export const GROUP_KEYS = ["posts", "thumbs", "logos", "flyers", "certs", "covers"] as const;
