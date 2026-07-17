"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Search, Send, FileText, LogOut, Radar, PenSquare, Sun, Moon, ImageIcon, Briefcase, Globe, ScrollText, Settings } from "lucide-react";
import { siteConfig } from "@/site.config";

function ThemeRow() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
    setTheme(next);
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className="mb-1 flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink"
    >
      {theme === "dark" ? <Sun className="h-4.5 w-4.5" aria-hidden="true" /> : <Moon className="h-4.5 w-4.5" aria-hidden="true" />}
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Leads", href: "/admin/leads", icon: Users, exact: false },
  { label: "Find leads", href: "/admin/find", icon: Search, exact: false },
  { label: "Compose", href: "/admin/outreach", icon: Send, exact: false },
  { label: "Templates", href: "/admin/templates", icon: FileText, exact: false },
  { label: "Work / Projects", href: "/admin/work", icon: Briefcase, exact: false },
  { label: "Blog", href: "/admin/blog", icon: PenSquare, exact: false },
  { label: "Site Images", href: "/admin/images", icon: ImageIcon, exact: false },
  { label: "Portfolio", href: "/admin/portfolio", icon: ScrollText, exact: false },
  { label: "Settings", href: "/admin/settings", icon: Settings, exact: false },
];

export function AdminSidebar({
  email,
  signOutAction,
}: {
  email?: string | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <Link href="/admin" className="font-display text-base font-extrabold tracking-tight">
          Premium<span className="text-cobalt">Markup</span>
        </Link>
        <p className="mono mt-0.5 text-[11px] text-muted">leads console</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-cobalt/10 text-cobalt" : "text-ink hover:bg-paper"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
        <a
          href={siteConfig.leadsPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-3 rounded-[6px] border border-line bg-cobalt/5 px-3 py-2.5 text-sm font-medium text-cobalt transition-colors hover:bg-cobalt/10"
        >
          <Radar className="h-4.5 w-4.5" aria-hidden="true" />
          Leads Portal ↗
        </a>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          <Globe className="h-4.5 w-4.5" aria-hidden="true" />
          View website ↗
        </a>
      </nav>

      <div className="border-t border-line p-3">
        <ThemeRow />
        <p className="mono truncate px-3 pb-2 text-[11px] text-muted">{email}</p>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-tag"
          >
            <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
