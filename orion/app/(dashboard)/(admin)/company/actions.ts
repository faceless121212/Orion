"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { companySettingsSchema } from "@/lib/company/validation";
import { fieldsFrom, type FormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { error } = await supabase.from("company_settings").upsert({
    id: true,
    company_name: parsed.data.companyName,
    overview: parsed.data.overview,
    audience: parsed.data.audience,
    brand_voice: parsed.data.brandVoice,
    writing_guidelines: parsed.data.writingGuidelines,
    updated_by: profile.id,
  });

  if (error) {
    return { status: "error", message: "Unable to save company context. Try again.", values: fields };
  }

  revalidatePath("/company");
  return { status: "success", message: "Company context saved." };
}
