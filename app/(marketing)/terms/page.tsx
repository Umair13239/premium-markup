import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply to using the Premium Markup website and engaging our services.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader label="legal" title="Terms & Conditions" intro="The terms for using this site and working with us. Last updated: July 2026." />
      <div className="container-editorial py-14 md:py-20">
        <div className="rich max-w-3xl">
          <h2>Using this website</h2>
          <p>
            This website is provided by {siteConfig.legalName} for general information about our services. By using it you
            agree to these terms. If you don&rsquo;t agree, please don&rsquo;t use the site.
          </p>

          <h2>Our content</h2>
          <p>
            Unless stated otherwise, the design, code, text and graphics on this site belong to Premium Markup. You may view
            and share pages for your own reference, but you may not copy, republish or reuse our content commercially without
            written permission. Case studies are shown with the relevant client&rsquo;s permission.
          </p>

          <h2>Accuracy</h2>
          <p>
            We keep the information here accurate and current, but we make no guarantee that everything is complete or
            error-free. Pricing figures are indicative; every project is quoted individually.
          </p>

          <h2>Quotes and projects</h2>
          <p>
            Any figures on this site are guides, not offers. Project work is governed by a separate written proposal and
            agreement that sets out scope, price, timeline and ownership. Where those terms differ from this page, the
            project agreement takes precedence.
          </p>

          <h2>Third-party links</h2>
          <p>
            The site may link to other websites we don&rsquo;t control. We&rsquo;re not responsible for their content or
            practices, and a link isn&rsquo;t an endorsement.
          </p>

          <h2>Liability</h2>
          <p>
            To the extent permitted by law, we&rsquo;re not liable for any loss arising from your use of this website. Nothing
            in these terms limits liability that can&rsquo;t be limited under law.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of England and Wales, and any disputes are subject to the courts of England
            and Wales.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href={`mailto:${siteConfig.email.primary}`}>{siteConfig.email.primary}</a>.
          </p>
        </div>
      </div>
    </>
  );
}
