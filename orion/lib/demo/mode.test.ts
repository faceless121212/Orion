import { describe, expect, it } from "vitest";

import { isDemoMode } from "@/lib/demo/mode";

describe("isDemoMode", () => {
  it("turns on only with ORION_DEMO=1 outside production", () => {
    expect(isDemoMode({ ORION_DEMO: "1", NODE_ENV: "development" })).toBe(true);
    expect(isDemoMode({ ORION_DEMO: "1", NODE_ENV: "production" })).toBe(false);
    expect(isDemoMode({ ORION_DEMO: "true", NODE_ENV: "development" })).toBe(false);
    expect(isDemoMode({ NODE_ENV: "development" })).toBe(false);
  });
});
