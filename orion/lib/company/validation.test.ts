import { describe, expect, it } from "vitest";

import {
  companySettingsSchema,
  emptyCompanySettings,
  hasCompanyContext,
} from "@/lib/company/validation";

describe("companySettingsSchema", () => {
  it("requires a company name", () => {
    const result = companySettingsSchema.safeParse(emptyCompanySettings);

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.companyName).toEqual(["Enter the company name."]);
  });

  it("rejects an overview beyond 4,000 characters", () => {
    const result = companySettingsSchema.safeParse({
      ...emptyCompanySettings,
      companyName: "Acme",
      overview: "x".repeat(4001),
    });

    expect(result.success).toBe(false);
  });
});

describe("hasCompanyContext", () => {
  it("is false until any field has content", () => {
    expect(hasCompanyContext(emptyCompanySettings)).toBe(false);
    expect(hasCompanyContext({ ...emptyCompanySettings, brandVoice: "Warm" })).toBe(true);
  });
});

describe("Orion demo company context", () => {
  it("fits the Company page limits", async () => {
    const { orionCompanyContext } = await import("@/lib/demo/orion-context");

    expect(companySettingsSchema.safeParse(orionCompanyContext).success).toBe(true);
  });
});
