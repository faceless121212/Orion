import "server-only";

import type { AgentIcon, AgentStatus } from "@/lib/agents/catalog";
import type { AppRole } from "@/lib/auth/access";
import { emptyCompanySettings } from "@/lib/company/validation";
import type { AgentRecord, SquadMember } from "@/lib/domain/types";
import { fail, ok, type Repository } from "@/lib/repository/types";
import { createClient } from "@/lib/supabase/server";

const UNIQUE_VIOLATION = "23505";
const agentColumns = "id,name,description,model,system_prompt,icon,status,updated_at";

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

function toAgentRow(values: Omit<AgentRecord, "id" | "updatedAt">) {
  return {
    name: values.name,
    description: values.description,
    model: values.model,
    icon: values.icon,
    status: values.status,
    system_prompt: values.systemPrompt,
  };
}

const firstCount = (value: unknown) => (value as Array<{ count: number }>)[0]?.count ?? 0;

const phase3 = (feature: string) => fail("unavailable", `${feature} arrives with the Phase 3 backend. Run Orion with ORION_DEMO=1 to preview it.`);

/** Supabase-backed data access; row-level security is the second authorization layer. */
export const supabaseRepository: Repository = {
  async getProfile(id) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,role")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error("Unable to load this profile.");

    return data
      ? {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role as AppRole,
          jobTitle: "",
          avatarUrl: null,
        }
      : null;
  },

  async updateProfile() {
    return phase3("Profile editing");
  },

  async updateAvatar() {
    return phase3("Avatar upload");
  },

  async listUsers() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,user_agents!user_agents_user_id_fkey(count)")
      .order("full_name");

    if (error) throw new Error("Unable to load users.");

    return data.map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role as AppRole,
      jobTitle: "",
      avatarUrl: null,
      squadSize: firstCount(row.user_agents),
    }));
  },

  async getCompanySettings() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("company_settings")
      .select("company_name,overview,audience,brand_voice,writing_guidelines")
      .maybeSingle();

    if (error) throw new Error("Unable to load company context.");
    if (!data) return emptyCompanySettings;

    return {
      companyName: data.company_name,
      overview: data.overview,
      audience: data.audience,
      brandVoice: data.brand_voice,
      writingGuidelines: data.writing_guidelines,
    };
  },

  async saveCompanySettings(values, updatedBy) {
    const supabase = await createClient();
    const { error } = await supabase.from("company_settings").upsert({
      id: true,
      company_name: values.companyName,
      overview: values.overview,
      audience: values.audience,
      brand_voice: values.brandVoice,
      writing_guidelines: values.writingGuidelines,
      updated_by: updatedBy,
    });

    return error ? fail("error") : ok();
  },

  async listAgents() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agents")
      .select(`${agentColumns},user_agents(count)`)
      .order("status")
      .order("name");

    if (error) throw new Error("Unable to load agents.");

    return data.map((row) => {
      const agent = toAgent(row);

      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        model: agent.model,
        icon: agent.icon,
        status: agent.status,
        updatedAt: agent.updatedAt,
        assignedCount: firstCount(row.user_agents),
      };
    });
  },

  async getAgent(id) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("agents").select(agentColumns).eq("id", id).maybeSingle();

    if (error) throw new Error("Unable to load this agent.");
    return data ? toAgent(data) : null;
  },

  async createAgent(values, createdBy) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agents")
      .insert({ ...toAgentRow(values), created_by: createdBy })
      .select("id")
      .single();

    if (error?.code === UNIQUE_VIOLATION) return fail("conflict");
    if (error || !data) return fail("error");
    return ok({ id: data.id as string });
  },

  async updateAgent(id, values) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agents")
      .update(toAgentRow(values))
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error?.code === UNIQUE_VIOLATION) return fail("conflict");
    if (error) return fail("error");
    return data ? ok() : fail("not_found");
  },

  async listSquad(userId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_agents")
      .select("agent_id,custom_instructions,agents(name,description,model,icon,status)")
      .eq("user_id", userId)
      .order("created_at");

    if (error) throw new Error("Unable to load squad.");

    type Row = {
      agent_id: string;
      custom_instructions: string;
      agents: { name: string; description: string; model: string; icon: string; status: string } | null;
    };

    // RLS hides archived agents from employees, so their rows arrive with a null agent.
    return (data as unknown as Row[]).flatMap((row): SquadMember[] =>
      row.agents
        ? [
            {
              agentId: row.agent_id,
              name: row.agents.name,
              description: row.agents.description,
              model: row.agents.model,
              icon: row.agents.icon as AgentIcon,
              status: row.agents.status as AgentStatus,
              customInstructions: row.custom_instructions,
            },
          ]
        : [],
    );
  },

  async assignAgent(userId, agentId, assignedBy) {
    const supabase = await createClient();
    const [{ data: agent }, { data: user }] = await Promise.all([
      supabase.from("agents").select("status").eq("id", agentId).maybeSingle(),
      supabase.from("profiles").select("id").eq("id", userId).maybeSingle(),
    ]);

    if (!user) return fail("not_found");
    if (agent?.status !== "active") return fail("invalid", "Only active agents can be assigned.");

    const { error } = await supabase
      .from("user_agents")
      .upsert(
        { user_id: userId, agent_id: agentId, assigned_by: assignedBy },
        { onConflict: "user_id,agent_id", ignoreDuplicates: true },
      );

    return error ? fail("error") : ok();
  },

  async removeAssignment(userId, agentId) {
    const supabase = await createClient();
    const { error } = await supabase.from("user_agents").delete().eq("user_id", userId).eq("agent_id", agentId);

    return error ? fail("error") : ok();
  },

  async updateInstructions(userId, agentId, instructions) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_agents")
      .update({ custom_instructions: instructions })
      .eq("user_id", userId)
      .eq("agent_id", agentId)
      .select("agent_id");

    if (error) return fail("error");
    return data.length ? ok() : fail("not_found");
  },

  async listMissions() {
    return [];
  },

  async getMission() {
    return null;
  },

  async createMission() {
    return phase3("Missions");
  },

  async updateMission() {
    return phase3("Missions");
  },

  async deleteMission() {
    return phase3("Missions");
  },

  async runMission() {
    return phase3("Mission runs");
  },

  async listUsage() {
    return [];
  },

  async recordPromptGeneration() {
    // usage_events arrives in Phase 4.
  },

  async getDriveConnection() {
    return { status: "disconnected" };
  },

  async connectDrive() {
    return phase3("Google Drive");
  },

  async disconnectDrive() {
    return phase3("Google Drive");
  },

  async listDriveFiles() {
    return [];
  },

  async listKnowledge() {
    return [];
  },

  async attachKnowledge() {
    return phase3("Agent knowledge");
  },

  async detachKnowledge() {
    return phase3("Agent knowledge");
  },
};
