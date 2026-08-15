import { cache } from "react";
import { redirect } from "next/navigation";

import type { AppRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
};

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    redirect("/login?error=profile-unavailable");
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role as AppRole,
  };
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
