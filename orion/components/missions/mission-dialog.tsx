"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus } from "lucide-react";

import { MissionForm, type SquadOption } from "@/components/missions/mission-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MissionValues } from "@/lib/domain/types";

export function MissionDialog({
  squad,
  mission,
  defaultAgentId,
  defaultOpen = false,
}: {
  squad: SquadOption[];
  mission?: MissionValues & { id: string };
  defaultAgentId?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeOpen(next: boolean) {
    setOpen(next);

    // Drop the ?new= shortcut so a refresh doesn't reopen the dialog.
    if (!next && searchParams.has("new")) {
      router.replace(pathname, { scroll: false });
    }
  }

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogTrigger
        render={
          mission ? (
            <Button variant="outline">
              <Pencil />
              Edit
            </Button>
          ) : (
            <Button disabled={!squad.length}>
              <Plus />
              New mission
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mission ? "Edit mission" : "New mission"}</DialogTitle>
          <DialogDescription>
            {mission
              ? "Update the brief before running it again."
              : "Brief one of your agents. The mission waits in the queue until you run it."}
          </DialogDescription>
        </DialogHeader>
        <MissionForm
          defaultAgentId={defaultAgentId}
          key={formKey}
          mission={mission}
          onSaved={() => {
            changeOpen(false);
            setFormKey((key) => key + 1);
          }}
          squad={squad}
        />
      </DialogContent>
    </Dialog>
  );
}
