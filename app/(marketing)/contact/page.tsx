import type { Metadata } from "next";
import { JsonLd, breadcrumb, pageMeta } from "@/lib/seo";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { Socials } from "@/components/site/socials";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = pageMeta({
  image: { url: "/og/contact.png", alt: "Contact Premium Markup" },
  title: "Contact | Premium Markup",
  description:
    "Questions about the Leads Portal, Brand Mockups, Design Studio or the AI receptionist? We reply within one working day. Call, WhatsApp or email Premium Markup.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[breadcrumb([{ name: "Contact", path: "/contact" }]), { "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Premium Markup", url: "https://premiummarkup.com/contact" }]} />
      <section className="pghead" style={{ paddingTop: 84 }}>
        <div className="eyebrow">Contact</div>
        <h1>Talk to <span style={{ color: "var(--brand)" }}>us.</span></h1>
        <p className="lede">Questions about the Leads Portal, your plan or account, or one of our tools? Tell us what you need and we will reply with the exact next step.</p>
      </section>
      <div className="mx-auto grid max-w-[1120px] gap-8 px-5 pb-24 text-[#1D1D1F] md:grid-cols-[1.4fr_1fr] md:px-6">
        <div className="order-2 rounded-[28px] bg-[#F5F5F7] p-6 md:order-1 md:p-9">
          <ContactForm />
        </div>

        <aside className="order-1 grid content-start gap-5 md:order-2">
          <ul className="grid gap-3">
            {[
              { href: `tel:${siteConfig.phone.tel}`, Icon: Phone, k: "Call", v: siteConfig.phone.display, ext: false },
              { href: siteConfig.phone.whatsapp, Icon: MessageCircle, k: "WhatsApp", v: "Message us", ext: true },
              { href: `mailto:${siteConfig.email.primary}`, Icon: Mail, k: "Email", v: siteConfig.email.primary, ext: false },
            ].map(({ href, Icon, k, v, ext }) => (
              <li key={k}>
                <a href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex items-center gap-4 rounded-[24px] bg-[#F5F5F7] p-5 transition-colors hover:bg-[#EDE8FF]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#683CE7]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-[#6E6E73]">{k}</span>
                    <span className="block truncate font-semibold">{v}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="rounded-[24px] bg-[#F5F5F7] p-6">
            <p className="font-bold">What happens next</p>
            <ol className="mt-3 grid gap-2 text-sm text-[#6E6E73]">
              <li>1. We read your message and reply within one working day.</li>
              <li>2. Plan, account or payment questions get the exact steps to fix them.</li>
              <li>3. Feature ideas go on our list, and we tell you if we build them.</li>
            </ol>
          </div>

          <div className="rounded-[24px] bg-[#F5F5F7] p-6">
            <p className="font-bold">Follow along</p>
            <Socials className="-ml-2.5 mt-2 [&_a]:!text-[#1D1D1F] [&_a:hover]:!text-[#683CE7]" />
          </div>
        </aside>
      </div>
    </>
  );
}
