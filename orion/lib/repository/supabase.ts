import "server-only";

import { estimateCostUsd, type AgentIcon, type AgentStatus } from "@/lib/agents/catalog";
import type { AppRole } from "@/lib/auth/access";
import { emptyCompanySettings } from "@/lib/company/validation";
import type { AgentRecord, SquadMember } from "@/lib/domain/types";
import {
  avatarObjectPath,
  missionColumns,
  toDriveConnection,
  toKnowledgeFile,
  toMission,
  toUsageEvent,
  type KnowledgeRow,
  type MissionRow,
  type UsageRow,
  usageColumns,
} from "@/lib/repository/supabase-mappers";
import { fail, ok, type Repository } from "@/lib/repository/types";
import { createAdminClient } from "@/lib/supabase/admin";
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

const phase3 = (feature: string) =>
  fail("unavailable", `${feature} arrives with the Phase 3 runtime. Run Orion with ORION_DEMO=1 to preview it.`);

const missionFields = (values: { agentId: string; title: string; brief: string; webSearch: boolean; outputFormat: string }) => ({
  agent_id: values.agentId,
  title: values.title,
  brief: values.brief,
  web_search: values.webSearch,
  output_format: values.outputFormat,
});

/** Supabase-backed data access; row-level security is the second authorization layer. */
export const supabaseRepository: Repository = {
  async getProfile(id) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,job_title,avatar_url")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error("Unable to load this profile.");

    return data
      ? {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role as AppRole,
          jobTitle: data.job_title ?? "",
          avatarUrl: data.avatar_url ?? null,
        }
      : null;
  },

  async updateProfile(id, values) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: values.fullName, job_title: values.jobTitle })
      .eq("id", id)
      .select("id");

    if (error) return fail("error");
    return data.length ? ok() : fail("not_found");
  },

  async updateAvatar(id, avatar) {
    const supabase = await createClient();
    let avatarUrl: string | null = null;

    if (avatar) {
      const path = avatarObjectPath(id, avatar.contentType);
      if (!path) return fail("invalid", "Use a PNG, JPEG, WebP, or GIF image.");

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatar.bytes, { contentType: avatar.contentType, upsert: false });

      if (uploadError) return fail("error", "Unable to upload this image.");
      avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", id)
      .select("id");
    const keep = avatarUrl ? avatarUrl.split("/").pop() : undefined;

    if (error || !data.length) {
      // Don't leave an orphaned, publicly readable upload behind.
      if (keep) await supabase.storage.from("avatars").remove([`${id}/${keep}`]);
      return error ? fail("error") : fail("not_found");
    }

    // Remove earlier photos so replaced or removed avatars stop being public.
    const { data: files } = await supabase.storage.from("avatars").list(id);
    const stale = (files ?? []).filter((file) => file.name !== keep).map((file) => `${id}/${file.name}`);
    if (stale.length) await supabase.storage.from("avatars").remove(stale);

    return ok();
  },

  async listUsers() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,job_title,avatar_url,user_agents!user_agents_user_id_fkey(count)")
      .order("full_name");

    if (error) throw new Error("Unable to load users.");

    return data.map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role as AppRole,
      jobTitle: row.job_title ?? "",
      avatarUrl: row.avatar_url ?? null,
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

  async listMissions(userId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("missions")
      .select(missionColumns)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw new Error("Unable to load missions.");
    return (data as unknown as MissionRow[]).map(toMission);
  },

  async getMission(userId, id) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("missions")
      .select(missionColumns)
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error("Unable to load this mission.");
    return data ? toMission(data as unknown as MissionRow) : null;
  },

  async createMission(userId, values) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("missions")
      .insert({ user_id: userId, ...missionFields(values) })
      .select("id")
      .single();

    // An RLS rejection means the agent is not an active member of the user's squad.
    if (error?.code === "42501") return fail("invalid", "Choose an agent from your squad.");
    if (error || !data) return fail("error");
    return ok({ id: data.id as string });
  },

  async updateMission(userId, id, values) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("missions")
      .update(missionFields(values))
      .eq("id", id)
      .eq("user_id", userId)
      .select("id");

    if (error?.code === "42501") return fail("invalid", "Choose an agent from your squad.");
    if (error) return fail("error");
    return data.length ? ok() : fail("invalid", "Only queued or failed missions can be edited.");
  },

  async deleteMission(userId, id) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("missions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id");

    if (error) return fail("error");
    return data.length ? ok() : fail("invalid", "A running mission cannot be deleted.");
  },

  async runMission() {
    return phase3("Mission runs");
  },

  async listUsage({ userId, since }) {
    const supabase = await createClient();
    let query = supabase.from("usage_events").select(usageColumns).order("created_at", { ascending: false }).limit(2000);

    if (userId) query = query.eq("user_id", userId);
    if (since) query = query.gte("created_at", since);

    const { data, error } = await query;

    if (error) throw new Error("Unable to load usage.");
    return (data as unknown as UsageRow[]).map(toUsageEvent);
  },

  async recordPromptGeneration(userId, usage) {
    // Usage rows are server-written only (no RLS insert policy for users).
    const admin = createAdminClient();
    if (!admin) return;

    const { error } = await admin.from("usage_events").insert({
      user_id: userId,
      event_type: "prompt_generation",
      model: usage.model,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      cost_usd: estimateCostUsd(usage.model, usage.inputTokens, usage.outputTokens),
    });

    if (error) console.error("Unable to record prompt-generation usage:", error.code);
  },

  async getDriveConnection() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("integrations")
      .select("status,account_email,connected_at")
      .eq("provider", "google_drive")
      .maybeSingle();

    if (error) throw new Error("Unable to load integrations.");
    return toDriveConnection(data);
  },

  async connectDrive() {
    return phase3("Connecting Google Drive through Pipedream");
  },

  async disconnectDrive() {
    const supabase = await createClient();
    const { error } = await supabase.from("integrations").upsert({
      provider: "google_drive",
      status: "disconnected",
      account_email: null,
      external_account_id: null,
      connected_at: null,
      connected_by: null,
    });

    return error ? fail("error") : ok();
  },

  async listDriveFiles() {
    // Listing Drive files needs the Pipedream connection (Phase 3).
    return [];
  },

  async listKnowledge(agentId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agent_knowledge")
      .select("file_id,name,kind,modified_at,size_bytes,attached_at")
      .eq("agent_id", agentId)
      .order("name");

    if (error) throw new Error("Unable to load knowledge files.");
    return (data as KnowledgeRow[]).map(toKnowledgeFile);
  },

  async attachKnowledge() {
    return phase3("Attaching Drive files");
  },

  async detachKnowledge(agentId, fileId) {
    const supabase = await createClient();
    const { error } = await supabase.from("agent_knowledge").delete().eq("agent_id", agentId).eq("file_id", fileId);

    return error ? fail("error") : ok();
  },
};
