"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { failureMessage, fieldsFrom, type FormState } from "@/lib/form-state";
import { profileSchema, validateAvatar } from "@/lib/profile/validation";
import { getRepository } from "@/lib/repository";

export async function saveProfileAction(_state: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireUser();
  const fields = fieldsFrom(formData);
  const parsed = profileSchema.safeParse(fields);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
      values: fields,
    };
  }

  const result = await getRepository().updateProfile(profile.id, parsed.data);

  if (!result.ok) {
    return { status: "error", message: failureMessage(result, "Unable to save your profile."), values: fields };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Profile saved." };
}

export async function uploadAvatarAction(_state: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireUser();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return { status: "error", message: "Choose an image to upload." };
  }

  const problem = validateAvatar(file);
  if (problem) {
    return { status: "error", message: problem };
  }

  // The stored content type is the validated MIME type, never the file name.
  const result = await getRepository().updateAvatar(profile.id, {
    bytes: new Uint8Array(await file.arrayBuffer()),
    contentType: file.type,
  });

  if (!result.ok) {
    return { status: "error", message: failureMessage(result, "Unable to upload this image.") };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Photo updated." };
}

export async function removeAvatarAction() {
  const profile = await requireUser();
  const result = await getRepository().updateAvatar(profile.id, null);

  if (!result.ok) {
    throw new Error(failureMessage(result, "Unable to remove your photo."));
  }

  revalidatePath("/", "layout");
}
