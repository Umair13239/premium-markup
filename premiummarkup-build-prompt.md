# PremiumMarkup — Complete Build Specification for Claude Code

Copy everything below this line into Claude Code as your project brief.

---

## PROJECT BRIEF

You are building the complete digital presence for **PremiumMarkup** (premiummarkup.com), a UK-based web development and social media agency. The deliverable has two parts:

1. **Public marketing website** — a modern, animated, SEO-optimized agency site
2. **Internal admin dashboard** — a full leads management and outreach system, accessible only after login

Work autonomously. Make sensible decisions without asking. Build to production quality — this is a real business, not a demo.

---

## 1. TECH STACK (use exactly this)

- **Framework:** Next.js 15 (App Router) with TypeScript — chosen for SEO (server rendering + static generation), performance, and single codebase for site + dashboard
- **Styling:** Tailwind CSS v4
- **UI primitives:** shadcn/ui (dashboard only — the marketing site must be fully custom, no recognizable component library look)
- **Animation:** Framer Motion (marketing site), subtle CSS transitions (dashboard)
- **Database:** SQLite via Prisma for development, structured so it can swap to Postgres (Supabase/Neon) at deploy time with only a connection-string change
- **Auth:** Auth.js (NextAuth v5), credentials provider, single admin account seeded from env vars
- **Forms/validation:** React Hook Form + Zod
- **Email capture:** contact form submissions write directly into the leads database AND send a notification email (use Resend, stub the API key in .env.example)
- **Deployment target:** Vercel (add vercel.json if needed)

Project structure: `/app/(marketing)` for the public site, `/app/(dashboard)/admin` for the internal system, shared components in `/components`, database schema in `/prisma`.

---

## 2. BRAND & DESIGN SYSTEM

**Identity concept:** The agency is named after markup — HTML itself. The design should subtly live in the world of code editors and craftsmanship WITHOUT looking like a "dark hacker terminal" cliché.

**Color palette (use these tokens, define as CSS variables):**
- `--paper: #FAFAF7` — warm off-white background
- `--ink: #16181D` — near-black text
- `--cobalt: #2743E0` — primary accent (CTAs, links, highlights)
- `--tag: #B0413E` — editor-maroon, used ONLY for the signature markup-tag flourishes
- `--muted: #6B7080` — secondary text
- `--line: #E6E6DF` — hairline borders
- Dark sections may invert (ink background, paper text) for rhythm — max 2 dark bands on the homepage

**Typography:**
- Display: **Archivo** (weights 600–900, use tight tracking on large sizes, occasionally the Expanded width for hero words)
- Body: **Archivo** 400/500
- Code/utility: **IBM Plex Mono** — used for the markup flourishes, section labels, stats, form labels
- Load via next/font. Establish a modular type scale (roughly 1.25 ratio) and stick to it.

**Signature element (this is what makes the site memorable):**
The hero headline is wrapped in visible, styled HTML tags — e.g. `<h1 class="premium">` rendered in IBM Plex Mono in the tag color above and below the real headline, with a slow blinking cursor after the closing tag. Section labels throughout the site are written as HTML comments: `<!-- services -->`, `<!-- process -->`, `<!-- work -->`. This device appears consistently but quietly — it should feel like a wink, not a gimmick.

**Anti-AI-look rules (critical):**
- NO generic gradient blobs, NO glassmorphism cards floating on purple gradients, NO emoji in headings, NO "🚀 Launch your dream website" style copy
- No centered-everything layouts — use asymmetric grids, generous whitespace, left-aligned editorial structure
- No stock illustration style (no undraw.co look). Where visuals are needed, use typographic compositions, real UI screenshots in browser-frame mockups (build simple CSS browser frames), or abstract line-work in the brand colors
- Border radius: 6px max on cards, 0 on images. Restraint reads as expensive.
- Every section must earn its place. If a section could appear on any agency site unchanged, rewrite it until it couldn't.

---

## 2.5 BUSINESS CONTACT DETAILS & SOCIAL PROFILES (use these throughout the site)

**Phone:** +44 7451 296502 — display in the header CTA area, contact page, and footer. Make it a `tel:+447451296502` link, and also add a WhatsApp deep link (https://wa.me/447451296502) as a secondary contact option on the contact page.

**Email addresses (domain-based, being set up — wire them in now):**
- hello@premiummarkup.com — primary public email: contact page, footer, JSON-LD, mailto links
- projects@premiummarkup.com — where contact-form notification emails are sent (set via env var so it's swappable)
- umair@premiummarkup.com — founder email, used on the About page signature

**Social profiles (link in footer + contact page + Organization JSON-LD sameAs):**
- Instagram: https://instagram.com/premiummarkup
- TikTok: https://tiktok.com/@premiummarkup
- LinkedIn: https://linkedin.com/company/premiummarkup
- Facebook: https://facebook.com/premiummarkup
- X: https://x.com/premiummarkup

Use branded icon links (simple line icons in the ink colour, cobalt on hover) — no default bright platform-coloured icon blobs. If any profile is not yet live at launch, keep the markup in place behind a config flag in one central `site.config.ts` file so links can be toggled on without touching components.

---

## 3. MARKETING SITE — PAGES & CONTENT

Write ALL copy at publication quality. Rules for copy:
- Specific beats clever. "We build sites that load in under a second" beats "blazing-fast digital experiences"
- Active voice, short sentences, no filler words ("truly", "seamlessly", "cutting-edge" are banned)
- UK English spelling throughout (optimise, colour, specialise)
- Write as the agency speaking to a business owner who has been burned by a cheap website before

### Pages:

**Home (/)**
- Hero: headline about hand-built websites that win customers (inside the markup-tag signature). Subline naming the two services. One primary CTA: "Start a project" → contact. One secondary: "See our work"
- Trust strip: mono-font stats (sites shipped, average load time, client retention — use realistic placeholder numbers marked with TODO comments)
- Services overview: two large cards — Web Development (primary, larger) and Social Media Management — each with 3-4 concrete deliverables listed
- Process section: 4 real steps (Discovery → Design → Build → Launch & Grow), each with 2 sentences of what actually happens
- Selected work: 3 case-study cards with CSS browser-frame mockups (placeholder projects, structured so real ones swap in)
- Why us: comparison-style section — hand-coded vs page-builder sites (speed, SEO, ownership)
- Final CTA band (dark): "Your website should be your best salesperson."
- Footer: sitemap links, socials, Companies House-style business info placeholder

**Services (/services)** — in-depth page per service area with pricing philosophy (no fixed prices, "projects from £X" placeholders), FAQs with real objection-handling answers

**Work (/work)** — case study grid; each case study is its own route (/work/[slug]) with a challenge → solution → results structure, driven by a local content file so new studies are easy to add

**About (/about)** — the founder story (a hands-on developer who builds every site personally — write it warm and credible, placeholder name to be replaced), values, and how the agency works remotely for UK clients

**Contact (/contact)** — the lead-capture form: name, company, email, phone (optional), budget range (select), project type (select), message. On submit: writes to the leads database with source="website", sends notification email, shows a confident success state ("We reply within one working day"). This form is the front door of the leads system — build it robustly with Zod validation and honeypot spam protection.

**Blog (/blog)** — MDX-based, set up with 2 seed articles written at genuinely publishable quality: (1) "Why your Wix site is costing you customers" (2) "What a £500 website actually gets you — and what it doesn't". These target real search intent from UK small businesses.

---

## 4. ANIMATION SPEC

Motion should feel orchestrated, not scattered:
- Page load: hero tags type in character-by-character (fast, ~600ms total), then headline fades up, then cursor starts blinking
- Scroll: sections reveal with a single subtle fade-up (12px translate, 0.5s ease-out) — use one consistent reveal, never mix effects
- Micro-interactions: link underlines draw in from left; primary buttons shift background on hover with a 150ms ease; case-study cards lift 2px with shadow deepening
- The stats strip counts up when scrolled into view
- **Respect `prefers-reduced-motion`** — all animation collapses to simple fades or nothing
- No parallax, no scroll-jacking, no cursor followers

---

## 5. SEO REQUIREMENTS (non-negotiable)

- Per-page metadata via Next.js Metadata API: unique title (≤60 chars) and description (≤155 chars) for every route
- Target keyword themes: "web development agency UK", "small business website design UK", "social media management agency" — worked naturally into H1s, headings, and copy, never stuffed
- Semantic HTML: one H1 per page, logical heading hierarchy, landmarks (header/main/footer/nav)
- JSON-LD structured data: Organization + LocalBusiness on home, Service on services, Article on blog posts, BreadcrumbList sitewide
- Auto-generated sitemap.xml and robots.txt
- OpenGraph + Twitter card images (generate a branded OG image template with @vercel/og)
- Core Web Vitals: images via next/image with explicit dimensions, fonts preloaded with next/font, zero layout shift, Lighthouse 95+ on all four scores — verify before finishing
- Clean URLs, trailing-slash consistent, canonical tags

---

## 6. ADMIN DASHBOARD — LEADS MANAGEMENT SYSTEM (/admin)

Behind login. Design language: same brand tokens but utilitarian — density over decoration, shadcn/ui components, sidebar navigation. This is a working tool the founder uses daily.

### 6.1 Leads pipeline
- **Lead model:** name, company, email, phone, website URL, source (website form / manual / imported), status (New → Contacted → In Conversation → Proposal Sent → Won / Lost), budget range, project type, notes (threaded with timestamps), createdAt, nextFollowUpDate, tags
- **Views:** table view (sortable, filterable by status/source/tag, search) AND kanban board view (drag-and-drop between status columns, persisting to DB)
- Lead detail drawer: full record, activity timeline, notes editor, status changer, follow-up date picker
- Website contact form submissions appear here automatically as status=New with a visual "unread" indicator

### 6.2 Lead finding (prospecting workspace)
Build this as a legitimate research workspace, not a scraper:
- **Manual quick-add:** fast form to log a prospect found during research (name, company, URL, niche, notes)
- **CSV import:** upload a CSV of prospects (from any lead source the founder uses), map columns, dedupe by email/URL, bulk-insert as status=New with source=imported
- **Prospect research checklist per lead:** auto-generated checklist (has SSL? mobile-friendly? page speed noted? social profiles found?) the founder fills in while researching — these become talking points for outreach
- **Website audit notes field:** structured fields for recording what's wrong with a prospect's current site (slow / dated design / not mobile / no SEO basics) — this feeds the outreach message

### 6.3 Outreach tools
- **Template library:** CRUD for outreach message templates (cold email, follow-up 1, follow-up 2, LinkedIn DM) with variable placeholders like {firstName}, {company}, {auditFinding}
- **Compose view:** pick a lead + template → variables auto-fill from the lead record → editable preview → "Copy to clipboard" and "Mark as contacted" (which sets status and logs the touch to the timeline). Do NOT build automated mass-sending — this is a compose-and-copy workflow
- **Follow-up queue:** dashboard widget listing leads whose nextFollowUpDate is today or overdue

### 6.4 Analytics dashboard (admin home)
- Cards: new leads this week, leads by status, conversion rate (Won / total closed), leads by source
- Simple bar chart of leads per week over 12 weeks (use recharts)
- Follow-ups due today list

### 6.5 Auth & safety
- Single admin login (email + password from env), session-based, all /admin routes protected by middleware
- Rate-limit the public contact form endpoint
- Never expose the database or admin API routes without auth

---

## 7. BUILD ORDER (work through phases, verify each before moving on)

1. Scaffold project, install dependencies, set up Prisma schema, seed script, auth
2. Design tokens, fonts, shared layout, footer/header for marketing site
3. Homepage — get the hero signature and one full section pixel-right before building the rest
4. Remaining marketing pages + blog setup with the 2 seed posts
5. Contact form → database → email notification pipeline
6. Admin: auth flow, layout, leads table + kanban
7. Admin: lead detail, notes, follow-ups, CSV import, templates, compose
8. Analytics dashboard
9. SEO pass: metadata, JSON-LD, sitemap, OG images
10. QA pass: run the site, check every route, test mobile at 375px, run Lighthouse, fix everything below 95, verify reduced-motion, verify form spam protection

## 8. QUALITY BAR / DEFINITION OF DONE

- `npm run build` passes with zero errors and zero TypeScript warnings
- Every page responsive at 375px, 768px, 1280px, 1920px
- No lorem ipsum anywhere — every word is real, final-quality copy
- No console errors in browser
- A stranger viewing the site would assume a design studio built it — audit your own output against the anti-AI-look rules in section 2 before declaring done
- Include a README with: env vars needed, how to run locally, how to deploy to Vercel, how to swap SQLite → Postgres

---
END OF BRIEF
