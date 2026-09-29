import { z } from "zod";

export const companySettingsSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Enter the company name.")
    .max(120, "Company name must be 120 characters or fewer."),
  overview: z.string().trim().max(4000, "Overview must be 4,000 characters or fewer."),
  audience: z.string().trim().max(2000, "Audience must be 2,000 characters or fewer."),
  brandVoice: z.string().trim().max(2000, "Brand voice must be 2,000 characters or fewer."),
  writingGuidelines: z
    .string()
    .trim()
    .max(4000, "Writing guidelines must be 4,000 characters or fewer."),
});

export type CompanySettings = z.infer<typeof companySettingsSchema>;

export const emptyCompanySettings: CompanySettings = {
  companyName: "",
  overview: "",
  audience: "",
  brandVoice: "",
  writingGuidelines: "",
};

export function hasCompanyContext(settings: CompanySettings) {
  return Object.values(settings).some((value) => value.trim().length > 0);
}
