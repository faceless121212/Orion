import type { AgentIcon } from "@/lib/agents/catalog";
import type {
  DriveConnection,
  DriveFileKind,
  KnowledgeFile,
  Mission,
  MissionStatus,
  OutputFormat,
  UsageEvent,
  UsageEventType,
} from "@/lib/domain/types";

export const missionColumns =
  "id,user_id,agent_id,title,brief,web_search,output_format,status,output_url,output_text,error,created_at,updated_at,started_at,completed_at,agents(name,icon)";

export type MissionRow = {
  id: string;
  user_id: string;
  agent_id: string;
  title: string;
  brief: string;
  web_search: boolean;
  output_format: string;
  status: string;
  output_url: string | null;
  output_text: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  agents: { name: string; icon: string } | null;
};

export function toMission(row: MissionRow): Mission {
  return {
    id: row.id,
    userId: row.user_id,
    agentId: row.agent_id,
    // RLS hides agents the viewer can no longer use; keep the mission readable.
    agentName: row.agents?.name ?? "Unavailable agent",
    agentIcon: (row.agents?.icon ?? "bot") as AgentIcon,
    title: row.title,
    brief: row.brief,
    webSearch: row.web_search,
    outputFormat: row.output_format as OutputFormat,
    status: row.status as MissionStatus,
    outputUrl: row.output_url,
    outputText: row.output_text,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

export const usageColumns =
  "id,user_id,agent_id,mission_id,event_type,model,input_tokens,output_tokens,cost_usd,created_at,profiles(full_name),agents(name)";

export type UsageRow = {
  id: string;
  user_id: string;
  agent_id: string | null;
  mission_id: string | null;
  event_type: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number | string;
  created_at: string;
  profiles: { full_name: string } | null;
  agents: { name: string } | null;
};

export function toUsageEvent(row: UsageRow): UsageEvent {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.profiles?.full_name ?? "Unknown user",
    agentId: row.agent_id,
    agentName: row.agent_id ? (row.agents?.name ?? "Deleted agent") : null,
    missionId: row.mission_id,
    eventType: row.event_type as UsageEventType,
    model: row.model,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    // numeric columns arrive as strings from PostgREST.
    costUsd: Number(row.cost_usd),
    createdAt: row.created_at,
  };
}

export type IntegrationRow = {
  status: string;
  account_email: string | null;
  connected_at: string | null;
} | null;

export function toDriveConnection(row: IntegrationRow): DriveConnection {
  return row?.status === "connected" && row.account_email && row.connected_at
    ? { status: "connected", accountEmail: row.account_email, connectedAt: row.connected_at }
    : { status: "disconnected" };
}

export type KnowledgeRow = {
  file_id: string;
  name: string;
  kind: string;
  modified_at: string | null;
  size_bytes: number | null;
  attached_at: string;
};

export function toKnowledgeFile(row: KnowledgeRow): KnowledgeFile {
  return {
    id: row.file_id,
    name: row.name,
    kind: row.kind as DriveFileKind,
    modifiedAt: row.modified_at ?? row.attached_at,
    sizeBytes: row.size_bytes ?? 0,
    attachedAt: row.attached_at,
  };
}

const avatarExtensions: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Storage path inside the avatars bucket; the first folder must be the user id. */
export function avatarObjectPath(userId: string, contentType: string, now = Date.now()) {
  const extension = avatarExtensions[contentType];
  return extension ? `${userId}/avatar-${now}.${extension}` : null;
}
