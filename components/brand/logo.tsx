import { useId } from "react";
// Premium Markup brand marks (from docs/Logos). The icon doubles as the "P" in the
// wordmark: [icon]remium Markup™ — "remium" bold, "Markup" regular.
export const PM_ICON_PATH =
  "M0,-12.735L-50.939,-12.735L-12.735,38.205L-63.674,101.879L-12.735,101.879L38.205,38.205L0,-12.735ZM63.675,-114.614C105.875,-114.614 140.084,-80.404 140.084,-38.205C140.084,3.995 105.875,38.205 63.675,38.205L25.47,-12.735L63.675,-12.735C77.741,-12.735 89.145,-24.138 89.145,-38.205C89.145,-52.271 77.741,-63.674 63.675,-63.674L-63.675,-63.674L-12.735,-114.614L63.675,-114.614Z";
export const PM_ICON_VIEWBOX = "-64 -115 205 217";

export function PMIcon({ className, title }: { className?: string; title?: string }) {
  const gid = "pmg" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox={PM_ICON_VIEWBOX} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={gid} cx="0.18" cy="0.12" r="1.05">
          <stop offset="0" stopColor="#7A60F3" /><stop offset="0.59" stopColor="#673DE6" /><stop offset="1" stopColor="#5231B7" />
        </radialGradient>
      </defs>
      {/* solid on light; gradient on dark (.pm-on-dark). fill= attribute so url(#…) resolves against the page */}
      <path d={PM_ICON_PATH} className="pm-solid" fill="#683CE7" />
      <path d={PM_ICON_PATH} className="pm-grad" fill={`url(#${gid})`} />
    </svg>
  );
}

/** Full logo. `className` sets size via font-size (the mark scales with the text). */
export function PMLogo({ className = "" }: { className?: string }) {
  return (
    <span className={"pm-logo " + className} aria-label="Premium Markup" role="img">
      <PMIcon className="pm-logo-i" />
      <span aria-hidden><b>remium</b> Markup<sup>™</sup></span>
    </span>
  );
}
