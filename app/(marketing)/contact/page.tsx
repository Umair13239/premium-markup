import type { Metadata } from "next";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { ContactForm } from "@/components/site/contact-form";
import { Socials } from "@/components/site/socials";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "Contact — start a project",
  description:
    "Tell us about your business and your website goals. We reply within one working day. Call, WhatsApp or email PremiumMarkup.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        label="contact"
        title="Start a project."
        intro="Tell us what you're building and what's gone wrong before. The more specific you are, the more useful our reply will be."
      />
      <div className="container-editorial grid gap-14 py-16 md:grid-cols-[1.3fr_1fr] md:py-20">
        <div className="order-2 md:order-1">
          <ContactForm />
        </div>

        <aside className="order-1 md:order-2">
          <p className="tag-label">{"<!-- direct -->"}</p>
          <ul className="mt-4 space-y-4">
            <li>
              <a href={`tel:${siteConfig.phone.tel}`} className="flex items-center gap-3 hover:text-cobalt">
                <Phone className="h-5 w-5 text-cobalt" aria-hidden="true" />
                <span>
                  <span className="mono block text-xs text-muted">Call</span>
                  {siteConfig.phone.display}
                </span>
              </a>
            </li>
            <li>
              <a href={siteConfig.phone.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-cobalt">
                <MessageCircle className="h-5 w-5 text-cobalt" aria-hidden="true" />
                <span>
                  <span className="mono block text-xs text-muted">WhatsApp</span>
                  Message us
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email.primary}`} className="flex items-center gap-3 hover:text-cobalt">
                <Mail className="h-5 w-5 text-cobalt" aria-hidden="true" />
                <span>
                  <span className="mono block text-xs text-muted">Email</span>
                  {siteConfig.email.primary}
                </span>
              </a>
            </li>
          </ul>

          <div className="mt-10 rounded-[6px] border border-line bg-surface p-6">
            <p className="font-medium">What happens next</p>
            <ol className="mt-3 space-y-2 text-sm text-muted">
              <li>1. We read your brief and reply within one working day.</li>
              <li>2. A short call to confirm scope — no obligation.</li>
              <li>3. A fixed quote and timeline, in writing.</li>
            </ol>
          </div>

          <div className="mt-8">
            <p className="tag-label mb-2">{"<!-- social -->"}</p>
            <Socials className="-ml-2.5" />
          </div>
        </aside>
      </div>
    </>
  );
}
