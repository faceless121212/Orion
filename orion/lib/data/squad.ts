import "server-only";

import type { AgentIcon } from "@/lib/agents/catalog";
import { createClient } from "@/lib/supabase/server";

export type SquadMember = {
  agentId: string;
  name: string;
  description: string;
  model: string;
  icon: AgentIcon;
  status: "active" | "archived";
  customInstructions: string;
};

type SquadRow = {
  agent_id: string;
  custom_instructions: string;
  agents: {
    name: string;
    description: string;
    model: string;
    icon: string;
    status: string;
  } | null;
};

/**
 * Agents assigned to a user. For employees, RLS hides archived agents, so
 * their assignments come back with a null agent and are skipped.
 */
export async function listSquad(userId: string): Promise<SquadMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_agents")
    .select("agent_id,custom_instructions,agents(name,description,model,icon,status)")
    .eq("user_id", userId)
    .order("created_at");

  if (error) {
    throw new Error("Unable to load squad.");
  }

  return (data as unknown as SquadRow[]).flatMap((row) =>
    row.agents
      ? [
          {
            agentId: row.agent_id,
            name: row.agents.name,
            description: row.agents.description,
            model: row.agents.model,
            icon: row.agents.icon as AgentIcon,
            status: row.agents.status as SquadMember["status"],
            customInstructions: row.custom_instructions,
          },
        ]
      : [],
  );
}
