import { describe, expect, it } from "vitest";

import { missionSchema } from "@/lib/missions/validation";
import { validateAvatar } from "@/lib/profile/validation";

const valid = {
  agentId: "10000000-0000-4000-8000-000000000001",
  title: "Proposal",
  brief: "Write a proposal for a three-location physio clinic.",
  outputFormat: "pdf",
};

describe("missionSchema", () => {
  it("reads the web search checkbox", () => {
    expect(missionSchema.parse({ ...valid, webSearch: "on" }).webSearch).toBe(true);
    expect(missionSchema.parse(valid).webSearch).toBe(false);
  });

  it("requires an agent, a real brief, and a supported format", () => {
    const result = missionSchema.safeParse({ ...valid, agentId: "", brief: "short", outputFormat: "pptx" });

    expect(result.success).toBe(false);
    expect(Object.keys(result.error!.flatten().fieldErrors).sort()).toEqual(["agentId", "brief", "outputFormat"]);
  });
});

describe("validateAvatar", () => {
  it("accepts small images and rejects other files", () => {
    expect(validateAvatar({ size: 5000, type: "image/png" })).toBeNull();
    expect(validateAvatar({ size: 5000, type: "image/svg+xml" })).toMatch(/PNG/);
    expect(validateAvatar({ size: 2_000_000, type: "image/jpeg" })).toMatch(/1 MB/);
    expect(validateAvatar({ size: 0, type: "image/png" })).toMatch(/Choose/);
  });
});

describe("safeOutputUrl", () => {
  it("allows relative and https links only", async () => {
    const { safeOutputUrl } = await import("@/lib/missions/presentation");

    expect(safeOutputUrl("/missions/1/output")).toBe("/missions/1/output");
    expect(safeOutputUrl("https://docs.google.com/document/d/abc")).toBe("https://docs.google.com/document/d/abc");
    expect(safeOutputUrl("javascript:alert(1)")).toBeNull();
    expect(safeOutputUrl("http://example.com")).toBeNull();
    expect(safeOutputUrl("//evil.com")).toBeNull();
    expect(safeOutputUrl("/\\evil.com")).toBeNull();
    expect(safeOutputUrl(null)).toBeNull();
  });
});
