import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DEMO_USER_COOKIE, isDemoMode } from "@/lib/demo/mode";
import type { Profile } from "@/lib/domain/types";
import { getRepository } from "@/lib/repository";
import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = Profile;

async function currentUserId() {
  if (isDemoMode()) {
    return (await cookies()).get(DEMO_USER_COOKIE)?.value ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  return error ? null : (data?.claims?.sub ?? null);
}

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const userId = await currentUserId();

  if (!userId) {
    return null;
  }

  const profile = await getRepository().getProfile(userId).catch(() => null);

  if (!profile) {
    redirect(isDemoMode() ? "/login" : "/login?error=profile-unavailable");
  }

  return profile;
});

export async function requireUser() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await requireUser();

  if (profile.role !== "admin") {
    redirect("/missions?error=forbidden");
  }

  return profile;
}
