// App Router re-mounts template.tsx on every navigation, so this is the clean,
// back-button-safe place for an enter transition: a full-screen panel lifts
// away while the new page fades up through it. Both run on plain CSS (see
// .route-panel / .route-content in globals.css), so the page still shows if
// JavaScript is slow or missing. Reduced-motion users get the content instantly.
export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="route-panel" aria-hidden="true" />
      <div className="route-content">{children}</div>
    </>
  );
}
