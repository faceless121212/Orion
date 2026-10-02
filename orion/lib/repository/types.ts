import type {
  AgentRecord,
  AgentSummary,
  AgentValues,
  CompanySettings,
  DriveConnection,
  DriveFile,
  KnowledgeFile,
  Mission,
  MissionValues,
  Profile,
  SquadMember,
  UsageEvent,
  WorkspaceUser,
} from "@/lib/domain/types";

export type AvatarUpload = { bytes: Uint8Array; contentType: string };

export type WriteFailure = {
  ok: false;
  reason: "conflict" | "not_found" | "invalid" | "unavailable" | "error";
  message?: string;
};

export type WriteResult<T = undefined> = { ok: true; value: T } | WriteFailure;

export const ok = <T = undefined>(value?: T): WriteResult<T> => ({ ok: true, value: value as T });

export const fail = (reason: WriteFailure["reason"], message?: string): WriteFailure => ({
  ok: false,
  reason,
  message,
});

/**
 * Data access for every screen. Callers must authorize first (requireUser /
 * requireAdmin); implementations enforce ownership using the ids they are
 * given, and the Supabase implementation adds row-level security on top.
 */
export type Repository = {
  // Profiles
  getProfile(id: string): Promise<Profile | null>;
  updateProfile(id: string, values: { fullName: string; jobTitle: string }): Promise<WriteResult>;
  updateAvatar(id: string, avatar: AvatarUpload | null): Promise<WriteResult>;
  listUsers(): Promise<WorkspaceUser[]>;

  // Company
  getCompanySettings(): Promise<CompanySettings>;
  saveCompanySettings(values: CompanySettings, updatedBy: string): Promise<WriteResult>;

  // Agents
  listAgents(): Promise<AgentSummary[]>;
  getAgent(id: string): Promise<AgentRecord | null>;
  createAgent(values: AgentValues, createdBy: string): Promise<WriteResult<{ id: string }>>;
  updateAgent(id: string, values: AgentValues): Promise<WriteResult>;

  // Squads
  listSquad(userId: string): Promise<SquadMember[]>;
  assignAgent(userId: string, agentId: string, assignedBy: string): Promise<WriteResult>;
  removeAssignment(userId: string, agentId: string): Promise<WriteResult>;
  updateInstructions(userId: string, agentId: string, instructions: string): Promise<WriteResult>;

  // Missions
  listMissions(userId: string): Promise<Mission[]>;
  getMission(userId: string, id: string): Promise<Mission | null>;
  createMission(userId: string, values: MissionValues): Promise<WriteResult<{ id: string }>>;
  updateMission(userId: string, id: string, values: MissionValues): Promise<WriteResult>;
  deleteMission(userId: string, id: string): Promise<WriteResult>;
  runMission(userId: string, id: string): Promise<WriteResult>;

  // Usage
  listUsage(filter: { userId?: string; since?: string }): Promise<UsageEvent[]>;
  recordPromptGeneration(
    userId: string,
    usage: { model: string; inputTokens: number; outputTokens: number },
  ): Promise<void>;

  // Google Drive and knowledge
  getDriveConnection(): Promise<DriveConnection>;
  connectDrive(): Promise<WriteResult>;
  disconnectDrive(): Promise<WriteResult>;
  listDriveFiles(): Promise<DriveFile[]>;
  listKnowledge(agentId: string): Promise<KnowledgeFile[]>;
  attachKnowledge(agentId: string, fileIds: string[]): Promise<WriteResult>;
  detachKnowledge(agentId: string, fileId: string): Promise<WriteResult>;
};
