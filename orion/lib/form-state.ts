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

export function failureMessage(
  failure: { reason: string; message?: string },
  fallback = "Something went wrong. Try again.",
) {
  return failure.message ?? fallback;
}

/**
 * Remount key for forms whose default values change (echoed values after an
 * error, or fresh server data after a save); Base UI inputs warn otherwise.
 */
export function formKey(state: FormState) {
  return state.values ? JSON.stringify(state.values) : "initial";
}
