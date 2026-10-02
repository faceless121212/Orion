export const DEMO_USER_COOKIE = "orion_demo_user";

/**
 * Demo mode swaps Supabase for an in-memory store and a persona picker.
 * It never activates in production builds, so it cannot bypass real auth.
 */
export function isDemoMode(source: Record<string, string | undefined> = process.env) {
  return source.ORION_DEMO === "1" && source.NODE_ENV !== "production";
}
