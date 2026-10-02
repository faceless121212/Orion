"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthActionState } from "@/lib/auth/action-state";
import { isRegistrationAllowed } from "@/lib/auth/registration-access";
import { registerWithPassword } from "@/lib/auth/service";
import { loginSchema, registrationSchema } from "@/lib/auth/validation";
import { demoRepository } from "@/lib/demo/repository";
import { DEMO_USER_COOKIE, isDemoMode } from "@/lib/demo/mode";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function fieldsFrom(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registrationSchema.safeParse(fieldsFrom(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (
    !isRegistrationAllowed(
      parsed.data.email,
      process.env.REGISTRATION_ALLOWED_EMAILS,
    )
  ) {
    return {
      status: "error",
      message: "Registration is not available for this email.",
    };
  }

  const supabase = await createClient();
  const env = getPublicEnv();
  const result = await registerWithPassword(
    supabase.auth,
    parsed.data,
    `${env.appUrl}/auth/confirm`,
  );

  if (result.status === "error") {
    return { status: "error", message: result.message };
  }

  if (result.status === "confirm-email") {
    return {
      status: "confirm-email",
      message: "Check your inbox to confirm your email, then sign in.",
    };
  }

  redirect("/missions");
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(fieldsFrom(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid email and password.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { status: "error", message: "Email or password is incorrect." };
  }

  redirect("/missions");
}

export async function logoutAction() {
  if (isDemoMode()) {
    (await cookies()).delete(DEMO_USER_COOKIE);
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function isSafeRedirect(value: FormDataEntryValue | null): value is string {
  // Same-origin paths only; browsers treat "\\" like "/", so "/\\evil.com" is external.
  return typeof value === "string" && /^\/(?![/\\])/.test(value) && !value.includes("\\");
}

/** Demo mode only: sign in as one of the seeded personas. */
export async function demoSignInAction(formData: FormData) {
  if (!isDemoMode()) {
    throw new Error("Demo sign-in is disabled.");
  }

  const userId = formData.get("userId");
  const profile = typeof userId === "string" ? await demoRepository.getProfile(userId) : null;

  if (!profile) {
    redirect("/login");
  }

  (await cookies()).set(DEMO_USER_COOKIE, profile.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  const next = formData.get("next");
  redirect(isSafeRedirect(next) ? next : "/missions");
}
