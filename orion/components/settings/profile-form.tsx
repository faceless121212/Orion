"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { saveProfileAction } from "@/app/(dashboard)/settings/actions";
import { FormField } from "@/components/forms/form-field";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formKey, initialFormState } from "@/lib/form-state";

export function ProfileForm({ fullName, jobTitle, email }: { fullName: string; jobTitle: string; email: string }) {
  const [state, formAction, pending] = useActionState(saveProfileAction, initialFormState);

  return (
    <form action={formAction} key={`${formKey(state)}|${fullName}|${jobTitle}`} className="grid gap-5">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField errors={state.errors?.fullName} id="fullName" label="Full name">
          <Input
            aria-invalid={Boolean(state.errors?.fullName)}
            autoComplete="name"
            defaultValue={state.values?.fullName ?? fullName}
            id="fullName"
            maxLength={80}
            name="fullName"
            required
          />
        </FormField>
        <FormField errors={state.errors?.jobTitle} id="jobTitle" label="Job title">
          <Input
            aria-invalid={Boolean(state.errors?.jobTitle)}
            autoComplete="organization-title"
            defaultValue={state.values?.jobTitle ?? jobTitle}
            id="jobTitle"
            maxLength={80}
            name="jobTitle"
            placeholder="Marketing Manager"
          />
        </FormField>
      </div>
      <FormField description="Email changes are handled by your administrator." id="email" label="Email">
        <Input disabled id="email" value={email} />
      </FormField>
      <div className="flex justify-end">
        <Button disabled={pending} type="submit">
          <Save />
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
