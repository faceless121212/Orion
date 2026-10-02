import { describe, expect, it } from "vitest";

import { agentModels } from "@/lib/agents/catalog";
import {
  agentSchema,
  assignmentSchema,
  instructionsSchema,
  promptBriefSchema,
} from "@/lib/agents/validation";

const validAgent = {
  name: "  Proposal Writer ",
  description: "Drafts client proposals.",
  model: "claude-opus-5",
  icon: "pen",
  status: "active",
  systemPrompt: "You are the company's proposal writer. Be precise.",
};

describe("agentSchema", () => {
  it("accepts a complete agent and trims text", () => {
    const result = agentSchema.parse(validAgent);

    expect(result.name).toBe("Proposal Writer");
  });

  it("accepts every catalog model", () => {
    for (const model of agentModels) {
      expect(agentSchema.safeParse({ ...validAgent, model: model.id }).success).toBe(true);
    }
  });

  it.each([
    ["model", "gpt-4"],
    ["icon", "skull"],
    ["status", "deleted"],
    ["name", "A"],
    ["systemPrompt", "too short"],
  ])("rejects an invalid %s", (field, value) => {
    const result = agentSchema.safeParse({ ...validAgent, [field]: value });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors).toHaveProperty(field);
  });
});

describe("promptBriefSchema", () => {
  it("requires a meaningful description before generating", () => {
    expect(promptBriefSchema.safeParse({ name: "Writer", description: "short" }).success).toBe(false);
    expect(
      promptBriefSchema.safeParse({ name: "Writer", description: "Writes weekly status reports." }).success,
    ).toBe(true);
  });
});

describe("assignment and instructions", () => {
  const id = "3b241101-e2bb-4255-8caf-4136c566a962";

  it("requires identifiers to be UUIDs", () => {
    expect(assignmentSchema.safeParse({ userId: id, agentId: id }).success).toBe(true);
    expect(assignmentSchema.safeParse({ userId: "1 or 1=1", agentId: id }).success).toBe(false);
  });

  it("limits personal instructions to 4,000 characters", () => {
    expect(instructionsSchema.safeParse({ agentId: id, customInstructions: "" }).success).toBe(true);
    expect(
      instructionsSchema.safeParse({ agentId: id, customInstructions: "x".repeat(4001) }).success,
    ).toBe(false);
  });
});

describe("seeded demo agents", () => {
  it("pass the same validation as the agent editor", async () => {
    const { createSeed } = await import("@/lib/demo/seed");

    for (const agent of createSeed(0).agents) {
      expect(agentSchema.safeParse(agent).success, agent.name).toBe(true);
    }
  });
});
