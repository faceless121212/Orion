import { describe, expect, it } from "vitest";

import { readPublicEnv } from "@/lib/env";

describe("readPublicEnv", () => {
  it("returns configured public application values", () => {
    expect(
      readPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
        NEXT_PUBLIC_APP_NAME: "Orion",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      }),
    ).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabasePublishableKey: "sb_publishable_test",
      appName: "Orion",
      appUrl: "http://localhost:3000",
    });
  });

  it("rejects placeholder credentials", () => {
    expect(() =>
      readPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "placeholder",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "placeholder",
        NEXT_PUBLIC_APP_NAME: "Orion",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      }),
    ).toThrow("Supabase environment variables are not configured");
  });
});
