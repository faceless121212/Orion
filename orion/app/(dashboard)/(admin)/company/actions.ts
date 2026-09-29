"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { companySettingsSchema } from "@/lib/company/validation";
import { failureMessage, fieldsFrom, type FormState } from "@/lib/form-state";
import { getRepository } from "@/lib/repository";

export async function saveCompanySettingsAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const profile = await requireAdmin();
  const fields = fieldsFrom(formData);
  const parsed = companySettingsSchema.safeParse(fields);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
      values: fields,
    };
  }

  const result = await getRepository().saveCompanySettings(parsed.data, profile.id);

  if (!result.ok) {
    return {
      status: "error",
      message: failureMessage(result, "Unable to save company context. Try again."),
      values: fields,
    };
  }

  revalidatePath("/company");
  return { status: "success", message: "Company context saved." };
}
