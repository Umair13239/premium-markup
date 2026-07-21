"use server";

import { getProspects, tursoEnabled } from "@/lib/turso";

export type PickedProspect = {
  id: string;
  name: string;
  category: string;
  city: string;
  website: string;
  hasWebsite: boolean;
  wa: string;
  rating: number | null;
  reviews: number | null;
};

// Searches the hosted prospect DB on demand (used by the AI Email writer's
// "Pull from a saved Prospect" picker) so we never ship thousands of rows to
// the browser. Returns a small, compact set. Safe when Turso is not configured.
export async function searchProspects(search: string): Promise<PickedProspect[]> {
  if (!tursoEnabled()) return [];
  try {
    const { rows } = await getProspects({ search: (search || "").trim(), perPage: 15, page: 1 });
    return rows.map((r) => {
      const website = (r.website || "").trim();
      return {
        id: r.id,
        name: r.name || "",
        category: r.main_category || r.group_name || "",
        city: [r.city, r.state_name].filter(Boolean).join(", "),
        website,
        hasWebsite: !!website,
        wa: r.wa || "",
        rating: r.rating,
        reviews: r.reviews,
      };
    });
  } catch {
    return [];
  }
}
