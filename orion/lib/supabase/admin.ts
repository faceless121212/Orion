import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env";

/**
 * Service-role client for server-only writes that RLS deliberately blocks for
 * users (usage events, mission runtime). Returns null when not configured.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key || key.startsWith("replace_")) {
    return null;
  }

  return createClient(getPublicEnv().supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
