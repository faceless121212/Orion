import "server-only";

import type { AppRole } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  squadSize: number;
};

export async function listUsers(): Promise<WorkspaceUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,user_agents!user_agents_user_id_fkey(count)")
    .order("full_name");

  if (error) {
    throw new Error("Unable to load users.");
  }

  return data.map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role as AppRole,
    squadSize: (row.user_agents as unknown as Array<{ count: number }>)[0]?.count ?? 0,
  }));
}

export async function getUser(id: string): Promise<Omit<WorkspaceUser, "squadSize"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load this user.");
  }

  return data
    ? { id: data.id, email: data.email, fullName: data.full_name, role: data.role as AppRole }
    : null;
}
