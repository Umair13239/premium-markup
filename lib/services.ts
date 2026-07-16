// Every service page is generated from this one file: /services lists them and
// /services/[slug] renders each. Copy is written per service (no duplication) so
// each page targets its own keyword. `visual` picks the animated graphic.

export type ServiceVisualVariant =
  | "grid" | "code" | "motion" | "commerce" | "redesign"
  | "landing" | "uiux" | "seo" | "maintenance" | "graphic";

export type Service = {
  slug: string;
  nav: string;
  title: string;
  h1: string;
  keyword: string;
  tagline: string;
  intro: string;
  problems: string[];
  whoFor: string[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
  related: string[];
  visual: ServiceVisualVariant;
  seoTitle: string;
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "web-design",
    nav: "Website Design",
    title: "Website Design",
    h1: "Website Design",
    keyword: "web design",
    tagline: "Interfaces designed around your brand, audience and goals — not a recycled template.",
    intro:
      "Design isn't decoration. It's the difference between a visitor who understands what you do in three seconds and one who leaves. We design responsive interfaces from your brand and your customers outward, so every page has a clear job and a clear next step.",
    problems: [
      "Your site looks like a hundred others built on the same template.",
      "Visitors can't tell what you do, or what to do next.",
      "The design doesn't match the quality of your actual work.",
      "It looks fine on desktop and falls apart on a phone.",
    ],
    whoFor: [
      "Businesses replacing a template site with something that fits them.",
      "Brands that have outgrown their first DIY website.",
      "Anyone whose site quietly undersells the work behind it.",
    ],
    deliverables: [
      "Custom designs for every key page template",
      "A responsive layout system, mobile to large desktop",
      "A reusable type, colour and spacing system",
      "Interaction states and considered micro-interactions",
      "Design files handed over ready for development",
    ],
    faqs: [
      { q: "Do you design from a template?", a: "No. Every layout is designed around your brand and content. Templates are the reason most sites look interchangeable." },
      { q: "Will I see the design before it's built?", a: "Yes. You review the key pages and we refine them together before any development begins." },
      { q: "Can you work with our existing brand?", a: "Of course. If you have brand guidelines we design to them; if not, we can shape the essentials as we go." },
    ],
    related: ["web-development", "ui-ux-design", "website-redesign"],
    visual: "grid",
    seoTitle: "Website Design — custom, responsive web design agency",
    seoDescription: "Custom website design shaped around your brand, audience and goals. Responsive, distinctive interfaces from Premium Markup — no templates.",
  },
  {
    slug: "web-development",
    nav: "Website Development",
    title: "Website Development",
    h1: "Website Development",
    keyword: "website development",
    tagline: "Fast, scalable, maintainable websites — hand-coded, not assembled from plugins.",
    intro:
      "A design is only as good as the build behind it. We turn approved designs into clean, hand-written code that loads fast, holds up under real traffic and stays easy to change. No page-builder bloat, no plugin tax, no platform lock-in.",
    problems: [
      "Your site is slow, and speed is costing you enquiries and rankings.",
      "Every change means paying the original agency again.",
      "The codebase is a tangle of plugins nobody fully understands.",
      "It breaks in ways that are hard to diagnose.",
    ],
    whoFor: [
      "Businesses that want to own their code and hosting.",
      "Teams tired of fighting a page builder.",
      "Anyone who needs a site that stays fast as it grows.",
    ],
    deliverables: [
      "Hand-coded, component-based front end",
      "Sub-second loads and strong Core Web Vitals",
      "A CMS or content structure you can edit yourself",
      "Accessibility and SEO built into the markup",
      "Full handover — you own everything",
    ],
    faqs: [
      { q: "What do you build with?", a: "Modern, well-supported tools — typically Next.js and TypeScript — chosen for speed, stability and long-term maintainability rather than fashion." },
      { q: "Can I edit content myself?", a: "Yes. We set up a content structure or CMS so you can update text and images without touching code." },
      { q: "Do I own the site at the end?", a: "Completely. You get the code and control of the hosting. There is no lock-in." },
    ],
    related: ["web-design", "ecommerce", "website-maintenance"],
    visual: "code",
    seoTitle: "Website Development — hand-coded, fast, custom builds",
    seoDescription: "Custom website development in clean, hand-written code. Fast, scalable and maintainable sites you own — from Premium Markup.",
  },
  {
    slug: "animated-websites",
    nav: "Animated Websites",
    title: "Animated Web Experiences",
    h1: "Animated Web Experiences",
    keyword: "animated website design",
    tagline: "Purposeful motion and scroll-based storytelling that make a site memorable without getting in the way.",
    intro:
      "Motion, used well, guides attention and makes a site feel considered. Used badly, it's noise. We build scroll-driven experiences, interactive interfaces and micro-interactions that support the story you're telling, and we keep them fast and accessible.",
    problems: [
      "Your site is static and forgettable next to competitors.",
      "You want personality without sacrificing speed.",
      "Previous 'animated' attempts felt gimmicky or slow.",
      "Motion needs to work on phones and for reduced-motion users.",
    ],
    whoFor: [
      "Brands that want to stand out in a crowded market.",
      "Product and portfolio sites that need to feel alive.",
      "Businesses launching something worth a moment of attention.",
    ],
    deliverables: [
      "Scroll-linked reveals and section choreography",
      "Custom cursor, magnetic and hover interactions",
      "Page-load and route transition sequences",
      "Reduced-motion and performance safeguards",
      "A reusable motion system for future pages",
    ],
    faqs: [
      { q: "Won't animation slow the site down?", a: "Not the way we build it. We animate transform and opacity, work with the browser rather than against it, and test performance. Motion shouldn't cost you load time." },
      { q: "What about accessibility?", a: "Every effect has a reduced-motion fallback, and no essential information is ever communicated by animation alone." },
    ],
    related: ["web-design", "ui-ux-design", "web-development"],
    visual: "motion",
    seoTitle: "Animated Website Design — scroll & interaction design",
    seoDescription: "Purposeful animation, scroll-based storytelling and interactive interfaces that stay fast and accessible. Animated web experiences by Premium Markup.",
  },
  {
    slug: "ecommerce",
    nav: "E-commerce",
    title: "E-commerce Development",
    h1: "E-commerce Development",
    keyword: "ecommerce website development",
    tagline: "Online stores built around product discovery, customer confidence and a checkout that converts.",
    intro:
      "An online store lives or dies on the details: how quickly people find products, how much they trust you, and how little stands between them and the checkout. We build stores that make buying easy and give you room to grow.",
    problems: [
      "Shoppers can't find the right product quickly.",
      "Your checkout loses people at the final step.",
      "The store is slow, especially on mobile.",
      "Managing products and orders is more work than it should be.",
    ],
    whoFor: [
      "Brands selling products directly to customers.",
      "Businesses moving off a slow or limiting platform.",
      "Stores that have outgrown a basic template.",
    ],
    deliverables: [
      "Product discovery: search, filtering and clear navigation",
      "A fast, reassuring checkout flow",
      "Payment, shipping and tax integration",
      "Product and order management you can actually run",
      "Performance tuned for mobile shoppers",
    ],
    faqs: [
      { q: "Which platform do you use?", a: "It depends on your needs, from a headless build to an established platform. We recommend based on your catalogue size, team and budget, not a default." },
      { q: "Can you migrate my existing store?", a: "Yes, including products, customers and URLs, with redirects so you keep your search rankings." },
    ],
    related: ["web-development", "web-design", "seo"],
    visual: "commerce",
    seoTitle: "E-commerce Development — conversion-focused online stores",
    seoDescription: "Conversion-focused e-commerce development: fast product discovery, a reassuring checkout and a store you can grow. Built by Premium Markup.",
  },
  {
    slug: "website-redesign",
    nav: "Website Redesign",
    title: "Website Redesign",
    h1: "Website Redesign",
    keyword: "website redesign services",
    tagline: "Rebuild an outdated site into something faster, clearer and easier to grow — without losing what works.",
    intro:
      "A redesign isn't a new coat of paint. It's a chance to fix what's quietly costing you: slow pages, a confusing journey, weak search visibility. We keep the parts that work, rebuild the parts that don't, and protect your rankings through the move.",
    problems: [
      "Your site looks dated and undersells the business.",
      "Enquiries or sales have quietly dropped.",
      "It's slow, hard to update, or not mobile-friendly.",
      "You're worried a rebuild will hurt your SEO.",
    ],
    whoFor: [
      "Businesses whose site no longer reflects them.",
      "Companies that have outgrown their current platform.",
      "Anyone burned by a cheap rebuild before.",
    ],
    deliverables: [
      "A content and structure review before design",
      "A rebuilt, faster, fully responsive site",
      "SEO-safe migration with redirects in place",
      "Clearer journeys to your main actions",
      "A platform you can maintain and extend",
    ],
    faqs: [
      { q: "Will a redesign hurt my search rankings?", a: "Not if it's done properly. We map old URLs to new, keep valuable content and set up redirects, so you keep — and usually improve — your rankings." },
      { q: "Do we start the content from scratch?", a: "Only where it helps. We audit what you have, keep what's working and rewrite what isn't." },
    ],
    related: ["web-design", "web-development", "seo"],
    visual: "redesign",
    seoTitle: "Website Redesign Services — rebuild done properly",
    seoDescription: "Website redesign that fixes speed, clarity and SEO without losing what works. SEO-safe migration and a platform you can grow. Premium Markup.",
  },
  {
    slug: "landing-pages",
    nav: "Landing Pages",
    title: "Landing Page Design",
    h1: "Landing Page Design",
    keyword: "landing page design",
    tagline: "Focused, fast pages built to turn a specific audience into a specific action.",
    intro:
      "A landing page has one job: convert the traffic you're paying for or earning. We design and build focused pages with a clear message, an obvious next step and none of the distractions that leak conversions.",
    problems: [
      "Your ad traffic arrives and bounces.",
      "The page tries to do everything and converts on nothing.",
      "It loads slowly and loses people before they read a word.",
      "You can't tell what's actually working.",
    ],
    whoFor: [
      "Businesses running paid campaigns.",
      "Product, service or event launches.",
      "Anyone testing a new offer or audience.",
    ],
    deliverables: [
      "A single-goal page designed to convert",
      "Fast load and a mobile-first layout",
      "A clear message hierarchy and one primary action",
      "Analytics and conversion tracking",
      "A structure that's easy to A/B test",
    ],
    faqs: [
      { q: "How is this different from a normal page?", a: "A landing page strips away navigation and secondary options to focus entirely on one action. Everything on it earns its place or comes off." },
      { q: "Can you match it to our campaign?", a: "Yes. The message, visuals and offer are built to match the ad or email that brings people there." },
    ],
    related: ["web-design", "animated-websites", "seo"],
    visual: "landing",
    seoTitle: "Landing Page Design — conversion-focused pages",
    seoDescription: "Focused, fast landing pages built to convert paid and earned traffic into action. Designed and built by Premium Markup.",
  },
  {
    slug: "ui-ux-design",
    nav: "UI/UX Design",
    title: "UI and UX Design",
    h1: "UI and UX Design",
    keyword: "ui ux design agency",
    tagline: "Interfaces that are easy to understand, easy to use, and shaped around real behaviour.",
    intro:
      "Good UX is invisible: people get what they came for without thinking about it. We map the journey, structure the information and design interfaces that reduce friction, so your product or site feels obvious to use.",
    problems: [
      "Users get lost or drop off partway through.",
      "The interface looks fine but is frustrating to use.",
      "Features exist but nobody finds them.",
      "Decisions are based on opinion, not the user.",
    ],
    whoFor: [
      "Products and apps that need to feel effortless.",
      "Sites with complex content or journeys.",
      "Teams designing something new who want it right.",
    ],
    deliverables: [
      "User journeys and information architecture",
      "Wireframes and interactive prototypes",
      "A consistent, accessible interface system",
      "Interaction and state design",
      "Design specs ready for build",
    ],
    faqs: [
      { q: "Do you do user research?", a: "We work from your goals, your users and the evidence available. Where deeper research would help, we'll say so and scope it." },
      { q: "Can you improve an existing product?", a: "Yes. We can audit what you have, find the friction and redesign the parts that need it." },
    ],
    related: ["web-design", "animated-websites", "web-development"],
    visual: "uiux",
    seoTitle: "UI/UX Design Agency — usable, accessible interfaces",
    seoDescription: "UI and UX design shaped around real behaviour: clear journeys, usable interfaces and accessible design. UX design agency Premium Markup.",
  },
  {
    slug: "seo",
    nav: "SEO",
    title: "Technical and On-Page SEO",
    h1: "Technical and On-Page SEO",
    keyword: "SEO-friendly website development",
    tagline: "Foundations, structure and performance that help search engines and real people understand your site.",
    intro:
      "SEO isn't a trick. It's making your site fast, well-structured and genuinely useful, so search engines can read it and people want to stay. We handle the technical foundations and on-page work that most sites get wrong.",
    problems: [
      "Your site doesn't appear for the terms that matter.",
      "Search engines struggle to crawl or understand it.",
      "Pages are slow, and speed affects rankings.",
      "You've paid for 'SEO' before and saw nothing.",
    ],
    whoFor: [
      "Businesses that rely on being found locally or nationally.",
      "Sites being rebuilt or migrated.",
      "Anyone tired of vague SEO retainers.",
    ],
    deliverables: [
      "A technical audit and the fixes to match",
      "Clean site architecture and internal linking",
      "Structured data and metadata",
      "Core Web Vitals and performance work",
      "On-page content structure and guidance",
    ],
    faqs: [
      { q: "Do you guarantee number-one rankings?", a: "No honest agency can. We do the work that reliably improves visibility, and we report on what actually moves — traffic and enquiries, not vanity positions." },
      { q: "Is SEO included when you build a site?", a: "The technical foundations always are. Ongoing content and campaigns can be added on top." },
    ],
    related: ["web-development", "website-redesign", "ecommerce"],
    visual: "seo",
    seoTitle: "Technical & On-Page SEO — SEO-friendly development",
    seoDescription: "Technical and on-page SEO: architecture, structured data, Core Web Vitals and content structure that helps you get found. Premium Markup.",
  },
  {
    slug: "website-maintenance",
    nav: "Maintenance",
    title: "Website Maintenance",
    h1: "Website Maintenance",
    keyword: "website maintenance",
    tagline: "Keep your site fast, secure and up to date — without it becoming your problem.",
    intro:
      "A website isn't finished at launch. It needs updates, monitoring and the occasional fix. We keep yours healthy — fast, secure and current — so you can get on with running the business.",
    problems: [
      "Your site hasn't been touched since launch.",
      "You're not sure if it's secure or backed up.",
      "Small changes pile up because there's no one to do them.",
      "Something breaks and you don't know who to call.",
    ],
    whoFor: [
      "Businesses without an in-house developer.",
      "Owners who want peace of mind, not another job.",
      "Sites that need to stay reliable and current.",
    ],
    deliverables: [
      "Updates, security patches and backups",
      "Uptime and performance monitoring",
      "A set allowance for content changes and fixes",
      "Priority support when something's wrong",
      "Regular, readable health reports",
    ],
    faqs: [
      { q: "Do I need maintenance if you built the site?", a: "It's optional but sensible. Even a well-built site benefits from monitoring, updates and a person to call. You can also self-manage — the choice is yours." },
      { q: "What if I need a bigger change?", a: "Larger work is quoted separately, but maintenance clients get priority and a rate that reflects the ongoing relationship." },
    ],
    related: ["web-development", "seo", "website-redesign"],
    visual: "maintenance",
    seoTitle: "Website Maintenance — updates, security & support",
    seoDescription: "Ongoing website maintenance: updates, security, backups, monitoring and support that keep your site fast and reliable. Premium Markup.",
  },
  {
    slug: "graphic-design",
    nav: "Graphic Design",
    title: "Graphic and Digital Design",
    h1: "Graphic and Digital Design",
    keyword: "digital brand assets",
    tagline: "Brand-aligned graphics and digital assets that keep everything looking like it belongs together.",
    intro:
      "Your website is one part of how you look online. We create the surrounding assets — social graphics, campaign visuals, interface elements — as part of one consistent system, so your brand holds together wherever people meet it.",
    problems: [
      "Your visuals look inconsistent across channels.",
      "Social and campaign graphics feel off-brand.",
      "You're recreating the same things from scratch each time.",
      "The brand looks weaker than the business is.",
    ],
    whoFor: [
      "Businesses that need consistent visuals across channels.",
      "Brands running regular campaigns or social content.",
      "Anyone whose design is scattered across freelancers.",
    ],
    deliverables: [
      "Social media and campaign graphics",
      "Reusable templates and a visual system",
      "Interface and web graphic elements",
      "Brand-aligned iconography and imagery",
      "Files organised and ready to use",
    ],
    faqs: [
      { q: "Can you work from our existing brand?", a: "Yes. We design to your brand, and if the essentials are missing we can help shape them." },
      { q: "Do you do full brand identity?", a: "We focus on digital and web-facing design. For a full identity from scratch we'll be honest about scope and can partner where it helps." },
    ],
    related: ["web-design", "ui-ux-design", "animated-websites"],
    visual: "graphic",
    seoTitle: "Graphic & Digital Design — brand-aligned assets",
    seoDescription: "Brand-aligned graphic and digital design: social graphics, campaign visuals and interface assets as one consistent system. Premium Markup.",
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
export const relatedServices = (slugs: string[]) =>
  slugs.map((s) => services.find((x) => x.slug === s)).filter(Boolean) as Service[];
