import { PM_P, PM_M, PM_VIEWBOX } from "./logo-paths";

// Static PM monogram — outlined P + accent-filled M. Uses currentColor for the
// P so it inherits text colour; the M always uses the iris accent.
export function PMMark({ className = "", accent }: { className?: string; accent?: string }) {
  return (
    <svg viewBox={PM_VIEWBOX} className={className} aria-hidden="true" focusable="false">
      <path d={PM_P} fill="none" stroke="currentColor" strokeWidth={6.5} strokeLinejoin="round" strokeLinecap="round" />
      <path d={PM_M} fill={accent || "var(--color-cobalt)"} />
    </svg>
  );
}
