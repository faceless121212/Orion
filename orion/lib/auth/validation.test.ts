import { describe, expect, it } from "vitest";

import { loginSchema, registrationSchema } from "@/lib/auth/validation";

describe("registrationSchema", () => {
  const validRegistration = {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  it("accepts a complete registration", () => {
    expect(registrationSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("rejects passwords that do not match", () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      confirmPassword: "DifferentPass123!",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.confirmPassword).toContain(
      "Passwords do not match.",
    );
  });

  it("rejects weak passwords", () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      password: "password",
      confirmPassword: "password",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toEqual(
      expect.arrayContaining([
        "Use at least one uppercase letter.",
        "Use at least one number.",
        "Use at least one special character.",
      ]),
    );
  });
});

describe("loginSchema", () => {
  it("normalizes email whitespace and case", () => {
    const result = loginSchema.parse({
      email: "  ADA@EXAMPLE.COM ",
      password: "SecurePass123!",
    });

    expect(result.email).toBe("ada@example.com");
  });
});
