import { z } from "zod";

type PublicEnvSource = Record<string, string | undefined>;

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Orion"),
  NEXT_PUBLIC_APP_URL: z.url(),
});

export function readPublicEnv(source: PublicEnvSource) {
  const result = publicEnvSchema.safeParse(source);

  if (
    !result.success ||
    result.data.NEXT_PUBLIC_SUPABASE_URL === "placeholder" ||
    result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY === "placeholder"
  ) {
    throw new Error(
      "Supabase environment variables are not configured. Update .env.local.",
    );
  }

  return {
    supabaseUrl: result.data.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey:
      result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    appName: result.data.NEXT_PUBLIC_APP_NAME,
    appUrl: result.data.NEXT_PUBLIC_APP_URL,
  };
}

export function getPublicEnv() {
  return readPublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}
