"use client";

import { useActionState, useState } from "react";
import { FilePlus2, LoaderCircle } from "lucide-react";

import { attachKnowledgeAction } from "@/app/(dashboard)/(admin)/agents/actions";
import { FileKindIcon, fileKindLabel } from "@/components/drive/file-kind-icon";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DriveFile } from "@/lib/domain/types";
import { initialFormState, type FormState } from "@/lib/form-state";

export function AttachKnowledgeDialog({ agentId, files }: { agentId: string; files: DriveFile[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (previous: FormState, formData: FormData) => {
    const result = await attachKnowledgeAction(previous, formData);
    if (result.status === "success") setOpen(false);
    return result;
  }, initialFormState);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button disabled={!files.length} variant="outline">
            <FilePlus2 />
            Add files
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add knowledge files</DialogTitle>
          <DialogDescription>Choose supported files from the company Google Drive.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <input name="agentId" type="hidden" value={agentId} />
          <FormMessage state={state.status === "error" ? state : initialFormState} />
          <fieldset className="grid max-h-80 gap-2 overflow-y-auto">
            <legend className="sr-only">Drive files</legend>
            {files.map((file) => (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-muted/50 has-checked:border-blue-400 has-checked:bg-blue-50/60" key={file.id}>
                <input className="size-4 accent-blue-600" name="fileIds" type="checkbox" value={file.id} />
                <FileKindIcon kind={file.kind} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{fileKindLabel(file.kind)}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <DialogFooter>
            <Button disabled={pending} type="submit">
              {pending ? <LoaderCircle className="animate-spin" /> : <FilePlus2 />}
              Attach selected
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
