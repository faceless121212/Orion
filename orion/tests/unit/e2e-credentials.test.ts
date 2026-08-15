import { describe, expect, it } from "vitest";

import { readE2ECredentials } from "../e2e/credentials";

describe("readE2ECredentials", () => {
  it("returns both configured role accounts", () => {
    expect(
      readE2ECredentials({
        E2E_ADMIN_EMAIL: "admin@example.com",
        E2E_ADMIN_PASSWORD: "AdminPass123!",
        E2E_USER_EMAIL: "user@example.com",
        E2E_USER_PASSWORD: "UserPass123!",
      }),
    ).toEqual({
      admin: { email: "admin@example.com", password: "AdminPass123!" },
      user: { email: "user@example.com", password: "UserPass123!" },
    });
  });

  it("throws instead of silently skipping role tests when credentials are missing", () => {
    expect(() => readE2ECredentials({})).toThrow(
      "Authenticated E2E credentials are not configured",
    );
  });
});
