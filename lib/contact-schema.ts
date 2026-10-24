import { z } from "zod";

export const BUDGETS = [
  "Under $500",
  "$500 – $1,500",
  "$1,500 – $3,000",
  "$3,000 – $6,000",
  "$6,000+",
  "Not sure yet",
] as const;

// "Service required" — matches the agency's service pages, plus Other.
export const PROJECT_TYPES = [
  "Leads Portal (plan, account or support)",
  "Website (new build or redesign)",
  "SEO audit",
  "UI/UX design",
  "AI receptionist",
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
  "Leads Portal (plan, account or support)": [
    "Which Leads Portal plan fits you?",
    "Are you already signed up? What email is it under?",
    "What is not working (page, feature or payment)?",
  ],
  "Website (new build or redesign)": [
    "Is this a new website or a redesign of an existing one?",
    "Roughly how many pages?",
    "Do you already have branding or a logo?",
    "What is the current website address, if any?",
    "Need online booking or payments?",
  ],
  "SEO audit": [
    "What is the website address to audit?",
    "What search terms do you want to be found for?",
    "Any drop in enquiries or rankings?",
  ],
  "UI/UX design": [
    "What product or screen needs design?",
    "Do you have brand colours or a style in mind?",
    "Web, mobile app, or both?",
  ],
  "AI receptionist": [
    "What kind of business is it?",
    "Which languages should it speak?",
    "Should it take bookings and send them to you?",
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
