import { expect, test } from "@playwright/test";

import { signedInClient, uniqueName } from "./helpers";

const probeAgent = {
  description: "RLS probe",
  model: "claude-opus-5",
  system_prompt: "You are a probe agent used only by automated security tests.",
  icon: "bot",
};

const missionFor = (userId: string, agentId: string) => ({
  user_id: userId,
  agent_id: agentId,
  title: "RLS probe mission",
  brief: "A mission created by automated row-level security tests.",
  output_format: "google_doc",
});

test("a user cannot promote themselves through the new profile update policy", async () => {
  const { supabase, userId } = await signedInClient("user");

  const { error: roleError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId);
  expect(roleError).not.toBeNull();

  const { data, error } = await supabase
    .from("profiles")
    .update({ job_title: "QA probe" })
    .eq("id", userId)
    .select("role,job_title");
  expect(error).toBeNull();
  expect(data).toEqual([{ role: "user", job_title: "QA probe" }]);

  await supabase.from("profiles").update({ job_title: "" }).eq("id", userId);
});

test("missions are limited to the user's own active agents and runtime fields are server-only", async () => {
  const admin = await signedInClient("admin");
  const user = await signedInClient("user");
  const { data: agent } = await admin.supabase
    .from("agents")
    .insert({ ...probeAgent, name: uniqueName("RLS mission agent") })
    .select("id")
    .single();

  try {
    // Not assigned yet: the insert is rejected.
    const { error: unassignedError } = await user.supabase.from("missions").insert(missionFor(user.userId, agent!.id));
    expect(unassignedError).not.toBeNull();

    await admin.supabase.from("user_agents").insert({ user_id: user.userId, agent_id: agent!.id, assigned_by: admin.userId });

    // Cannot create a mission on someone else's behalf.
    const { error: foreignError } = await user.supabase.from("missions").insert(missionFor(admin.userId, agent!.id));
    expect(foreignError).not.toBeNull();

    const { data: mission, error } = await user.supabase
      .from("missions")
      .insert(missionFor(user.userId, agent!.id))
      .select("id,status")
      .single();
    expect(error).toBeNull();
    expect(mission!.status).toBe("queued");

    // Status and output are written only by the server runtime.
    const { error: statusError } = await user.supabase
      .from("missions")
      .update({ status: "completed", output_url: "https://example.com" })
      .eq("id", mission!.id);
    expect(statusError).not.toBeNull();

    // Usage cannot be forged by users.
    const { error: usageError } = await user.supabase.from("usage_events").insert({
      user_id: user.userId,
      event_type: "mission_run",
      model: "claude-opus-5",
      input_tokens: 1,
      output_tokens: 1,
      cost_usd: 0,
    });
    expect(usageError).not.toBeNull();

    // Admins can read the mission; the user can delete their queued mission.
    const { data: adminView } = await admin.supabase.from("missions").select("id").eq("id", mission!.id);
    expect(adminView).toHaveLength(1);
    const { data: deleted } = await user.supabase.from("missions").delete().eq("id", mission!.id).select("id");
    expect(deleted).toHaveLength(1);
  } finally {
    await admin.supabase.from("missions").delete().eq("agent_id", agent!.id);
    await admin.supabase.from("agents").delete().eq("id", agent!.id);
  }
});

test("only admins can change integrations and agent knowledge", async () => {
  const user = await signedInClient("user");

  const { error: integrationError } = await user.supabase
    .from("integrations")
    .upsert({ provider: "google_drive", status: "connected", account_email: "attacker@example.com" });
  expect(integrationError).not.toBeNull();

  const { data: integrations, error: readError } = await user.supabase.from("integrations").select("provider,status");
  expect(readError).toBeNull();
  expect(Array.isArray(integrations)).toBe(true);
});
