import type { Metadata } from "next";
import Image from "next/image";
import { CaseFx } from "@/components/home/case-fx";
import { Jost } from "next/font/google";
import { CsWords } from "@/components/home/cs-words";

// TriArc Consultant brand case study (step 1: foundations). Logo and business card are the client's
// existing identity; the system around them (palette, type, grid, rules, applications) is extended
// by Premium Markup. Nothing here claims results the client hasn't reported.
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-jost", display: "swap" });

export const metadata: Metadata = {
  title: { absolute: "TriArc Consultant · Brand identity | Premium Markup" },
  description: "Brand system for TriArc Consultant, an architecture, planning and interiors studio in Sahiwal: logo, grid, colour, typography and applications.",
  alternates: { canonical: "/work/triarc" },
};

const A = "/cases/triarc/";
const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const cmyk = (h: string) => {
  const [r, g, b] = hexRgb(h).map((v) => v / 255), k = 1 - Math.max(r, g, b);
  return k === 1 ? [0, 0, 0, 100] : [r, g, b].map((v) => Math.round(((1 - v - k) / (1 - k)) * 100)).concat(Math.round(k * 100));
};
const PALETTE: { name: string; role: string; shades: string[]; ink: string }[] = [
  { name: "Arc Gold", role: "Primary · the arc and the A", shades: ["#D4A537", "#E6C46A", "#B3872A"], ink: "#1B1D1F" },
  { name: "Graphite", role: "Structure · the towers", shades: ["#2E3235", "#1C1F21", "#0E0F10"], ink: "#F4F1EA" },
  { name: "Stone", role: "Ground · paper and space", shades: ["#F4F1EA", "#E9E3D6", "#D9D0BE"], ink: "#1B1D1F" },
];
const Board = ({ f, alt, sq }: { f: string; alt: string; sq?: boolean }) => (
  <figure className={"rv" + (sq ? " sq" : "")}><Image src={A + f.replace(/\.jpg$/, ".webp")} alt={alt} width={sq ? 1440 : 1920} height={sq ? 1440 : 1080} sizes={sq ? "(max-width: 860px) 100vw, 700px" : "(max-width: 1480px) 100vw, 1440px"} /></figure>
);
const WORDS = ["Precise", "Grounded", "Considered", "Timeless", "Built to last"];

export default function TriArcCase() {
  return (
    <article className={`cs ${jost.variable}`}>
      {/* 1 · hero */}
      <section className="cs-hero" data-dark>
        <div className="cs-rays" aria-hidden />
        <Image src={A + "icon-reversed.png"} alt="TriArc Consultant mark" width={1846} height={1459} priority className="cs-hero-mark" />
        <div className="cs-hero-copy">
          <span>Brand identity · 2026</span>
          <h1>TriArc Consultant</h1>
        </div>
      </section>

      <section className="cs-boards"><Board f="mock-sign.jpg" alt="TriArc sign on the studio facade" /></section>

      {/* 2 · overview */}
      <section className="cs-intro">
        <h2 className="cs-big">Designed to be <em>built.</em></h2>
        <div className="cs-intro-row rv">
          <p>TriArc Consultant is a new architecture, planning and interiors studio in Sahiwal. They take a project from the first 2D
            floor plan to 3D visualisation, landscape and lighting, and on to construction. A practice that sells precision needs an
            identity that looks engineered, so we built the system around their mark: every line placed, every colour earned.</p>
          <p style={{ gridColumn: "1 / -1", marginTop: 8 }}>The logo and business card were the starting point. Around them we built the full system: a measured construction grid, two colour versions for light and dark grounds, a type pairing, a three-family palette and the applications a new studio needs on day one, from the sign above the door to the app on a client&apos;s phone.</p>
          <dl className="cs-meta">
            <div><dt>Client</dt><dd>TriArc Consultant</dd></div>
            <div><dt>Location</dt><dd>Sahiwal, Pakistan</dd></div>
            <div><dt>Industry</dt><dd>Architecture · Planning · Interiors</dd></div>
            <div><dt>Scope</dt><dd>Logo, brand system, stationery, digital</dd></div>
          </dl>
        </div>
      </section>

      {/* 3 · words */}
      <CsWords words={WORDS} />

      {/* 4 · logo */}
      <section className="cs-logo">
        <Image src={A + "logo-color.png"} alt="TriArc Consultant logo" width={1846} height={2277} />
      </section>

      {/* 5 · construction */}
      <section className="cs-grid" data-dark>
        <div className="cs-grid-art">
          <Image src={A + "icon-reversed.png"} alt="TriArc mark on its construction grid" width={1846} height={1459} />
          {/* measured from the artwork: outer arc fits a circle c(754,612) r612 (mean error 1px) */}
          <svg viewBox="0 0 1846 1459" aria-hidden>
            <circle cx="754" cy="612" r="612" /><circle cx="754" cy="612" r="378" className="g" /><circle cx="754" cy="612" r="6" className="dot" />
            <line x1="-120" y1="218" x2="1966" y2="218" className="d" /><line x1="-120" y1="850" x2="1966" y2="850" /><line x1="-120" y1="912" x2="1966" y2="912" className="d" /><line x1="-120" y1="1395" x2="1966" y2="1395" />
            <line x1="522" y1="-80" x2="522" y2="1540" /><line x1="1010" y1="-80" x2="1010" y2="1540" /><line x1="754" y1="-80" x2="754" y2="1540" className="d" />
            <line x1="905" y1="567" x2="1385" y2="1495" className="d" />
            <text x="1380" y="250">R</text><text x="1150" y="470">R × 0.618</text><text x="1300" y="1300">63°</text><text x="560" y="1520">towers</text>
          </svg>
        </div>
        <div className="cs-note">
          <h2>Construction</h2>
          <p>The outer arc is a true circle. The inner circle is set at the golden ratio of it, and the towers stand between two
            verticals on its centre line. The T&apos;s bar and the A&apos;s base share one horizon; the A climbs at 63°.</p>
        </div>
      </section>

      {/* 6 · wordmark */}
      <section className="cs-word">
        <div className="cs-word-art"><Image src={A + "word-black.png"} alt="TriArc Consultant wordmark" width={1846} height={738} /></div>
        <div className="cs-note light"><h2>Wordmark</h2><p>Wide geometric capitals, generous tracking on CONSULTANT. Set in Jost to match the mark&apos;s round, drafted forms.</p></div>
      </section>

      {/* 7 · variations */}
      <section className="cs-vars">
        <div style={{ background: "#F4F1EA" }}><Image src={A + "logo-color.png"} alt="Logo, full colour on stone" width={1846} height={2277} /></div>
        <div style={{ background: "#0E0F10" }}><Image src={A + "logo-reversed.png"} alt="Logo, reversed on graphite" width={1846} height={2277} /></div>
      </section>

      {/* 8 · typography */}
      <section className="cs-type">
        <div className="cs-aa">Aa01</div>
        <div className="cs-type-spec">
          <small>Typography</small>
          <h2>Jost</h2>
          <p className="w"><span style={{ fontWeight: 300 }}>Light</span><span style={{ fontWeight: 400 }}>Regular</span><span style={{ fontWeight: 500 }}>Medium</span><span style={{ fontWeight: 600 }}>SemiBold</span><span style={{ fontWeight: 700 }}>Bold</span></p>
          <p className="g">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 · &amp; @ ( ) / %</p>
          <p className="pair">Body copy and long documents: <b>Inter</b>, for clear reading at small sizes.</p>
        </div>
      </section>

      {/* 9 · palette */}
      <section className="cs-pal">
        {PALETTE.map((p) => (
          <div key={p.name} className="cs-pal-col">
            {p.shades.map((h, i) => {
              const [r, g, b] = hexRgb(h), [c, m, y, k] = cmyk(h);
              return (
                <div key={h} className={"sw" + (i === 0 ? " main" : "")} style={{ background: h, color: p.ink }}>
                  {i === 0 && <b>{p.name}</b>}
                  <span>HEX {h}<br />RGB {r}/{g}/{b}<br />CMYK {c}/{m}/{y}/{k}</span>
                </div>
              );
            })}
            <p>{p.role}</p>
          </div>
        ))}
      </section>

      {/* 10 · applications: photo scenes with the mark placed in perspective, and flat boards (scripts/brand-kit) */}
      <section className="cs-boards">
        <Board f="board-pattern.jpg" alt="TriArc arc pattern" />
        <Board f="board-app-home.jpg" alt="TriArc app icon on a phone home screen" />
        <Board f="board-app-icons.jpg" alt="TriArc app icons, dark and light" />
        <Board f="mock-reception.jpg" alt="Reception wall with the TriArc logo" />
        <Board f="mock-cards.jpg" alt="TriArc business cards" />
        <Board f="board-flat-stationery.jpg" alt="TriArc letterhead, card and envelope" />
        <Board f="board-social.jpg" alt="TriArc social posts" />
        <div className="b2"><Board f="mock-tote.jpg" alt="TriArc tote bag" sq /><Board f="mock-hoodie.jpg" alt="TriArc hoodie" sq /></div>
        <div className="b2"><Board f="mock-helmet.jpg" alt="TriArc site helmet" sq /><Board f="mock-badge.jpg" alt="TriArc staff ID card" sq /></div>
      </section>
      <CaseFx />
    </article>
  );
}
