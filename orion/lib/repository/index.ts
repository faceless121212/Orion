import "server-only";

import { demoRepository } from "@/lib/demo/repository";
import { isDemoMode } from "@/lib/demo/mode";
import { supabaseRepository } from "@/lib/repository/supabase";
import type { Repository } from "@/lib/repository/types";

export function getRepository(): Repository {
  return isDemoMode() ? demoRepository : supabaseRepository;
}
