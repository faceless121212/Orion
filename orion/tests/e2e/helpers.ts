import { createClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";

import { readE2ECredentials } from "./credentials";

export async function signInAs(page: Page, role: "admin" | "user") {
  const credentials = readE2ECredentials(process.env)[role];

  await page.goto("/login");
  await page.getByLabel("Work email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/missions/);
}

export async function signedInClient(role: "admin" | "user") {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase public E2E environment is not configured.");
  }

  const supabase = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword(
    readE2ECredentials(process.env)[role],
  );

  if (error || !data.user) {
    throw new Error(`Unable to sign in the E2E ${role} account.`);
  }

  return { supabase, userId: data.user.id };
}

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
