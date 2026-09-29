"use server";

import { revalidatePath } from "next/cache";

import { instructionsSchema } from "@/lib/agents/validation";
import { requireUser } from "@/lib/auth/session";
import { fieldsFrom, type FormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

export async function saveInstructionsAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireUser();
  const parsed = instructionsSchema.safeParse(fieldsFrom(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Ownership comes from the session, never from the form.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_agents")
    .update({ custom_instructions: parsed.data.customInstructions })
    .eq("user_id", profile.id)
    .eq("agent_id", parsed.data.agentId)
    .select("agent_id");

  if (error) {
    return { status: "error", message: "Unable to save your instructions. Try again." };
  }

  if (!data.length) {
    return { status: "error", message: "This agent is no longer in your squad." };
  }

  revalidatePath("/squad");
  return { status: "success", message: "Personal instructions saved." };
}
