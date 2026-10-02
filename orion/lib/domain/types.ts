import type { AgentIcon, AgentStatus } from "@/lib/agents/catalog";
import type { AppRole } from "@/lib/auth/access";
import type { CompanySettings } from "@/lib/company/validation";

export type { CompanySettings };

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  jobTitle: string;
  avatarUrl: string | null;
};

export type AgentRecord = {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  icon: AgentIcon;
  status: AgentStatus;
  updatedAt: string;
};

export type AgentSummary = Omit<AgentRecord, "systemPrompt"> & { assignedCount: number };

export type AgentValues = Omit<AgentRecord, "id" | "updatedAt">;

export type SquadMember = {
  agentId: string;
  name: string;
  description: string;
  model: string;
  icon: AgentIcon;
  status: AgentStatus;
  customInstructions: string;
};

export type WorkspaceUser = Profile & { squadSize: number };

export const missionStatuses = ["queued", "in_progress", "completed", "failed"] as const;
export type MissionStatus = (typeof missionStatuses)[number];

export const outputFormats = ["google_doc", "google_sheet", "pdf"] as const;
export type OutputFormat = (typeof outputFormats)[number];

export type Mission = {
  id: string;
  userId: string;
  agentId: string;
  agentName: string;
  agentIcon: AgentIcon;
  title: string;
  brief: string;
  webSearch: boolean;
  outputFormat: OutputFormat;
  status: MissionStatus;
  outputUrl: string | null;
  outputText: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type MissionValues = {
  agentId: string;
  title: string;
  brief: string;
  webSearch: boolean;
  outputFormat: OutputFormat;
};

export const usageEventTypes = ["mission_run", "prompt_generation"] as const;
export type UsageEventType = (typeof usageEventTypes)[number];

export type UsageEvent = {
  id: string;
  userId: string;
  userName: string;
  agentId: string | null;
  agentName: string | null;
  missionId: string | null;
  eventType: UsageEventType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  createdAt: string;
};

export type DriveConnection =
  | { status: "disconnected" }
  | { status: "connected"; accountEmail: string; connectedAt: string };

export const driveFileKinds = ["doc", "sheet", "pdf", "docx", "txt", "csv"] as const;
export type DriveFileKind = (typeof driveFileKinds)[number];

export type DriveFile = {
  id: string;
  name: string;
  kind: DriveFileKind;
  modifiedAt: string;
  sizeBytes: number;
};

export type KnowledgeFile = DriveFile & { attachedAt: string };

/** Thrown by a repository when a feature has no backend yet. */
export class FeatureUnavailableError extends Error {
  constructor(feature: string) {
    super(`${feature} is not available until its backend ships. Run Orion in demo mode to preview it.`);
    this.name = "FeatureUnavailableError";
  }
}
