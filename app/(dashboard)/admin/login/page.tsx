"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Lock, LayoutDashboard, Radar } from "lucide-react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          Premium<span className="text-cobalt">Markup</span>
        </Link>
        <div className="mt-6 rounded-[6px] border border-line bg-surface p-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-cobalt/10 text-cobalt">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Choose where to go — both use the same login.</p>

          <form action={formAction} className="mt-6 grid gap-4">
            <label className="block">
              <span className="mono text-xs font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 w-full min-h-11 rounded-[6px] border border-line bg-surface px-3.5 outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"
              />
            </label>
            <label className="block">
              <span className="mono text-xs font-medium">Password</span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1.5 w-full min-h-11 rounded-[6px] border border-line bg-surface px-3.5 outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"
              />
            </label>

            {error && (
              <p role="alert" className="rounded-[6px] border border-[color:#e3b6b5] bg-[color:#fbeeed] px-3 py-2 text-sm text-tag">
                {error}
              </p>
            )}

            <p className="mono mt-1 text-xs text-muted">Sign in and open:</p>
            <div className="grid gap-2.5">
              <button
                type="submit"
                name="destination"
                value="/admin"
                disabled={pending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-cobalt px-5 font-medium text-white transition-colors hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LayoutDashboard className="h-4 w-4" aria-hidden="true" />}
                Website admin panel
              </button>
              <button
                type="submit"
                name="destination"
                value="/portal/index.html"
                disabled={pending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border border-line px-5 font-medium transition-colors hover:border-cobalt hover:text-cobalt disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Radar className="h-4 w-4" aria-hidden="true" />}
                Leads Portal
              </button>
            </div>
          </form>
        </div>
        <Link href="/" className="link-underline mono mt-4 inline-block text-sm text-muted">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
