import { describe, expect, it } from "vitest";

import {
  avatarObjectPath,
  toDriveConnection,
  toKnowledgeFile,
  toMission,
  toUsageEvent,
  type MissionRow,
  type UsageRow,
} from "@/lib/repository/supabase-mappers";

const missionRow: MissionRow = {
  id: "m1",
  user_id: "u1",
  agent_id: "a1",
  title: "Proposal",
  brief: "Write a proposal for a physio clinic.",
  web_search: true,
  output_format: "pdf",
  status: "queued",
  output_url: null,
  output_text: null,
  error: null,
  created_at: "2026-09-29T10:00:00Z",
  updated_at: "2026-09-29T10:00:00Z",
  started_at: null,
  completed_at: null,
  agents: { name: "Proposal Writer", icon: "pen" },
};

describe("supabase mappers", () => {
  it("maps missions and survives agents hidden by RLS", () => {
    expect(toMission(missionRow)).toMatchObject({ agentName: "Proposal Writer", agentIcon: "pen", webSearch: true, outputFormat: "pdf" });
    expect(toMission({ ...missionRow, agents: null })).toMatchObject({ agentName: "Unavailable agent", agentIcon: "bot" });
  });

  it("converts numeric cost strings and labels prompt generation", () => {
    const row: UsageRow = {
      id: "e1",
      user_id: "u1",
      agent_id: null,
      mission_id: null,
      event_type: "prompt_generation",
      model: "claude-opus-5",
      input_tokens: 1000,
      output_tokens: 500,
      cost_usd: "0.017500",
      created_at: "2026-09-29T10:00:00Z",
      profiles: { full_name: "Ada" },
      agents: null,
    };

    expect(toUsageEvent(row)).toMatchObject({ costUsd: 0.0175, agentName: null, userName: "Ada" });
  });

  it("treats missing or partial integration rows as disconnected", () => {
    expect(toDriveConnection(null)).toEqual({ status: "disconnected" });
    expect(toDriveConnection({ status: "connected", account_email: null, connected_at: null })).toEqual({ status: "disconnected" });
    expect(toDriveConnection({ status: "connected", account_email: "a@b.co", connected_at: "2026-09-01T00:00:00Z" })).toMatchObject({ status: "connected" });
  });

  it("fills knowledge defaults", () => {
    expect(
      toKnowledgeFile({ file_id: "f1", name: "Pricing", kind: "sheet", modified_at: null, size_bytes: null, attached_at: "2026-09-01T00:00:00Z" }),
    ).toMatchObject({ id: "f1", modifiedAt: "2026-09-01T00:00:00Z", sizeBytes: 0 });
  });

  it("builds avatar paths inside the user's folder for allowed types only", () => {
    expect(avatarObjectPath("u1", "image/png", 5)).toBe("u1/avatar-5.png");
    expect(avatarObjectPath("u1", "image/svg+xml")).toBeNull();
  });
});
