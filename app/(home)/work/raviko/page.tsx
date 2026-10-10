import type { Metadata } from "next";
import Image from "next/image";
import { CaseFx } from "@/components/home/case-fx";
import { RavikoHero, RavikoWords } from "@/components/home/raviko-hero";
import ROWS from "./boards.json";

// Raviko brand identity case study (designed by Salman, Premium Markup). Panels are cut from the
// delivered presentation (boards.json → public/cases/raviko/pNN.webp); type and colour are rebuilt live.
export const metadata: Metadata = {
  title: { absolute: "Raviko · Brand identity | Premium Markup" },
  description: "Brand identity for Raviko, a conversion-focused design retainer agency: logo, construction grid, typography, colour, digital and print applications.",
  alternates: { canonical: "/work/raviko" },
};

type Panel = [string, number, number, string];
const A = "/cases/raviko/";
const rows = ROWS as Panel[][];

const PALETTE = [
  { name: "Vermilion Accent", ink: "#fff", sw: ["#FE4830", "#FC6552", "#FA8273"] },
  { name: "Glacier Mist", ink: "#101316", sw: ["#F2F5F9", "#E9EDF4", "#DCE6EF"] },
  { name: "Obsidian", ink: "#fff", sw: ["#101316", "#0C0C0C", "#050505"] },
];
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const cmyk = (h: string) => { const [r, g, b] = rgb(h).map((v) => v / 255), k = 1 - Math.max(r, g, b); return k === 1 ? [0, 0, 0, 100] : [r, g, b].map((v) => Math.round(((1 - v - k) / (1 - k)) * 100)).concat(Math.round(k * 100)); };

function Row({ row }: { row: Panel[] }) {
  return (
    <div className={"rk-row n" + row.length}>
      {row.map(([f, w, h, alt], i) => (
        <figure key={f} className={"rk-p rv " + (row.length === 1 ? "up" : i === 0 ? "fl" : i === row.length - 1 ? "fr" : "up")} style={{ "--i": i } as React.CSSProperties}>
          <Image src={A + f + ".webp"} alt={alt} width={w} height={h} unoptimized loading="lazy" style={{ background: "#0c0c0c" }} />
        </figure>
      ))}
    </div>
  );
}

export default function RavikoCase() {
  return (
    <article className="cs rv-case">
      <RavikoHero />
      <section className="cs-intro">
        <h2 className="cs-big">Built to <em>convert.</em></h2>
        <div className="cs-intro-row rv">
          <p>Raviko is a conversion-focused design retainer agency that builds high-performing ad creatives, sales pages and
            funnel content for info-product marketers and coaches. With over eight years of direct-response experience, every
            visual decision is engineered to turn traffic into revenue. In an industry full of aesthetic-first studios, Raviko
            needed an identity that reads as a performance partner: sharp, confident and unmistakably red.</p>
          <dl className="cs-meta">
            <div><dt>Client</dt><dd>Raviko</dd></div>
            <div><dt>Industry</dt><dd>Design & performance marketing</dd></div>
            <div><dt>Scope</dt><dd>Logo, brand system, digital, print, merchandise</dd></div>
            <div><dt>Designer</dt><dd>Salman, Premium Markup</dd></div>
          </dl>
        </div>
      </section>
      <section className="rk">
        <Row row={rows[0]} />
      </section>
      <RavikoWords />
      <section className="rk">
        {rows.slice(1, 5).map((r) => <Row key={r[0][0]} row={r} />)}
        {/* type & colour, rebuilt from the presentation's values */}
        <div className="rk-type">
          <div className="rk-aa rv fl"><b>Aa<span>01</span></b><p>Typography<br /><small>Neue Montreal</small></p></div>
          <div className="rk-pal">
            {PALETTE.map((c, ci) => (
              <div key={c.name} className="rk-col rv fr" style={{ "--i": ci } as React.CSSProperties}>
                {c.sw.map((h, k) => { const [r, g, b] = rgb(h), [cc, m, y, kk] = cmyk(h); return (
                  <div key={h} className={"rk-sw" + (k === 0 ? " main" : "")} style={{ background: h, color: c.ink, "--k": k } as React.CSSProperties}>
                    {k === 0 && <b>{c.name}</b>}<span>HEX {h}<br />RGB {r}/{g}/{b}<br />CMYK {cc}/{m}/{y}/{kk}</span>
                  </div>); })}
              </div>
            ))}
          </div>
        </div>
        {rows.slice(5).map((r) => <Row key={r[0][0]} row={r} />)}
      </section>
      <CaseFx />
    </article>
  );
}
