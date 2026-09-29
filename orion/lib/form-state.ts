export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** Submitted values echoed back so a failed submit does not clear the form. */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

export function fieldsFrom(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    [...formData.entries()].flatMap(([key, value]) =>
      !key.startsWith("$ACTION") && typeof value === "string" ? [[key, value]] : [],
    ),
  );
}
