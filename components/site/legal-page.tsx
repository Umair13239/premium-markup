// v2-themed wrapper for long-form legal copy: lime-pill header + soft grey reading card.
export function LegalPage({ eyebrow, title, intro, children }: { eyebrow: string; title: React.ReactNode; intro: string; children: React.ReactNode }) {
  return (
    <>
      <section className="pghead" style={{ paddingTop: 84 }}>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="lede">{intro}</p>
      </section>
      <div className="legal"><div className="legal-card">{children}</div></div>
    </>
  );
}
