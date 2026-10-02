"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { uuidSchema } from "@/lib/agents/validation";
import { requireUser } from "@/lib/auth/session";
import { failureMessage, fieldsFrom, type FormState } from "@/lib/form-state";
import { missionSchema } from "@/lib/missions/validation";
import { getRepository } from "@/lib/repository";

function revalidateMissions(missionId?: string) {
  revalidatePath("/missions");
  revalidatePath("/usage");
  if (missionId) revalidatePath(`/missions/${missionId}`);
}

export async function saveMissionAction(_state: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireUser();
  const { missionId, ...fields } = fieldsFrom(formData);
  const parsed = missionSchema.safeParse(fields);
  const parsedId = missionId ? uuidSchema.safeParse(missionId) : null;

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
      values: fields,
    };
  }

  if (parsedId && !parsedId.success) {
    return { status: "error", message: "This mission no longer exists." };
  }

  // The owner is always the signed-in user; the form never supplies it.
  const repository = getRepository();
  const result = parsedId
    ? await repository.updateMission(profile.id, parsedId.data, parsed.data)
    : await repository.createMission(profile.id, parsed.data);

  if (!result.ok) {
    return { status: "error", message: failureMessage(result, "Unable to save this mission."), values: fields };
  }

  revalidateMissions(parsedId?.data);
  return { status: "success", message: parsedId ? "Mission updated." : "Mission added to the queue." };
}

export async function runMissionAction(_state: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireUser();
  const parsed = uuidSchema.safeParse(formData.get("missionId"));

  if (!parsed.success) {
    return { status: "error", message: "This mission no longer exists." };
  }

  const result = await getRepository().runMission(profile.id, parsed.data);

  if (!result.ok) {
    return { status: "error", message: failureMessage(result, "Unable to start this mission.") };
  }

  revalidateMissions(parsed.data);
  return { status: "success", message: "Mission started." };
}

export async function deleteMissionAction(formData: FormData) {
  const profile = await requireUser();
  const parsed = uuidSchema.safeParse(formData.get("missionId"));

  if (!parsed.success) {
    throw new Error("Invalid mission.");
  }

  const result = await getRepository().deleteMission(profile.id, parsed.data);

  if (!result.ok) {
    throw new Error(failureMessage(result, "Unable to delete this mission."));
  }

  revalidateMissions();
  redirect("/missions");
}
