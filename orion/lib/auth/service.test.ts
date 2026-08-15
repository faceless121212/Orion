import { describe, expect, it } from "vitest";

import { registerWithPassword } from "@/lib/auth/service";

describe("registerWithPassword", () => {
  it("passes normalized credentials and profile metadata to Supabase", async () => {
    const calls: unknown[] = [];
    const auth = {
      signUp: async (payload: unknown) => {
        calls.push(payload);
        return { data: { session: null }, error: null };
      },
    };

    const result = await registerWithPassword(
      auth,
      {
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      },
      "http://localhost:3000/auth/confirm",
    );

    expect(calls).toEqual([
      {
        email: "ada@example.com",
        password: "SecurePass123!",
        options: {
          data: { full_name: "Ada Lovelace" },
          emailRedirectTo: "http://localhost:3000/auth/confirm",
        },
      },
    ]);
    expect(result).toEqual({ status: "confirm-email" });
  });

  it("does not expose provider signup details to the browser", async () => {
    const auth = {
      signUp: async () => ({
        data: { session: null },
        error: { message: "User already registered" },
      }),
    };

    await expect(
      registerWithPassword(
        auth,
        {
          fullName: "Ada Lovelace",
          email: "ada@example.com",
          password: "SecurePass123!",
          confirmPassword: "SecurePass123!",
        },
        "http://localhost:3000/auth/confirm",
      ),
    ).resolves.toEqual({
      status: "error",
      message: "Unable to create this account.",
    });
  });
});
