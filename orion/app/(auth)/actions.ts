"use server";

import { redirect } from "next/navigation";

import type { AuthActionState } from "@/lib/auth/action-state";
import { isRegistrationAllowed } from "@/lib/auth/registration-access";
import { registerWithPassword } from "@/lib/auth/service";
import { loginSchema, registrationSchema } from "@/lib/auth/validation";
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
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
