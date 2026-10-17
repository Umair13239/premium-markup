import { Shell } from "@/components/home/shell";
import { SiteSchema } from "@/components/site/site-schema";
import { ChatWidget } from "@/components/site/chat-widget";
import "@/components/home/home.css";

// v2 shell (glass nav, footer, motion). Pages move here from (marketing) as they're redesigned.
// Typeface (Inter) comes from the root layout.
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <div className="pm2"><SiteSchema /><Shell>{children}<ChatWidget /></Shell></div>;
}
