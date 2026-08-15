import { describe, expect, it } from "vitest";

import { isRegistrationAllowed } from "@/lib/auth/registration-access";

describe("isRegistrationAllowed", () => {
  it("allows an explicitly invited email regardless of casing or whitespace", () => {
    expect(
      isRegistrationAllowed(
        "new.user@example.com",
        " owner@example.com, NEW.USER@example.com ",
      ),
    ).toBe(true);
  });

  it("denies registration when the email is not invited", () => {
    expect(
      isRegistrationAllowed("outsider@example.com", "owner@example.com"),
    ).toBe(false);
  });

  it("fails closed when no allow-list is configured", () => {
    expect(isRegistrationAllowed("owner@example.com", undefined)).toBe(false);
  });
});
