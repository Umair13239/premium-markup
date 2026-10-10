import { Shell } from "@/components/home/shell";
import { SiteSchema } from "@/components/site/site-schema";
import { ChatWidget } from "@/components/site/chat-widget";
import "@/components/home/home.css";

// Older pages (about, contact, services, blog, legal) share the v2 shell — same glass nav, mobile menu,
// footer and smooth scroll — while keeping their own content until each is redesigned.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pm2 pm2-legacy">
      <SiteSchema />
      <Shell>
        <main id="main" className="legacy-main">{children}</main>
        <ChatWidget />
      </Shell>
    </div>
  );
}
