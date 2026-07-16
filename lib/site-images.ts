// Registry of every replaceable site image. The admin Images manager lists these
// and regenerates the file in-place (public/generated/<name>.png), so the alt
// text and metadata — which live in the components, not the file — stay intact.
export type SiteImage = {
  name: string;   // filename base in public/generated
  label: string;  // human label
  group: string;  // grouping in the admin UI
  where: string;  // where it appears
  prompt: string; // default / current prompt (editable in admin)
};

export const SITE_IMAGES: SiteImage[] = [
  { name: "og", group: "Brand", label: "Social share (OG) image", where: "Link previews / social sharing", prompt: "a sleek modern creative web design studio workspace, a large monitor showing an elegant website, moody premium lighting, wide banner" },
  { name: "hero-ambient", group: "Brand", label: "Homepage hero backdrop", where: "Behind the homepage hero (subtle)", prompt: "abstract flowing light streaks and depth, deep violet-black, luminous iris-periwinkle glow, cinematic ambient background, no subject" },

  { name: "work-north-oak-joinery", group: "Work", label: "North Oak Joinery", where: "Work grid + case study hero", prompt: "a master carpenter's hands planing a smooth oak plank in a modern joinery workshop, fine wood shavings, warm rim light, dark background" },
  { name: "work-harbour-dental", group: "Work", label: "Harbour Dental", where: "Work grid + case study hero", prompt: "a modern minimalist dental clinic reception, clean white and light-wood surfaces, calm, soft daylight, pristine and empty" },
  { name: "work-meridian-lettings", group: "Work", label: "Meridian Lettings", where: "Work grid + case study hero", prompt: "a modern residential apartment building exterior at blue-hour dusk, warm-lit windows, quiet city street, estate agency" },

  { name: "service-web-design", group: "Services", label: "Website Design", where: "Service page + hub + home", prompt: "a designer refining a website layout on a large monitor, colour swatches and sketches on the desk, moody studio" },
  { name: "service-web-development", group: "Services", label: "Website Development", where: "Service page + hub + home", prompt: "a software developer's dark workspace, a code editor glowing on a widescreen monitor, mechanical keyboard, night" },
  { name: "service-animated-websites", group: "Services", label: "Animated Web Experiences", where: "Service page + hub + home", prompt: "a motion designer's studio, a screen showing an animation timeline and flowing graphics, creative dark space with soft light" },
  { name: "service-ecommerce", group: "Services", label: "E-commerce Development", where: "Service page + hub + home", prompt: "an online store checkout open on a laptop beside neatly packaged premium product boxes, warm retail lighting" },
  { name: "service-website-redesign", group: "Services", label: "Website Redesign", where: "Service page + hub", prompt: "a large monitor showing a sleek redesigned website in a minimalist modern office, moody, high-end" },
  { name: "service-landing-pages", group: "Services", label: "Landing Page Design", where: "Service page + hub", prompt: "a single focused landing page on a laptop screen with a small analytics uptick, clean desk, directional spotlight" },
  { name: "service-ui-ux-design", group: "Services", label: "UI/UX Design", where: "Service page + hub", prompt: "UX wireframes and sticky notes on a glass wall, a designer prototyping on a tablet, studio lighting" },
  { name: "service-seo", group: "Services", label: "SEO", where: "Service page + hub", prompt: "an analyst reviewing a search-analytics dashboard with rising line graphs on a monitor, dark focused office" },
  { name: "service-website-maintenance", group: "Services", label: "Website Maintenance", where: "Service page + hub", prompt: "a clean data-centre server aisle with softly glowing blue-violet indicator lights, deep perspective, cinematic" },
  { name: "service-graphic-design", group: "Services", label: "Graphic Design", where: "Service page + hub", prompt: "top-down of a graphic designer's desk: tablet, stylus, colour-palette prints and brand materials, moody premium" },

  { name: "blog-what-a-500-website", group: "Blog", label: "£500 website — cover", where: "Blog cover", prompt: "an open laptop on a tidy wooden desk showing a clean modern website, coffee cup and notebook, warm window light, minimal" },
  { name: "blog-why-your-wix-site", group: "Blog", label: "Wix costing customers — cover", where: "Blog cover", prompt: "close-up of hands on a laptop keyboard in a dim room, glowing screen, focused small-business owner in the evening" },

  { name: "about", group: "About", label: "About hero band", where: "About page", prompt: "a web designer's workspace with dual monitors showing code and a design layout, dark room, warm desk-lamp glow, plants, cinematic, no people" },
];

export const getSiteImage = (name: string) => SITE_IMAGES.find((s) => s.name === name);

// Service images use the uploaded stock webp; everything else stays png.
export const siteImageExt = (name: string): "png" | "webp" => (name.startsWith("service-") ? "webp" : "png");
export const siteImagePath = (name: string) => `/generated/${name}.${siteImageExt(name)}`;
