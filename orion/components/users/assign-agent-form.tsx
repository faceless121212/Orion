"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";

import { assignAgentAction } from "@/app/(dashboard)/(admin)/users/actions";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { initialFormState } from "@/lib/form-state";

export function AssignAgentForm({
  userId,
  agents,
}: {
  userId: string;
  agents: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(assignAgentAction, initialFormState);

  if (!agents.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Every active agent is already in this squad. Create or reactivate an agent to assign more.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-3">
      <input name="userId" type="hidden" value={userId} />
      <FormMessage state={state} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="agentId">Agent</Label>
          <NativeSelect id="agentId" name="agentId" required>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button disabled={pending} type="submit">
          <UserPlus />
          {pending ? "Assigning…" : "Assign agent"}
        </Button>
      </div>
    </form>
  );
}
