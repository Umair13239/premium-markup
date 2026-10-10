import { PM_ICON_PATH, PM_ICON_VIEWBOX } from "@/components/brand/logo";

// Preloader — CSS-driven so it plays and dismisses even if JS is slow/absent.
// Sequence: loading line → icon outline draws → fill wipes in → wordmark → panel
// lifts away. The inline script in layout.tsx sets `data-preloaded` on <html> for
// returning visitors (this session), which the CSS uses to skip the overlay.
export function Preloader() {
  return (
    <div className="pm-pre" aria-hidden="true">
      <div className="pm-pre-inner">
        <svg className="pm-pre-mark" viewBox={PM_ICON_VIEWBOX} focusable="false">
          <path className="pm-pre-p" d={PM_ICON_PATH} fill="none" stroke="var(--color-cobalt)" strokeWidth={5} strokeLinejoin="round" />
          <path className="pm-pre-m" d={PM_ICON_PATH} fill="var(--color-cobalt)" />
        </svg>
        <div className="pm-pre-word">
          Premium <span>Markup</span>
        </div>
        <div className="pm-pre-line"><i /></div>
      </div>
    </div>
  );
}
