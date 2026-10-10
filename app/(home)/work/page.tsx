import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// Work index. The full archive (websites, logofolio, posts…) is parked in docs/legacy/work-full-page.tsx.txt
// while case studies are rebuilt one by one; restore it from there.
export const metadata: Metadata = {
  title: { absolute: "Work | Premium Markup" },
  description: "Brand identity and website case studies by Premium Markup: the brief, the system we built and how it is used.",
  alternates: { canonical: "/work" },
};

const CASES = [
  { href: "/work/raviko", name: "Raviko", kind: "Brand identity · Design agency", img: "/cases/raviko/p01.webp", w: 2029, h: 1303, bg: "#E9ECF1", cover: true },
  { href: "/work/triarc", name: "TriArc Consultant", kind: "Brand identity · Architecture", img: "/cases/triarc/icon-reversed.png", w: 1846, h: 1459, bg: "radial-gradient(60% 60% at 50% 45%, #2a2216, #0B0B0C 70%)" },
];

export default function WorkPage() {
  return (
    <>
      <section className="pghead">
        <div className="eyebrow rv">Our work</div>
        <h1 className="rv" style={{ "--i": 1 } as React.CSSProperties}>Case studies.<br /><span style={{ color: "var(--brand)" }}>Built end to end.</span></h1>
        <p className="lede rv" style={{ "--i": 2 } as React.CSSProperties}>Each case study shows a real client&apos;s brand from the first sketch to the finished system: the logo and how it was built, the colours and type, and the brand at work on signs, stationery, screens and merchandise. We design identities and websites for businesses that want to look as good as the work they do.</p>
        <p className="lede rv" style={{ "--i": 3 } as React.CSSProperties}>Our work spans security and investigation firms, training academies, restaurants, consultancies and tech startups. More case studies are being added as each project is documented properly.</p>
      </section>
      <section className="cases">
        {CASES.map((c) => (
          <Link key={c.href} href={c.href} className="case-card rv">
            <div className={"case-art" + ("cover" in c && c.cover ? " cover" : "")} style={{ background: c.bg }}><Image src={c.img} alt={c.name} width={c.w} height={c.h} /></div>
            <div className="case-meta"><b>{c.name}</b><span>{c.kind}</span></div>
          </Link>
        ))}
      </section>
    </>
  );
}
