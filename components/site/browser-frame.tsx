import type { ReactNode } from "react";

/** A simple, restrained CSS browser chrome for work mockups. */
export function BrowserFrame({
  url = "premiummarkup.com",
  children,
  className = "",
}: {
  url?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[6px] border border-line bg-surface ${className}`}>
      <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full border border-line" />
          <span className="h-2.5 w-2.5 rounded-full border border-line" />
          <span className="h-2.5 w-2.5 rounded-full border border-line" />
        </span>
        <div className="ml-2 flex-1 truncate rounded-[4px] border border-line bg-surface px-3 py-1 mono text-xs text-muted">
          {url}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
