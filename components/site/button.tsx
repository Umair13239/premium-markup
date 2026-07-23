import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "invert" | "gradient";

const base =
  "inline-flex items-center justify-center gap-2 min-h-11 px-6 text-[0.95rem] font-medium rounded-[6px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2";

const variants: Record<Variant, string> = {
  primary: "bg-cobalt text-white hover:bg-[var(--color-cobalt-ink)]",
  secondary:
    "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:text-cobalt px-0 min-h-0",
  // Always sits on a dark band, so use fixed light-bg + dark-text (the band
  // re-scopes --color-ink to light, which would make text-ink invisible here).
  invert: "bg-[#ece8e1] text-[#0d0c11] hover:bg-white",
  // Brand iris->violet gradient (see .btn-grad in globals.css).
  gradient: "btn-grad",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  external,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
