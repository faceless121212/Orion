import { CheckCircle2, CircleAlert } from "lucide-react";

import type { FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const success = state.status === "success";
  const Icon = success ? CheckCircle2 : CircleAlert;

  return (
    <div
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={success ? "status" : "alert"}
    >
      <Icon className="size-4 shrink-0" />
      {state.message}
    </div>
  );
}
