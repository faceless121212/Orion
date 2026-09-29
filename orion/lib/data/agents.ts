import "server-only";

import type { AgentIcon, AgentStatus } from "@/lib/agents/catalog";
import { createClient } from "@/lib/supabase/server";

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

type AgentRow = {
  id: string;
  name: string;
  description: string;
  model: string;
  system_prompt: string;
  icon: string;
  status: string;
  updated_at: string;
};

function toAgent(row: AgentRow): AgentRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    model: row.model,
    systemPrompt: row.system_prompt,
    icon: row.icon as AgentIcon,
    status: row.status as AgentStatus,
    updatedAt: row.updated_at,
  };
}

const agentColumns = "id,name,description,model,system_prompt,icon,status,updated_at";

export async function listAgents(): Promise<AgentSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select(`${agentColumns},user_agents(count)`)
    .order("status")
    .order("name");

  if (error) {
    throw new Error("Unable to load agents.");
  }

  return data.map((row) => {
    const agent = toAgent(row);
    const counts = row.user_agents as unknown as Array<{ count: number }>;

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      model: agent.model,
      icon: agent.icon,
      status: agent.status,
      updatedAt: agent.updatedAt,
      assignedCount: counts[0]?.count ?? 0,
    };
  });
}

export async function getAgent(id: string): Promise<AgentRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select(agentColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load this agent.");
  }

  return data ? toAgent(data) : null;
}
