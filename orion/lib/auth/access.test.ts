import { describe, expect, it } from "vitest";

import { canAccessRoute, getNavigation } from "@/lib/auth/access";

describe("role-aware navigation", () => {
  it("shows every Phase 1 route to administrators", () => {
    expect(getNavigation("admin").map((item) => item.href)).toEqual([
      "/missions",
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
  });

  it("allows both roles to access employee routes", () => {
    expect(canAccessRoute("admin", "/missions")).toBe(true);
    expect(canAccessRoute("user", "/missions")).toBe(true);
  });
});
