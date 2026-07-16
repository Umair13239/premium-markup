import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Premium Markup collects, uses and protects your personal data.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader label="legal" title="Privacy Policy" intro="How we handle the information you share with us. Last updated: July 2026." />
      <div className="container-editorial py-14 md:py-20">
        <div className="rich max-w-3xl">
          <h2>Who we are</h2>
          <p>
            This site is operated by {siteConfig.legalName} (&ldquo;Premium Markup&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), a
            web design and development agency based in the {siteConfig.address.region}. For any privacy question, email{" "}
            <a href={`mailto:${siteConfig.email.primary}`}>{siteConfig.email.primary}</a>.
          </p>

          <h2>What we collect</h2>
          <p>We only collect what we need to respond to you and run the site:</p>
          <ul>
            <li><strong>Enquiry details</strong> you submit through the contact form — name, business, email, phone, current website, budget, timeline, project details and any file you attach.</li>
            <li><strong>Technical data</strong> your browser sends automatically, such as IP address and device type, used for security and basic analytics.</li>
            <li><strong>Usage data</strong> from privacy-respecting analytics, so we can see which pages are useful. We do not build advertising profiles.</li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To reply to your enquiry and, if you become a client, to deliver the work.</li>
            <li>To keep the site secure and prevent abuse.</li>
            <li>To understand, in aggregate, how the site is used and improve it.</li>
          </ul>

          <h2>Legal basis</h2>
          <p>
            We process enquiry data on the basis of taking steps at your request before entering a contract, and our
            legitimate interest in responding to you and running the business. We rely on consent where the law requires it,
            which you can withdraw at any time.
          </p>

          <h2>Sharing</h2>
          <p>
            We do not sell your data. We share it only with service providers who help us operate (for example hosting,
            email and analytics), under contracts that require them to protect it, and where the law requires disclosure.
          </p>

          <h2>Retention</h2>
          <p>
            We keep enquiry data for as long as needed to respond and, where relevant, for the duration of a project plus a
            reasonable period afterwards for our records. We delete it on request unless we&rsquo;re required to keep it.
          </p>

          <h2>Your rights</h2>
          <p>
            Under UK GDPR you can ask to access, correct, delete or restrict your data, or object to its processing. Email
            us and we&rsquo;ll respond within one month. You also have the right to complain to the Information
            Commissioner&rsquo;s Office (ICO).
          </p>

          <h2>Cookies</h2>
          <p>
            We keep cookies to a minimum. Essential cookies keep the site working; any analytics cookies are used only to
            measure usage in aggregate. You can control cookies through your browser settings.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy or your data? Email{" "}
            <a href={`mailto:${siteConfig.email.primary}`}>{siteConfig.email.primary}</a>.
          </p>
        </div>
      </div>
    </>
  );
}
