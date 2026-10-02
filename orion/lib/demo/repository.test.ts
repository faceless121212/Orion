import { beforeEach, describe, expect, it } from "vitest";

import { demoRepository, demoState, resetDemoState } from "@/lib/demo/repository";
import { demoUserIds } from "@/lib/demo/seed";

const { admin, priya, mei } = demoUserIds;
const financeAgent = "10000000-0000-4000-8000-000000000003";
const copyAgent = "10000000-0000-4000-8000-000000000004";
const archivedAgent = "10000000-0000-4000-8000-000000000005";
const missionValues = {
  agentId: copyAgent,
  title: "Launch email",
  brief: "Announce the reminders add-on to dental clinics.",
  webSearch: false,
  outputFormat: "google_doc" as const,
};

beforeEach(() => resetDemoState());

describe("demo missions", () => {
  it("creates missions only with an active agent from the user's squad", async () => {
    await expect(demoRepository.createMission(priya, missionValues)).resolves.toMatchObject({ ok: true });
    await expect(demoRepository.createMission(priya, { ...missionValues, agentId: financeAgent })).resolves.toMatchObject({ ok: false, reason: "invalid" });
    await expect(demoRepository.createMission(priya, { ...missionValues, agentId: archivedAgent })).resolves.toMatchObject({ ok: false, reason: "invalid" });
  });

  it("never exposes another user's mission", async () => {
    const created = await demoRepository.createMission(priya, missionValues);
    const id = created.ok ? created.value.id : "";

    await expect(demoRepository.getMission(mei, id)).resolves.toBeNull();
    await expect(demoRepository.runMission(mei, id)).resolves.toMatchObject({ ok: false, reason: "not_found" });
    await expect(demoRepository.deleteMission(mei, id)).resolves.toMatchObject({ ok: false, reason: "not_found" });
    expect((await demoRepository.listMissions(mei)).some((mission) => mission.id === id)).toBe(false);
  });

  it("runs queued missions once and requires Google Drive", async () => {
    const created = await demoRepository.createMission(priya, missionValues);
    const id = created.ok ? created.value.id : "";

    await demoRepository.disconnectDrive();
    await expect(demoRepository.runMission(priya, id)).resolves.toMatchObject({ ok: false, reason: "unavailable" });

    await demoRepository.connectDrive();
    await expect(demoRepository.runMission(priya, id)).resolves.toMatchObject({ ok: true });
    await expect(demoRepository.getMission(priya, id)).resolves.toMatchObject({ status: "in_progress" });
    await expect(demoRepository.runMission(priya, id)).resolves.toMatchObject({ ok: false, reason: "invalid" });
    await expect(demoRepository.updateMission(priya, id, missionValues)).resolves.toMatchObject({ ok: false, reason: "invalid" });
  });
});

describe("demo squads", () => {
  it("does not let users edit instructions for archived or unassigned agents", async () => {
    await expect(demoRepository.updateInstructions(priya, copyAgent, "Short")).resolves.toMatchObject({ ok: true });
    await expect(demoRepository.updateInstructions(priya, archivedAgent, "Short")).resolves.toMatchObject({ ok: false });
    await expect(demoRepository.updateInstructions(priya, financeAgent, "Short")).resolves.toMatchObject({ ok: false });
  });

  it("rejects duplicate agent names regardless of case", async () => {
    const agent = demoState().agents[0];
    const values = {
      name: agent.name.toUpperCase(),
      description: agent.description,
      model: agent.model,
      icon: agent.icon,
      status: agent.status,
      systemPrompt: agent.systemPrompt,
    };

    await expect(demoRepository.createAgent(values, admin)).resolves.toMatchObject({ ok: false, reason: "conflict" });
  });
});

describe("demo usage", () => {
  it("filters usage to one user when asked", async () => {
    const events = await demoRepository.listUsage({ userId: mei });

    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => event.userId === mei)).toBe(true);
  });
});
