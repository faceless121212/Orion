import { randomUUID } from "node:crypto";

import { estimateCostUsd } from "@/lib/agents/catalog";
import { createSeed, type DemoMission, type DemoState } from "@/lib/demo/seed";
import { settleDemoMission } from "@/lib/demo/simulation";
import type { KnowledgeFile, Mission, UsageEvent } from "@/lib/domain/types";
import { fail, ok, type Repository } from "@/lib/repository/types";

const globalStore = globalThis as typeof globalThis & { __orionDemoState?: DemoState };

/** In-memory state shared across requests; survives dev hot reloads, resets on restart. */
export function demoState(): DemoState {
  globalStore.__orionDemoState ??= createSeed();
  return globalStore.__orionDemoState;
}

export function resetDemoState() {
  globalStore.__orionDemoState = createSeed();
}

const now = () => new Date().toISOString();
const clone = <T>(value: T): T => structuredClone(value);

function settleMissions(state: DemoState) {
  const time = Date.now();

  state.missions = state.missions.map((mission) => {
    const agent = state.agents.find((candidate) => candidate.id === mission.agentId);
    if (!agent) return mission;

    const result = settleDemoMission(mission, agent, time, randomUUID);
    if (result.usage) state.usage.push(result.usage);
    return result.mission;
  });
}

function toMission(state: DemoState, mission: DemoMission): Mission {
  const agent = state.agents.find((candidate) => candidate.id === mission.agentId);

  return clone({
    ...mission,
    agentName: agent?.name ?? "Deleted agent",
    agentIcon: agent?.icon ?? "bot",
  });
}

function isAssignedActive(state: DemoState, userId: string, agentId: string) {
  const agent = state.agents.find((candidate) => candidate.id === agentId);

  return Boolean(
    agent?.status === "active" &&
      state.assignments.some((row) => row.userId === userId && row.agentId === agentId),
  );
}

export const demoRepository: Repository = {
  async getProfile(id) {
    const profile = demoState().profiles.find((candidate) => candidate.id === id);
    return profile ? clone(profile) : null;
  },

  async updateProfile(id, values) {
    const profile = demoState().profiles.find((candidate) => candidate.id === id);
    if (!profile) return fail("not_found");

    profile.fullName = values.fullName;
    profile.jobTitle = values.jobTitle;
    return ok();
  },

  async updateAvatar(id, avatar) {
    const profile = demoState().profiles.find((candidate) => candidate.id === id);
    if (!profile) return fail("not_found");

    profile.avatarUrl = avatar
      ? `data:${avatar.contentType};base64,${Buffer.from(avatar.bytes).toString("base64")}`
      : null;
    return ok();
  },

  async listUsers() {
    const state = demoState();

    return clone(
      [...state.profiles]
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((profile) => ({
          ...profile,
          squadSize: state.assignments.filter((row) => row.userId === profile.id).length,
        })),
    );
  },

  async getCompanySettings() {
    return clone(demoState().company);
  },

  async saveCompanySettings(values) {
    demoState().company = clone(values);
    return ok();
  },

  async listAgents() {
    const state = demoState();

    return [...state.agents]
      .sort((a, b) => a.status.localeCompare(b.status) || a.name.localeCompare(b.name))
      .map((agent) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        model: agent.model,
        icon: agent.icon,
        status: agent.status,
        updatedAt: agent.updatedAt,
        assignedCount: state.assignments.filter((row) => row.agentId === agent.id).length,
      }));
  },

  async getAgent(id) {
    const agent = demoState().agents.find((candidate) => candidate.id === id);
    return agent ? clone(agent) : null;
  },

  async createAgent(values) {
    const state = demoState();

    if (state.agents.some((agent) => agent.name.toLowerCase() === values.name.toLowerCase())) {
      return fail("conflict");
    }

    const id = randomUUID();
    state.agents.push({ ...clone(values), id, updatedAt: now() });
    return ok({ id });
  },

  async updateAgent(id, values) {
    const state = demoState();
    const agent = state.agents.find((candidate) => candidate.id === id);
    if (!agent) return fail("not_found");

    if (
      state.agents.some(
        (other) => other.id !== id && other.name.toLowerCase() === values.name.toLowerCase(),
      )
    ) {
      return fail("conflict");
    }

    Object.assign(agent, clone(values), { updatedAt: now() });
    return ok();
  },

  async listSquad(userId) {
    const state = demoState();

    return state.assignments
      .filter((row) => row.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .flatMap((row) => {
        const agent = state.agents.find((candidate) => candidate.id === row.agentId);
        return agent
          ? [
              {
                agentId: agent.id,
                name: agent.name,
                description: agent.description,
                model: agent.model,
                icon: agent.icon,
                status: agent.status,
                customInstructions: row.customInstructions,
              },
            ]
          : [];
      });
  },

  async assignAgent(userId, agentId) {
    const state = demoState();
    const agent = state.agents.find((candidate) => candidate.id === agentId);

    if (!state.profiles.some((profile) => profile.id === userId)) return fail("not_found");
    if (agent?.status !== "active") return fail("invalid", "Only active agents can be assigned.");

    if (!state.assignments.some((row) => row.userId === userId && row.agentId === agentId)) {
      state.assignments.push({ userId, agentId, customInstructions: "", createdAt: now() });
    }
    return ok();
  },

  async removeAssignment(userId, agentId) {
    const state = demoState();
    state.assignments = state.assignments.filter(
      (row) => !(row.userId === userId && row.agentId === agentId),
    );
    return ok();
  },

  async updateInstructions(userId, agentId, instructions) {
    const state = demoState();

    if (!isAssignedActive(state, userId, agentId)) return fail("not_found");

    const row = state.assignments.find((candidate) => candidate.userId === userId && candidate.agentId === agentId)!;
    row.customInstructions = instructions;
    return ok();
  },

  async listMissions(userId) {
    const state = demoState();
    settleMissions(state);

    return state.missions
      .filter((mission) => mission.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((mission) => toMission(state, mission));
  },

  async getMission(userId, id) {
    const state = demoState();
    settleMissions(state);
    const mission = state.missions.find((candidate) => candidate.id === id && candidate.userId === userId);

    return mission ? toMission(state, mission) : null;
  },

  async createMission(userId, values) {
    const state = demoState();

    if (!isAssignedActive(state, userId, values.agentId)) {
      return fail("invalid", "Choose an agent from your squad.");
    }

    const id = randomUUID();
    const time = now();
    state.missions.push({
      id,
      userId,
      ...clone(values),
      status: "queued",
      outputUrl: null,
      outputText: null,
      error: null,
      createdAt: time,
      updatedAt: time,
      startedAt: null,
      completedAt: null,
    });
    return ok({ id });
  },

  async updateMission(userId, id, values) {
    const state = demoState();
    const mission = state.missions.find((candidate) => candidate.id === id && candidate.userId === userId);

    if (!mission) return fail("not_found");
    if (mission.status !== "queued" && mission.status !== "failed") {
      return fail("invalid", "Only queued or failed missions can be edited.");
    }
    if (!isAssignedActive(state, userId, values.agentId)) {
      return fail("invalid", "Choose an agent from your squad.");
    }

    Object.assign(mission, clone(values), { updatedAt: now() });
    return ok();
  },

  async deleteMission(userId, id) {
    const state = demoState();
    const mission = state.missions.find((candidate) => candidate.id === id && candidate.userId === userId);

    if (!mission) return fail("not_found");
    if (mission.status === "in_progress") return fail("invalid", "A running mission cannot be deleted.");

    state.missions = state.missions.filter((candidate) => candidate !== mission);
    return ok();
  },

  async runMission(userId, id) {
    const state = demoState();
    settleMissions(state);
    const mission = state.missions.find((candidate) => candidate.id === id && candidate.userId === userId);

    if (!mission) return fail("not_found");
    if (mission.status !== "queued" && mission.status !== "failed") {
      return fail("invalid", "This mission has already run.");
    }
    if (!isAssignedActive(state, userId, mission.agentId)) {
      return fail("invalid", "This agent is no longer in your squad.");
    }
    if (state.drive.status !== "connected") {
      return fail("unavailable", "Connect Google Drive on the Integrations page before running missions.");
    }

    const time = now();
    Object.assign(mission, {
      status: "in_progress",
      startedAt: time,
      completedAt: null,
      error: null,
      outputUrl: null,
      outputText: null,
      updatedAt: time,
    } satisfies Partial<DemoMission>);
    return ok();
  },

  async listUsage({ userId, since }) {
    const state = demoState();
    settleMissions(state);

    return state.usage
      .filter((event) => (!userId || event.userId === userId) && (!since || event.createdAt >= since))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(
        (event): UsageEvent => ({
          ...event,
          userName: state.profiles.find((profile) => profile.id === event.userId)?.fullName ?? "Removed user",
          agentName: event.agentId
            ? (state.agents.find((agent) => agent.id === event.agentId)?.name ?? "Deleted agent")
            : null,
        }),
      );
  },

  async recordPromptGeneration(userId, usage) {
    demoState().usage.push({
      id: randomUUID(),
      userId,
      agentId: null,
      missionId: null,
      eventType: "prompt_generation",
      ...usage,
      costUsd: estimateCostUsd(usage.model, usage.inputTokens, usage.outputTokens),
      createdAt: now(),
    });
  },

  async getDriveConnection() {
    return clone(demoState().drive);
  },

  async connectDrive() {
    demoState().drive = { status: "connected", accountEmail: "workspace@orion.demo", connectedAt: now() };
    return ok();
  },

  async disconnectDrive() {
    demoState().drive = { status: "disconnected" };
    return ok();
  },

  async listDriveFiles() {
    const state = demoState();
    if (state.drive.status !== "connected") return [];

    return clone([...state.driveFiles].sort((a, b) => a.name.localeCompare(b.name)));
  },

  async listKnowledge(agentId) {
    const state = demoState();

    return state.knowledge
      .filter((row) => row.agentId === agentId)
      .flatMap((row): KnowledgeFile[] => {
        const file = state.driveFiles.find((candidate) => candidate.id === row.fileId);
        return file ? [{ ...clone(file), attachedAt: row.attachedAt }] : [];
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async attachKnowledge(agentId, fileIds) {
    const state = demoState();

    if (!state.agents.some((agent) => agent.id === agentId)) return fail("not_found");
    if (state.drive.status !== "connected") return fail("unavailable", "Connect Google Drive first.");
    if (!fileIds.every((fileId) => state.driveFiles.some((file) => file.id === fileId))) {
      return fail("invalid", "One of the selected files is no longer in Drive.");
    }

    for (const fileId of fileIds) {
      if (!state.knowledge.some((row) => row.agentId === agentId && row.fileId === fileId)) {
        state.knowledge.push({ agentId, fileId, attachedAt: now() });
      }
    }
    return ok();
  },

  async detachKnowledge(agentId, fileId) {
    const state = demoState();
    if (!state.agents.some((agent) => agent.id === agentId)) return fail("not_found");

    state.knowledge = state.knowledge.filter((row) => !(row.agentId === agentId && row.fileId === fileId));
    return ok();
  },
};
