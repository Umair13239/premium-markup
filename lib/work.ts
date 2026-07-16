// Case studies live here so the /work grid and each /work/[slug] page share one
// source. Add a new object to publish a new study — no component changes needed.
// TODO: replace placeholder projects with real client work + permission to feature.

export type CaseStudy = {
  slug: string;
  name: string;
  sector: string;
  url: string;
  year: string;
  services: string[];
  summary: string;
  challenge: string;
  solution: string[];
  results: { stat: string; label: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "north-oak-joinery",
    name: "North Oak Joinery",
    sector: "Bespoke joinery",
    url: "northoakjoinery.co.uk",
    year: "2025",
    services: ["Web Development", "SEO"],
    summary:
      "A Leeds joinery workshop with beautiful work and an invisible website. We rebuilt it to show the craft and rank locally.",
    challenge:
      "Their old builder-made site took nearly five seconds to load, buried the phone number, and did not appear for a single local search. Enquiries came only from word of mouth.",
    solution: [
      "Rebuilt hand-coded from scratch — no builder, no plugins — for a sub-second load.",
      "Structured the work into project galleries with proper image sizing and lazy loading.",
      "Added local SEO foundations: LocalBusiness schema, location pages, and clean headings.",
      "Put the phone number and a short enquiry form on every screen size.",
    ],
    results: [
      { stat: "3×", label: "more enquiries in 90 days" },
      { stat: "0.7s", label: "mobile load time" },
      { stat: "Page 1", label: "for 'joinery Leeds'" },
    ],
  },
  {
    slug: "harbour-dental",
    name: "Harbour Dental",
    sector: "Private dentist",
    url: "harbourdental.co.uk",
    year: "2025",
    services: ["Web Development"],
    summary:
      "A Bristol private practice needed a calm, fast site that made booking effortless on a phone.",
    challenge:
      "The previous site failed Core Web Vitals, shifted layout as it loaded, and made new patients hunt for how to register.",
    solution: [
      "Hand-built with zero layout shift and images sized to prevent reflow.",
      "A single, obvious 'Register as a patient' path from every page.",
      "Treatment pages written for clarity, not jargon, with FAQ schema.",
    ],
    results: [
      { stat: "0.6s", label: "largest contentful paint" },
      { stat: "100", label: "Lighthouse accessibility" },
      { stat: "+40%", label: "registration form starts" },
    ],
  },
  {
    slug: "meridian-lettings",
    name: "Meridian Lettings",
    sector: "Estate agent",
    url: "meridianlettings.co.uk",
    year: "2024",
    services: ["Web Development", "Social Media"],
    summary:
      "A Manchester lettings agency wanted to be found for the neighbourhoods they cover — and to look the part.",
    challenge:
      "Competing agencies dominated local search. Their site looked dated and had no content targeting the areas they actually work in.",
    solution: [
      "Hand-coded area pages targeting real local search intent.",
      "A fast, filterable listings layout that works on any device.",
      "Ongoing social content tied to new listings and local news.",
    ],
    results: [
      { stat: "Page 1", label: "for 12 local terms" },
      { stat: "2.1×", label: "organic traffic in 6 months" },
      { stat: "0.8s", label: "average load time" },
    ],
  },
];

export const getCaseStudy = (slug: string) =>
  caseStudies.find((c) => c.slug === slug);
