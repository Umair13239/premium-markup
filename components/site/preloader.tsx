import { PM_P, PM_M, PM_VIEWBOX } from "./logo-paths";

// Preloader — CSS-driven so it plays and dismisses even if JS is slow/absent.
// Sequence: loading line → P strokes in → M wipes in → wordmark → panel lifts
// away to reveal the page. The inline script in layout.tsx sets
// `data-preloaded` on <html> for returning visitors (this session), which the
// CSS uses to skip the overlay before first paint — no flash, no layout block.
export function Preloader() {
  return (
    <div className="pm-pre" aria-hidden="true">
      <div className="pm-pre-inner">
        <svg className="pm-pre-mark" viewBox={PM_VIEWBOX} focusable="false">
          <path className="pm-pre-p" d={PM_P} fill="none" stroke="var(--color-ink)" strokeWidth={6.5} strokeLinejoin="round" strokeLinecap="round" />
          <path className="pm-pre-m" d={PM_M} fill="var(--color-cobalt)" />
        </svg>
        <div className="pm-pre-word">
          Premium<span>Markup</span>
        </div>
        <div className="pm-pre-line"><i /></div>
      </div>
    </div>
  );
}
