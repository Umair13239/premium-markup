"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { siteConfig } from "@/site.config";
import { services } from "@/lib/services";
import { Button } from "./button";
import { ThemeToggle } from "./theme-toggle";
import { Magnetic } from "./magnetic";
import { PMMark } from "./pm-mark";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu
  const [svcOpen, setSvcOpen] = useState(false); // desktop services dropdown
  const svcRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); setSvcOpen(false); }, [pathname]);

  // Close the dropdown on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSvcOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSvc = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setSvcOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setSvcOpen(false), 120); };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`sticky top-0 z-40 bg-paper/85 backdrop-blur-sm transition-[border-color,box-shadow] duration-200 ${
        scrolled ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <div className="container-editorial flex h-16 items-center justify-between md:h-[72px]">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight"
          aria-label={`${siteConfig.name} home`}
        >
          <PMMark className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-0.5" />
          Premium<span className="text-cobalt">Markup</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {siteConfig.nav.map((item) => {
            const active = isActive(item.href);
            if (item.href === "/services") {
              return (
                <div
                  key={item.href}
                  ref={svcRef}
                  className="relative"
                  onMouseEnter={openSvc}
                  onMouseLeave={scheduleClose}
                  onFocus={openSvc}
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSvcOpen(false); }}
                >
                  <Link
                    href="/services"
                    className={`link-underline flex items-center gap-1 text-[0.95rem] ${active ? "text-cobalt" : "text-ink hover:text-cobalt"}`}
                    aria-expanded={svcOpen}
                    aria-haspopup="true"
                    aria-current={active ? "page" : undefined}
                  >
                    Services
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${svcOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </Link>

                  <div
                    className={`absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 pt-3 transition-all duration-200 ${
                      svcOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-1 rounded-[10px] border border-line bg-surface p-3 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]">
                      {services.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className="group/svc rounded-[6px] px-3 py-2.5 transition-colors hover:bg-paper"
                        >
                          <span className="block text-sm font-medium group-hover/svc:text-cobalt">{s.title}</span>
                          <span className="mono mt-0.5 block truncate text-[11px] text-muted">{s.keyword}</span>
                        </Link>
                      ))}
                      <Link
                        href="/services"
                        className="col-span-2 mt-1 flex items-center justify-between rounded-[6px] border-t border-line px-3 pt-3 text-sm font-medium text-cobalt"
                      >
                        All services
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`link-underline text-[0.95rem] ${active ? "text-cobalt" : "text-ink hover:text-cobalt"}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={`tel:${siteConfig.phone.tel}`}
            className="mono flex items-center gap-1.5 text-sm text-muted hover:text-ink"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {siteConfig.phone.display}
          </a>
          <ThemeToggle />
          <Magnetic strength={0.4}>
            <Button href="/contact">Start a project</Button>
          </Magnetic>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-line bg-paper md:hidden">
          <nav className="container-editorial flex flex-col py-4" aria-label="Mobile">
            {siteConfig.nav.map((item) =>
              item.href === "/services" ? (
                <div key={item.href} className="border-b border-line py-3">
                  <Link href="/services" className="text-lg">Services</Link>
                  <div className="mt-2 flex flex-col gap-1 pl-3">
                    {services.map((s) => (
                      <Link key={s.slug} href={`/services/${s.slug}`} className="py-1.5 text-sm text-muted">
                        {s.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.href} href={item.href} className="border-b border-line py-3 text-lg">
                  {item.label}
                </Link>
              )
            )}
            <a
              href={`tel:${siteConfig.phone.tel}`}
              className="mono flex items-center gap-2 py-3 text-muted"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {siteConfig.phone.display}
            </a>
            <Button href="/contact" className="mt-3 w-full">
              Start a project
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
