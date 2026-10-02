import { describe, expect, it } from "vitest";

import type { UsageEvent } from "@/lib/domain/types";
import { breakdownBy, dailyUsage, summarizeUsage } from "@/lib/usage/summary";

const event = (overrides: Partial<UsageEvent>): UsageEvent => ({
  id: "e",
  userId: "u1",
  userName: "Ada",
  agentId: "a1",
  agentName: "Writer",
  missionId: null,
  eventType: "mission_run",
  model: "claude-opus-5",
  inputTokens: 100,
  outputTokens: 50,
  costUsd: 1,
  createdAt: "2026-09-29T09:00:00.000Z",
  ...overrides,
});

describe("usage summaries", () => {
  const events = [
    event({ id: "1" }),
    event({ id: "2", agentId: "a2", agentName: "Analyst", costUsd: 3, createdAt: "2026-09-27T12:00:00.000Z" }),
    event({ id: "3", eventType: "prompt_generation", agentId: null, agentName: null, costUsd: 0.5 }),
  ];

  it("totals tokens, cost, and missions", () => {
    expect(summarizeUsage(events)).toEqual({ events: 3, missions: 2, tokens: 450, costUsd: 4.5 });
  });

  it("groups by a key and sorts by cost", () => {
    const rows = breakdownBy(events, (item) => ({ key: item.agentId ?? "prompt", label: item.agentName ?? "Prompt" }));

    expect(rows.map((row) => [row.label, row.costUsd])).toEqual([
      ["Analyst", 3],
      ["Writer", 1],
      ["Prompt", 0.5],
    ]);
  });

  it("buckets by UTC day including empty days", () => {
    const days = dailyUsage(events, 3, Date.parse("2026-09-29T18:00:00.000Z"));

    expect(days).toEqual([
      { date: "2026-09-27", tokens: 150, costUsd: 3 },
      { date: "2026-09-28", tokens: 0, costUsd: 0 },
      { date: "2026-09-29", tokens: 300, costUsd: 1.5 },
    ]);
  });
});
