"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/app/(auth)/actions";
import { FieldError } from "@/components/auth/field-error";
import { initialAuthState } from "@/lib/auth/action-state";

const inputClassName =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function LoginForm({
  confirmationFailed = false,
  profileUnavailable = false,
}: {
  confirmationFailed?: boolean;
  profileUnavailable?: boolean;
}) {
  const [state, formAction, pending] = useActionState(loginAction, initialAuthState);

  return (
    <form action={formAction} className="space-y-5">
      {confirmationFailed ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          That confirmation link is invalid or expired. Try signing in or create a new account.
        </div>
      ) : null}
      {profileUnavailable ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your account is valid, but its Orion profile is missing. Apply the
          profiles migration in Supabase, then sign in again.
        </div>
      ) : null}
      {state.message ? (
        <div aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">Work email</label>
        <input autoComplete="email" className={inputClassName} id="email" name="email" placeholder="you@company.com" required type="email" />
        <FieldError messages={state.errors?.email} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
        <input autoComplete="current-password" className={inputClassName} id="password" name="password" required type="password" />
        <FieldError messages={state.errors?.password} />
      </div>

      <button className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-slate-600">
        New to Orion?{" "}
        <Link className="font-semibold text-blue-600 hover:text-blue-700" href="/register">Create an account</Link>
      </p>
    </form>
  );
}
