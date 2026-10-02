"use client";

import { useActionState } from "react";
import { LoaderCircle, Play, RotateCcw } from "lucide-react";

import { runMissionAction } from "@/app/(dashboard)/missions/actions";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/form-state";

export function RunMissionForm({ missionId, retry = false }: { missionId: string; retry?: boolean }) {
  const [state, formAction, pending] = useActionState(runMissionAction, initialFormState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <input name="missionId" type="hidden" value={missionId} />
      <Button disabled={pending} type="submit">
        {pending ? <LoaderCircle className="animate-spin" /> : retry ? <RotateCcw /> : <Play />}
        {retry ? "Retry mission" : "Run mission"}
      </Button>
      {state.status === "error" ? (
        <p className="max-w-xs text-right text-xs text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
