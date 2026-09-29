import "server-only";

import { emptyCompanySettings, type CompanySettings } from "@/lib/company/validation";
import { createClient } from "@/lib/supabase/server";

export async function getCompanySettings(): Promise<CompanySettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_settings")
    .select("company_name,overview,audience,brand_voice,writing_guidelines")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load company context.");
  }

  if (!data) {
    return emptyCompanySettings;
  }

  return {
    companyName: data.company_name,
    overview: data.overview,
    audience: data.audience,
    brandVoice: data.brand_voice,
    writingGuidelines: data.writing_guidelines,
  };
}
