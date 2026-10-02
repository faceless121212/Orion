"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { failureMessage, type FormState } from "@/lib/form-state";
import { getRepository } from "@/lib/repository";

export async function connectDriveAction(): Promise<FormState> {
  await requireAdmin();
  const result = await getRepository().connectDrive();

  if (!result.ok) {
    return { status: "error", message: failureMessage(result, "Unable to connect Google Drive.") };
  }

  revalidatePath("/integrations");
  revalidatePath("/agents", "layout");
  return { status: "success", message: "Google Drive connected." };
}

export async function disconnectDriveAction(): Promise<FormState> {
  await requireAdmin();
  const result = await getRepository().disconnectDrive();

  if (!result.ok) {
    return { status: "error", message: failureMessage(result, "Unable to disconnect Google Drive.") };
  }

  revalidatePath("/integrations");
  revalidatePath("/agents", "layout");
  return { status: "success", message: "Google Drive disconnected. Missions cannot create files until you reconnect." };
}
