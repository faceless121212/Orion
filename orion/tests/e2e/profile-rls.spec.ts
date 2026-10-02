import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import { readE2ECredentials } from "./credentials";

function createTestClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase public E2E environment is not configured.");
  }

  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

test("a regular user can read only their own profile", async () => {
  const credentials = readE2ECredentials(process.env);
  const supabase = createTestClient();
  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword(credentials.user);

  expect(signInError).toBeNull();
  expect(authData.user).not.toBeNull();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id,role");

  expect(error).toBeNull();
  expect(profiles).toEqual([{ id: authData.user!.id, role: "user" }]);
});

test("a regular user cannot promote their own profile", async () => {
  const credentials = readE2ECredentials(process.env);
  const supabase = createTestClient();
  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword(credentials.user);

  expect(signInError).toBeNull();
  expect(authData.user).not.toBeNull();

  const { data: updatedProfiles, error: updateError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", authData.user!.id)
    .select("id,role");

  // Before the workspace-data migration RLS filtered the update to zero rows;
  // after it, the missing column grant rejects it outright. Either blocks it.
  expect(updateError?.code === "42501" || (updatedProfiles ?? []).length === 0).toBe(true);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("id", authData.user!.id)
    .single();

  expect(error).toBeNull();
  expect(profile).toEqual({ id: authData.user!.id, role: "user" });
});

test("an administrator can read workspace profiles", async () => {
  const credentials = readE2ECredentials(process.env);
  const supabase = createTestClient();
  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword(credentials.admin);

  expect(signInError).toBeNull();
  expect(authData.user).not.toBeNull();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id,role");

  expect(error).toBeNull();
  expect(profiles).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: authData.user!.id, role: "admin" }),
      expect.objectContaining({ role: "user" }),
    ]),
  );
});
