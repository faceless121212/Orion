import { describe, expect, it } from "vitest";

import type { DemoMission } from "@/lib/demo/seed";
import { DEMO_RUN_MS, settleDemoMission } from "@/lib/demo/simulation";

const started = Date.parse("2026-09-29T10:00:00.000Z");
const agent = { name: "Proposal Writer", model: "claude-opus-5" };
const mission: DemoMission = {
  id: "20000000-0000-4000-8000-000000000099",
  userId: "00000000-0000-4000-8000-000000000001",
  agentId: "10000000-0000-4000-8000-000000000001",
  title: "Proposal",
  brief: "Write a proposal for a clinic.",
  webSearch: false,
  outputFormat: "google_doc",
  status: "in_progress",
  outputUrl: null,
  outputText: null,
  error: null,
  createdAt: new Date(started).toISOString(),
  updatedAt: new Date(started).toISOString(),
  startedAt: new Date(started).toISOString(),
  completedAt: null,
};

describe("settleDemoMission", () => {
  it("leaves a mission running until its run time has passed", () => {
    const result = settleDemoMission(mission, agent, started + DEMO_RUN_MS - 1, () => "id");

    expect(result.mission.status).toBe("in_progress");
    expect(result.usage).toBeUndefined();
  });

  it("completes with an output link and records a usage event", () => {
    const result = settleDemoMission(mission, agent, started + DEMO_RUN_MS, () => "usage-1");

    expect(result.mission).toMatchObject({
      status: "completed",
      outputUrl: `/missions/${mission.id}/output`,
      completedAt: new Date(started + DEMO_RUN_MS).toISOString(),
    });
    expect(result.usage).toMatchObject({ id: "usage-1", missionId: mission.id, eventType: "mission_run", model: "claude-opus-5" });
    expect(result.usage!.costUsd).toBeGreaterThan(0);
  });

  it("fails but keeps the text result when the brief asks for a failure", () => {
    const result = settleDemoMission({ ...mission, brief: "Test the retry path #fail" }, agent, started + DEMO_RUN_MS, () => "id");

    expect(result.mission.status).toBe("failed");
    expect(result.mission.outputText).toContain("Proposal");
    expect(result.mission.error).toMatch(/text result was kept/);
    expect(result.usage).toBeUndefined();
  });

  it("ignores missions that are not running", () => {
    const queued = { ...mission, status: "queued" as const, startedAt: null };

    expect(settleDemoMission(queued, agent, started + DEMO_RUN_MS * 2, () => "id").mission).toBe(queued);
  });
});
