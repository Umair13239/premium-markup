import { z } from "zod";

export const BUDGETS = [
  "Under £1,000",
  "£1,000 – £3,000",
  "£3,000 – £6,000",
  "£6,000 – £12,000",
  "£12,000+",
  "Not sure yet",
] as const;

// "Service required" — matches the agency's service pages, plus Other.
export const PROJECT_TYPES = [
  "New website",
  "Website redesign",
  "Website development",
  "Animated website",
  "E-commerce website",
  "Landing page",
  "UI/UX design",
  "SEO",
  "Website maintenance",
  "Graphic design",
  "Other",
] as const;

export const TIMELINES = [
  "As soon as possible",
  "Within 1–3 months",
  "In 3–6 months",
  "Just exploring for now",
] as const;

export const REFERRALS = [
  "Google search",
  "Social media",
  "Referral / word of mouth",
  "Saw our work",
  "Other",
] as const;

// Contextual prompts shown when a service is chosen — clicking one appends it to
// the brief so people know exactly what detail helps us quote fast. Services
// without an entry simply show no chips.
export const PROJECT_SUGGESTIONS: Record<string, string[]> = {
  "New website": [
    "Roughly how many pages?",
    "Do you already have branding / a logo?",
    "Any sites you love the look of?",
    "Need online booking or payments?",
    "Target launch date?",
  ],
  "Website redesign": [
    "What's the current website address?",
    "What's not working about it today?",
    "Keep the same content or start fresh?",
    "Any drop in enquiries or rankings?",
  ],
  "Website development": [
    "Do you have designs ready?",
    "Any integrations needed (CRM, payments, booking)?",
    "Roughly how many page templates?",
  ],
  "Animated website": [
    "What kind of feel are you after?",
    "Any sites whose motion you admire?",
    "New build or adding motion to an existing site?",
  ],
  "E-commerce website": [
    "Roughly how many products?",
    "On a platform already, or starting fresh?",
    "Which payment methods matter?",
    "Migrating an existing store?",
  ],
  "Landing page": [
    "What's the single goal of the page?",
    "Is it for a specific campaign?",
    "Any deadline we should know about?",
  ],
  "SEO": [
    "What terms do you want to be found for?",
    "Is this a new site or an existing one?",
    "Any past SEO work we should know about?",
  ],
  Other: [
    "What problem are you trying to solve?",
    "Any deadline we should know about?",
  ],
};

export const contactSchema = z.object({
  name: z.string().min(2, "Please tell us your name"),
  company: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(40).optional().or(z.literal("")),
  currentWebsite: z.string().max(200).optional().or(z.literal("")),
  budget: z.string().min(1, "Please choose a budget range"),
  projectType: z.string().min(1, "Please choose the service you need"),
  timeline: z.string().max(60).optional().or(z.literal("")),
  message: z.string().min(10, "A sentence or two about the project helps"),
  referral: z.string().max(60).optional().or(z.literal("")),
  attachmentUrl: z.string().max(300).optional().or(z.literal("")),
  attachmentName: z.string().max(200).optional().or(z.literal("")),
  consent: z.literal(true, { message: "Please agree so we can reply to you" }),
  // Honeypot — real people leave this empty; bots tend to fill it. We accept it
  // through validation and silently drop filled submissions in the route handler.
  website: z.string().optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
