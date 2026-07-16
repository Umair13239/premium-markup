import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { CustomCursor } from "@/components/site/custom-cursor";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { Preloader } from "@/components/site/preloader";
import { SiteSchema } from "@/components/site/site-schema";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteSchema />
      <Preloader />
      <SmoothScroll />
      <CustomCursor />
      <ScrollProgress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[6px] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
