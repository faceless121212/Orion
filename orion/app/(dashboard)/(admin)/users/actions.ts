"use server";

import { revalidatePath } from "next/cache";

import { assignmentSchema } from "@/lib/agents/validation";
import { requireAdmin } from "@/lib/auth/session";
import { failureMessage, fieldsFrom, type FormState } from "@/lib/form-state";
import { getRepository } from "@/lib/repository";

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

  const result = await getRepository().assignAgent(parsed.data.userId, parsed.data.agentId, profile.id);

  if (!result.ok) {
    return {
      status: "error",
      message: result.reason === "not_found" ? "This user no longer exists." : failureMessage(result, "Unable to assign this agent. Try again."),
    };
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

  const result = await getRepository().removeAssignment(parsed.data.userId, parsed.data.agentId);

  if (!result.ok) {
    throw new Error("Unable to remove this assignment.");
  }

  revalidateSquad(parsed.data.userId);
}
