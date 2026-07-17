"use client";

import { useActionState } from "react";
import { Loader2, KeyRound, Check, AlertCircle } from "lucide-react";
import { changePassword, type ChangePasswordState } from "@/app/(dashboard)/admin/(shell)/settings/actions";

const field =
  "min-h-11 w-full rounded-[6px] border border-line bg-surface px-3 text-sm outline-none transition-colors focus:border-cobalt";

export function ChangePasswordForm({ email }: { email?: string | null }) {
  const [state, formAction, pending] = useActionState<ChangePasswordState, FormData>(changePassword, undefined);

  return (
    <form action={formAction} className="grid max-w-sm gap-4">
      {/* Helps password managers associate the entry with the right account. */}
      <input type="hidden" name="username" value={email || ""} autoComplete="username" />

      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Current password</span>
        <input name="current" type="password" required autoComplete="current-password" className={field} />
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-medium">New password</span>
        <input name="next" type="password" required minLength={10} autoComplete="new-password" className={field} />
        <span className="text-xs text-muted">At least 10 characters. Longer is better than complicated.</span>
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Confirm new password</span>
        <input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={field} />
      </label>

      {state?.error && (
        <p className="flex items-start gap-2 text-sm text-[color:var(--color-danger,#c0392b)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="flex items-start gap-2 text-sm text-cobalt">
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.ok}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-cobalt px-5 font-medium text-white transition-colors hover:bg-[var(--color-cobalt-ink)] disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <KeyRound className="h-4 w-4" aria-hidden="true" />}
        Change password
      </button>
    </form>
  );
}
