"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";

import { saveInstructionsAction } from "@/app/(dashboard)/squad/actions";
import { FormField } from "@/components/forms/form-field";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState } from "@/lib/form-state";

export function InstructionsForm({
  agentId,
  agentName,
  instructions,
}: {
  agentId: string;
  agentName: string;
  instructions: string;
}) {
  const [state, formAction, pending] = useActionState(saveInstructionsAction, initialFormState);
  const [value, setValue] = useState(instructions);
  const fieldId = `instructions-${agentId}`;

  return (
    <form action={formAction} className="grid gap-3">
      <input name="agentId" type="hidden" value={agentId} />
      <FormField
        description="Added to this agent's instructions on your missions. Administrators can also see them."
        errors={state.errors?.customInstructions}
        id={fieldId}
        label={`Personal instructions for ${agentName}`}
      >
        <Textarea
          className="min-h-24"
          id={fieldId}
          maxLength={4000}
          name="customInstructions"
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. Most of my members are coaches, so use coaching examples."
          value={value}
        />
      </FormField>
      <FormMessage state={state} />
      <div className="flex justify-end">
        <Button disabled={pending} size="sm" type="submit" variant="outline">
          <Save />
          {pending ? "Saving…" : "Save instructions"}
        </Button>
      </div>
    </form>
  );
}
