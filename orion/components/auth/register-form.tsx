"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction } from "@/app/(auth)/actions";
import { FieldError } from "@/components/auth/field-error";
import { initialAuthState } from "@/lib/auth/action-state";

const inputClassName =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialAuthState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <div
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.status === "confirm-email"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="fullName">
          Full name
        </label>
        <input autoComplete="name" className={inputClassName} id="fullName" name="fullName" placeholder="Ada Lovelace" required />
        <FieldError messages={state.errors?.fullName} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Work email
        </label>
        <input autoComplete="email" className={inputClassName} id="email" name="email" placeholder="you@company.com" required type="email" />
        <FieldError messages={state.errors?.email} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
          <input autoComplete="new-password" className={inputClassName} id="password" minLength={8} name="password" required type="password" />
          <FieldError messages={state.errors?.password} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirm password</label>
          <input autoComplete="new-password" className={inputClassName} id="confirmPassword" minLength={8} name="confirmPassword" required type="password" />
          <FieldError messages={state.errors?.confirmPassword} />
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Use at least 8 characters with an uppercase letter, number, and special character.
      </p>

      <button className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-blue-600 hover:text-blue-700" href="/login">Sign in</Link>
      </p>
    </form>
  );
}
