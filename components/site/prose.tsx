import type { ReactNode } from "react";

/** Narrow, readable measure (~68ch) for long-form article content. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="container-editorial">
      <div className="mx-auto max-w-[68ch] py-14 md:py-16">{children}</div>
    </div>
  );
}
