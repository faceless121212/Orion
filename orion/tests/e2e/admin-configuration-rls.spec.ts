import { expect, test } from "@playwright/test";

import { signedInClient, uniqueName } from "./helpers";

const validAgent = {
  description: "RLS probe",
  model: "claude-opus-5",
  system_prompt: "You are a probe agent used only by automated security tests.",
  icon: "bot",
};

test("a regular user cannot create agents or change company context", async () => {
  const { supabase } = await signedInClient("user");

  const { error: insertError } = await supabase
    .from("agents")
    .insert({ ...validAgent, name: uniqueName("RLS probe") });
  expect(insertError).not.toBeNull();

  const { error: companyError } = await supabase
    .from("company_settings")
    .upsert({ id: true, company_name: "Hijacked" });
  expect(companyError).not.toBeNull();
});

test("a regular user cannot assign agents to themselves", async () => {
  const admin = await signedInClient("admin");
  const user = await signedInClient("user");
  const name = uniqueName("RLS unassigned");
  const { data: agent, error } = await admin.supabase
    .from("agents")
    .insert({ ...validAgent, name })
    .select("id")
    .single();

  expect(error).toBeNull();

  try {
    // Unassigned agents are invisible to the employee.
    const { data: visible } = await user.supabase.from("agents").select("id").eq("id", agent!.id);
    expect(visible).toEqual([]);

    const { error: assignError } = await user.supabase
      .from("user_agents")
      .insert({ user_id: user.userId, agent_id: agent!.id });
    expect(assignError).not.toBeNull();
  } finally {
    await admin.supabase.from("agents").delete().eq("id", agent!.id);
  }
});

test("a user edits only their own personal instructions", async () => {
  const admin = await signedInClient("admin");
  const user = await signedInClient("user");
  const name = uniqueName("RLS assigned");
  const { data: agent } = await admin.supabase
    .from("agents")
    .insert({ ...validAgent, name })
    .select("id")
    .single();

  try {
    await admin.supabase
      .from("user_agents")
      .insert({ user_id: user.userId, agent_id: agent!.id, assigned_by: admin.userId });
    await admin.supabase
      .from("user_agents")
      .insert({ user_id: admin.userId, agent_id: agent!.id, assigned_by: admin.userId });

    const { data: own } = await user.supabase
      .from("user_agents")
      .update({ custom_instructions: "Mine" })
      .eq("user_id", user.userId)
      .eq("agent_id", agent!.id)
      .select("custom_instructions");
    expect(own).toEqual([{ custom_instructions: "Mine" }]);

    const { data: others } = await user.supabase
      .from("user_agents")
      .update({ custom_instructions: "Not mine" })
      .eq("user_id", admin.userId)
      .select("user_id");
    expect(others).toEqual([]);

    // Ownership columns are not updatable, even on the user's own row.
    const { error: reassignError } = await user.supabase
      .from("user_agents")
      .update({ assigned_by: user.userId })
      .eq("user_id", user.userId)
      .eq("agent_id", agent!.id);
    expect(reassignError).not.toBeNull();

    const { error: repointError } = await user.supabase
      .from("user_agents")
      .update({ agent_id: crypto.randomUUID() })
      .eq("user_id", user.userId)
      .eq("agent_id", agent!.id);
    expect(repointError).not.toBeNull();
  } finally {
    await admin.supabase.from("agents").delete().eq("id", agent!.id);
  }
});
