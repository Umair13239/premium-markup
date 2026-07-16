import { activeSocials } from "@/site.config";

// Simple line icons in the ink colour, cobalt on hover — no bright platform blobs.
const PATHS: Record<string, string> = {
  Instagram:
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm5.5-1.2a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z",
  TikTok:
    "M16 3c.4 2.6 2 4.3 4.5 4.6v3.1c-1.6.1-3.1-.4-4.5-1.3v6.1a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2a2.8 2.8 0 1 0 2 2.7V3h3Z",
  LinkedIn:
    "M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.5h4V21H3ZM9.5 9.5h3.8v1.6h.05a4.2 4.2 0 0 1 3.75-2c4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2.05 1.4-2.05 2.8V21h-4Z",
  Facebook:
    "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6A21 21 0 0 0 14.6 3.5c-2.4 0-4.1 1.5-4.1 4.1v2.3H7.8V13h2.7v8Z",
  X: "M17.5 3h3l-6.6 7.6L21.7 21h-5.3l-4.2-5.5L7.2 21H4.2l7-8L3 3h5.4l3.8 5 4.3-5Zm-1 16h1.7L7.6 4.8H5.8Z",
};

export function Socials({
  className = "",
  iconClassName = "h-5 w-5",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {activeSocials.map((s) => (
        <li key={s.name}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.name} — ${s.handle}`}
            className="flex h-11 w-11 items-center justify-center text-ink transition-colors duration-150 hover:text-cobalt"
          >
            <svg
              className={iconClassName}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={PATHS[s.name]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
