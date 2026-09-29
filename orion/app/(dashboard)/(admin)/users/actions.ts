"use server";

import { revalidatePath } from "next/cache";

import { assignmentSchema } from "@/lib/agents/validation";
import { requireAdmin } from "@/lib/auth/session";
import { fieldsFrom, type FormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

function revalidateSquad(userId: string) {
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
  revalidatePath("/agents");
  revalidatePath("/squad");
}

export async function assignAgentAction(_state: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireAdmin();
  const parsed = assignmentSchema.safeParse(fieldsFrom(formData));

  if (!parsed.success) {
    return { status: "error", message: "Choose an agent to assign." };
  }

  const supabase = await createClient();
  const [{ data: agent }, { data: user }] = await Promise.all([
    supabase.from("agents").select("status").eq("id", parsed.data.agentId).maybeSingle(),
    supabase.from("profiles").select("id").eq("id", parsed.data.userId).maybeSingle(),
  ]);

  if (!user) {
    return { status: "error", message: "This user no longer exists." };
  }

  if (agent?.status !== "active") {
    return { status: "error", message: "Only active agents can be assigned." };
  }

  const { error } = await supabase.from("user_agents").upsert(
    {
      user_id: parsed.data.userId,
      agent_id: parsed.data.agentId,
      assigned_by: profile.id,
    },
    { onConflict: "user_id,agent_id", ignoreDuplicates: true },
  );

  if (error) {
    return { status: "error", message: "Unable to assign this agent. Try again." };
  }

  revalidateSquad(parsed.data.userId);
  return { status: "success", message: "Agent added to squad." };
}

export async function removeAssignmentAction(formData: FormData) {
  await requireAdmin();
  const parsed = assignmentSchema.safeParse(fieldsFrom(formData));

  if (!parsed.success) {
    throw new Error("Invalid assignment.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_agents")
    .delete()
    .eq("user_id", parsed.data.userId)
    .eq("agent_id", parsed.data.agentId);

  if (error) {
    throw new Error("Unable to remove this assignment.");
  }

  revalidateSquad(parsed.data.userId);
}
