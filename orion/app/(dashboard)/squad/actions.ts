"use server";

import { revalidatePath } from "next/cache";

import { instructionsSchema } from "@/lib/agents/validation";
import { requireUser } from "@/lib/auth/session";
import { fieldsFrom, type FormState } from "@/lib/form-state";
import { getRepository } from "@/lib/repository";

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
  const result = await getRepository().updateInstructions(
    profile.id,
    parsed.data.agentId,
    parsed.data.customInstructions,
  );

  if (!result.ok) {
    return {
      status: "error",
      message: result.reason === "not_found" ? "This agent is no longer in your squad." : "Unable to save your instructions. Try again.",
    };
  }

  revalidatePath("/squad");
  return { status: "success", message: "Personal instructions saved." };
}
