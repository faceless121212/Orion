"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { saveCompanySettingsAction } from "@/app/(dashboard)/(admin)/company/actions";
import { FormField } from "@/components/forms/form-field";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CompanySettings } from "@/lib/company/validation";
import { formKey, initialFormState } from "@/lib/form-state";

const textFields: Array<{
  name: Exclude<keyof CompanySettings, "companyName">;
  label: string;
  description: string;
  placeholder: string;
}> = [
  {
    name: "overview",
    label: "Company overview",
    description: "What the company does, its products, and the facts every agent should know.",
    placeholder: "Acme builds scheduling software for independent clinics…",
  },
  {
    name: "audience",
    label: "Audience",
    description: "Who reads the documents agents produce.",
    placeholder: "Clinic owners and office managers in North America…",
  },
  {
    name: "brandVoice",
    label: "Brand voice",
    description: "Tone and personality to use in every output.",
    placeholder: "Warm, plain-spoken, confident. Avoid jargon and hype…",
  },
  {
    name: "writingGuidelines",
    label: "Writing guidelines",
    description: "Formatting rules, terminology, and things to avoid.",
    placeholder: "Use American English. Write 'sign in', not 'log in'…",
  },
];

export function CompanyForm({ settings }: { settings: CompanySettings }) {
  const [state, formAction, pending] = useActionState(saveCompanySettingsAction, initialFormState);

  return (
    <form action={formAction} key={`${formKey(state)}|${JSON.stringify(settings)}`}>
      <Card className="max-w-3xl shadow-none">
        <CardHeader>
          <CardTitle>Company context</CardTitle>
          <CardDescription>
            Shared with every agent and used when generating system prompts.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <FormMessage state={state} />
          <FormField errors={state.errors?.companyName} id="companyName" label="Company name">
            <Input
              aria-invalid={Boolean(state.errors?.companyName)}
              defaultValue={state.values?.companyName ?? settings.companyName}
              id="companyName"
              maxLength={120}
              name="companyName"
              required
            />
          </FormField>
          {textFields.map((field) => (
            <FormField
              description={field.description}
              errors={state.errors?.[field.name]}
              id={field.name}
              key={field.name}
              label={field.label}
            >
              <Textarea
                aria-invalid={Boolean(state.errors?.[field.name])}
                className="min-h-24"
                defaultValue={state.values?.[field.name] ?? settings[field.name]}
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
              />
            </FormField>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled={pending} type="submit">
            <Save />
            {pending ? "Saving…" : "Save company context"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
