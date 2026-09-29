"use client";

import { useActionState } from "react";
import { FileSpreadsheet, FileText, FileType, Globe, Save, Send } from "lucide-react";

import { saveMissionAction } from "@/app/(dashboard)/missions/actions";
import { FieldError } from "@/components/auth/field-error";
import { FormField } from "@/components/forms/form-field";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { outputFormats, type MissionValues, type OutputFormat } from "@/lib/domain/types";
import { formKey, initialFormState, type FormState } from "@/lib/form-state";
import { outputFormatLabels } from "@/lib/missions/presentation";
import { cn } from "@/lib/utils";

const formatDetails: Record<OutputFormat, { icon: typeof FileText; hint: string }> = {
  google_doc: { icon: FileText, hint: "Reports, proposals, copy" },
  google_sheet: { icon: FileSpreadsheet, hint: "Tables, budgets, lists" },
  pdf: { icon: FileType, hint: "Final, shareable files" },
};

export type SquadOption = { agentId: string; name: string };

export function MissionForm({
  squad,
  mission,
  defaultAgentId,
  onSaved,
}: {
  squad: SquadOption[];
  mission?: MissionValues & { id: string };
  defaultAgentId?: string;
  onSaved?: () => void;
}) {
  const [state, formAction, pending] = useActionState(async (previous: FormState, formData: FormData) => {
    const result = await saveMissionAction(previous, formData);
    if (result.status === "success") onSaved?.();
    return result;
  }, initialFormState);

  const values = state.values;
  const agentId = values?.agentId ?? mission?.agentId ?? defaultAgentId ?? squad[0]?.agentId ?? "";
  const outputFormat = (values?.outputFormat ?? mission?.outputFormat ?? "google_doc") as OutputFormat;
  const webSearch = values ? values.webSearch === "on" : (mission?.webSearch ?? false);

  return (
    <form action={formAction} key={`${formKey(state)}|${JSON.stringify(mission ?? null)}`} className="grid gap-5">
      {mission ? <input name="missionId" type="hidden" value={mission.id} /> : null}
      <FormMessage state={state.status === "error" ? state : initialFormState} />

      <FormField errors={state.errors?.agentId} id="mission-agent" label="Agent">
        <NativeSelect defaultValue={agentId} id="mission-agent" key={agentId} name="agentId" required>
          {squad.map((member) => (
            <option key={member.agentId} value={member.agentId}>
              {member.name}
            </option>
          ))}
        </NativeSelect>
      </FormField>

      <FormField errors={state.errors?.title} id="mission-title" label="Title">
        <Input
          aria-invalid={Boolean(state.errors?.title)}
          defaultValue={values?.title ?? mission?.title ?? ""}
          id="mission-title"
          maxLength={120}
          name="title"
          placeholder="Proposal for Lakeside Physio"
          required
        />
      </FormField>

      <FormField
        description="Say what you need, who it's for, and anything the agent must include."
        errors={state.errors?.brief}
        id="mission-brief"
        label="Brief"
      >
        <Textarea
          aria-invalid={Boolean(state.errors?.brief)}
          className="min-h-32"
          defaultValue={values?.brief ?? mission?.brief ?? ""}
          id="mission-brief"
          maxLength={8000}
          name="brief"
          placeholder="Three-location physio group in Toronto, currently on paper intake…"
          required
        />
      </FormField>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Output</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {outputFormats.map((format) => {
            const { icon: Icon, hint } = formatDetails[format];

            return (
              <label className="cursor-pointer" key={format}>
                <input
                  className="peer sr-only"
                  defaultChecked={format === outputFormat}
                  name="outputFormat"
                  type="radio"
                  value={format}
                />
                <span
                  className={cn(
                    "flex h-full flex-col gap-1 rounded-xl border p-3 transition hover:bg-muted",
                    "peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:ring-2 peer-checked:ring-blue-100",
                    "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                  )}
                >
                  <Icon className="size-4 text-blue-600" />
                  <span className="text-sm font-medium">{outputFormatLabels[format]}</span>
                  <span className="text-xs text-muted-foreground">{hint}</span>
                </span>
              </label>
            );
          })}
        </div>
        <FieldError messages={state.errors?.outputFormat} />
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 hover:bg-muted/50">
        <input
          className="mt-0.5 size-4 accent-blue-600"
          defaultChecked={webSearch}
          name="webSearch"
          type="checkbox"
        />
        <span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Globe className="size-4 text-blue-600" />
            Allow web search
          </span>
          <span className="text-xs text-muted-foreground">Let the agent research public sources and cite them.</span>
        </span>
      </label>

      <div className="flex justify-end">
        <Button disabled={pending} type="submit">
          {mission ? <Save /> : <Send />}
          {pending ? "Saving…" : mission ? "Save mission" : "Add to queue"}
        </Button>
      </div>
    </form>
  );
}
