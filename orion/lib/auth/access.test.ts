import { describe, expect, it } from "vitest";

import { canAccessRoute, getNavigation } from "@/lib/auth/access";

describe("role-aware navigation", () => {
  it("shows every route to administrators", () => {
    expect(getNavigation("admin").map((item) => item.href)).toEqual([
      "/missions",
      "/squad",
      "/usage",
      "/agents",
      "/company",
      "/users",
      "/integrations",
      "/settings",
    ]);
  });

  it("hides administrative routes from regular users", () => {
    expect(getNavigation("user").map((item) => item.href)).toEqual([
      "/missions",
      "/squad",
      "/usage",
      "/settings",
    ]);
  });
});

describe("server route authorization", () => {
  it.each(["/agents", "/company", "/users", "/integrations"])(
    "denies a regular user access to %s",
    (pathname) => {
      expect(canAccessRoute("user", pathname)).toBe(false);
    },
  );

  it("allows an administrator to access admin routes", () => {
    expect(canAccessRoute("admin", "/users")).toBe(true);
    expect(canAccessRoute("admin", "/agents/new")).toBe(true);
  });

  it("denies a regular user access to nested admin routes", () => {
    expect(canAccessRoute("user", "/agents/new")).toBe(false);
    expect(canAccessRoute("user", "/users/00000000-0000-4000-8000-000000000000")).toBe(false);
  });

  it("allows both roles to access employee routes", () => {
    expect(canAccessRoute("admin", "/missions")).toBe(true);
    expect(canAccessRoute("user", "/missions")).toBe(true);
    expect(canAccessRoute("user", "/squad")).toBe(true);
  });
});
