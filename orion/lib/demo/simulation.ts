import { estimateCostUsd } from "@/lib/agents/catalog";
import type { DemoMission, DemoUsageEvent } from "@/lib/demo/seed";

/** How long a simulated mission run takes. */
export const DEMO_RUN_MS = 8_000;

/** Put this tag in a brief to make the simulated run fail (for trying retry). */
export const DEMO_FAIL_TAG = "#fail";

const formatLabels = {
  google_doc: "Google Doc",
  google_sheet: "Google Sheet",
  pdf: "PDF",
} as const;

export function composeDemoOutput(mission: Pick<DemoMission, "title" | "brief" | "outputFormat">, agentName: string) {
  if (mission.outputFormat === "google_sheet") {
    return [
      `${mission.title}`,
      "",
      "Item,Assumption,Q1,Q2,Q3,Q4",
      "Revenue,Based on current pipeline,120000,134000,151000,168000",
      "Costs,Headcount + tools,88000,91000,97000,102000",
      "Margin,Revenue − costs,32000,43000,54000,66000",
      "",
      `Prepared by ${agentName}. Assumptions are placeholders generated in demo mode.`,
    ].join("\n");
  }

  return [
    mission.title,
    "",
    "Summary",
    `This ${formatLabels[mission.outputFormat]} was drafted by ${agentName} from the brief below. In demo mode the content is illustrative; with the Phase 3 runtime it is written by the agent.`,
    "",
    "Brief",
    mission.brief,
    "",
    "Recommendations",
    "1. Confirm the goals and audience in the brief with the requester.",
    "2. Review the draft against company context and brand voice.",
    "3. Share the final version from Google Drive.",
  ].join("\n");
}

/**
 * Advances an in-progress demo mission once its run time has elapsed.
 * Returns the (possibly) updated mission and a usage event if it completed.
 */
export function settleDemoMission(
  mission: DemoMission,
  agent: { name: string; model: string },
  now: number,
  newId: () => string,
): { mission: DemoMission; usage?: DemoUsageEvent } {
  if (mission.status !== "in_progress" || !mission.startedAt) {
    return { mission };
  }

  const finishedAt = Date.parse(mission.startedAt) + DEMO_RUN_MS;

  if (now < finishedAt) {
    return { mission };
  }

  const completedAt = new Date(finishedAt).toISOString();
  const outputText = composeDemoOutput(mission, agent.name);

  if (mission.brief.toLowerCase().includes(DEMO_FAIL_TAG)) {
    return {
      mission: {
        ...mission,
        status: "failed",
        error: `Google Drive could not create the ${formatLabels[mission.outputFormat]} (simulated failure triggered by ${DEMO_FAIL_TAG}). The text result was kept.`,
        outputText,
        outputUrl: null,
        completedAt,
        updatedAt: completedAt,
      },
    };
  }

  const inputTokens = 4000 + mission.brief.length * 6;
  const outputTokens = 1800 + outputText.length;

  return {
    mission: {
      ...mission,
      status: "completed",
      error: null,
      outputText,
      outputUrl: `/missions/${mission.id}/output`,
      completedAt,
      updatedAt: completedAt,
    },
    usage: {
      id: newId(),
      userId: mission.userId,
      agentId: mission.agentId,
      missionId: mission.id,
      eventType: "mission_run",
      model: agent.model,
      inputTokens,
      outputTokens,
      costUsd: estimateCostUsd(agent.model, inputTokens, outputTokens),
      createdAt: completedAt,
    },
  };
}
