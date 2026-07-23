"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X, Phone, ChevronDown, ArrowRight } from "lucide-react";
import { siteConfig } from "@/site.config";
import { services } from "@/lib/services";
import { ThemeToggle } from "./theme-toggle";
import { Magnetic } from "./magnetic";
import { PMMark } from "./pm-mark";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu
  const [svcOpen, setSvcOpen] = useState(false); // desktop services dropdown
  const [mSvcOpen, setMSvcOpen] = useState(false); // mobile services accordion (collapsed by default)
  const svcRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); setSvcOpen(false); setMSvcOpen(false); }, [pathname]);
  // Collapse the mobile services list whenever the menu is closed.
  useEffect(() => { if (!open) setMSvcOpen(false); }, [open]);

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

  // Shared pill classes; the active item gets a sliding gradient pill behind it.
  const linkCls = (active: boolean) =>
    `relative z-10 flex items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-colors duration-200 ${
      active ? "text-white" : "text-ink/75 hover:text-ink"
    }`;
  const pillSpring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 32 };
  const ActivePill = () => (
    <motion.span layoutId="nav-active" className="nav-pill" transition={pillSpring} aria-hidden="true" />
  );

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
      <div className="container-editorial">
        <div
          className={`nav-capsule flex h-14 items-center justify-between gap-3 rounded-full pl-4 pr-2 md:h-[62px] md:pl-5 md:pr-2.5 ${
            scrolled ? "is-scrolled" : ""
          }`}
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight"
            aria-label={`${siteConfig.name} home`}
          >
            <PMMark className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-0.5" />
            Premium<span className="grad-text">Markup</span>
          </Link>

          {/* Centered link group inside a glass sub-pill */}
          <nav className="hidden md:flex" aria-label="Primary">
            <div className="nav-inner relative flex items-center gap-0.5 rounded-full p-1">
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
                        className={linkCls(active)}
                        aria-expanded={svcOpen}
                        aria-haspopup="true"
                        aria-current={active ? "page" : undefined}
                      >
                        {active && <ActivePill />}
                        <span className="relative z-10 flex items-center gap-1">
                          Services
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${svcOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                        </span>
                      </Link>

                      <div
                        className={`absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 pt-4 transition-all duration-200 ${
                          svcOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-[color-mix(in_oklab,var(--color-surface)_95%,transparent)] p-3 shadow-[0_28px_70px_-30px_rgba(6,8,24,0.75)] backdrop-blur-xl">
                          {services.map((s) => (
                            <Link
                              key={s.slug}
                              href={`/services/${s.slug}`}
                              className="group/svc rounded-xl px-3 py-2.5 transition-colors hover:bg-[color-mix(in_oklab,var(--color-cobalt)_12%,transparent)]"
                            >
                              <span className="block text-sm font-medium group-hover/svc:text-cobalt">{s.title}</span>
                              <span className="mono mt-0.5 block truncate text-[11px] text-muted">{s.keyword}</span>
                            </Link>
                          ))}
                          <Link
                            href="/services"
                            className="col-span-2 mt-1 flex items-center justify-between rounded-xl border-t border-line px-3 pt-3 text-sm font-medium text-cobalt"
                          >
                            All services
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} className={linkCls(active)} aria-current={active ? "page" : undefined}>
                    {active && <ActivePill />}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right cluster */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Magnetic strength={0.35}>
              <Link
                href="/contact"
                className="btn-grad group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
              >
                Start a project
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </Magnetic>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu — floating glass card under the capsule */}
      {open && (
        <div className="container-editorial mt-2 md:hidden">
          <div className="glass max-h-[78vh] overflow-y-auto rounded-2xl p-2 shadow-[0_28px_70px_-30px_rgba(6,8,24,0.7)]">
            <nav className="flex flex-col" aria-label="Mobile">
              {siteConfig.nav.map((item) =>
                item.href === "/services" ? (
                  <div key={item.href} className="border-b border-line/60 px-2">
                    <div className="flex items-center justify-between">
                      <Link href="/services" className="py-3 text-lg">Services</Link>
                      <button
                        type="button"
                        onClick={() => setMSvcOpen((v) => !v)}
                        aria-expanded={mSvcOpen}
                        aria-label={mSvcOpen ? "Collapse services list" : "Expand services list"}
                        className="-mr-1 flex h-11 w-11 items-center justify-center rounded-full text-muted"
                      >
                        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${mSvcOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                      </button>
                    </div>
                    {mSvcOpen && (
                      <div className="mb-3 flex flex-col gap-1 pl-2">
                        {services.map((s) => (
                          <Link key={s.slug} href={`/services/${s.slug}`} className="py-1.5 text-sm text-muted">
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`border-b border-line/60 px-2 py-3 text-lg ${isActive(item.href) ? "text-cobalt" : ""}`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <a href={`tel:${siteConfig.phone.tel}`} className="mono flex items-center gap-2 px-2 py-3 text-muted">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {siteConfig.phone.display}
              </a>
              <Link
                href="/contact"
                className="btn-grad mt-2 mb-1 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
              >
                Start a project
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
