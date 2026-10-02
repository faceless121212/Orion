"use client";

import { useActionState, useRef, useState } from "react";
import { ImageUp, LoaderCircle, Trash2 } from "lucide-react";

import { removeAvatarAction, uploadAvatarAction } from "@/app/(dashboard)/settings/actions";
import { FormMessage } from "@/components/forms/form-message";
import { UserAvatar } from "@/components/shell/user-avatar";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/form-state";
import { avatarTypes, validateAvatar } from "@/lib/profile/validation";

export function AvatarUpload({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [state, formAction, pending] = useActionState(uploadAvatarAction, initialFormState);
  const [clientError, setClientError] = useState<string>();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <UserAvatar avatarUrl={avatarUrl} className="size-20" fallbackClassName="text-xl" name={name} />
      <div className="grid gap-2">
        <div className="flex flex-wrap gap-2">
          <form action={formAction} ref={formRef}>
            <label className="sr-only" htmlFor="avatar">Upload a photo</label>
            <input
              accept={avatarTypes.join(",")}
              className="sr-only"
              id="avatar"
              name="avatar"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (!file) return;

                const problem = validateAvatar(file);
                setClientError(problem ?? undefined);
                if (!problem) formRef.current?.requestSubmit();
              }}
              type="file"
            />
            <Button
              disabled={pending}
              onClick={() => document.getElementById("avatar")?.click()}
              type="button"
              variant="outline"
            >
              {pending ? <LoaderCircle className="animate-spin" /> : <ImageUp />}
              {avatarUrl ? "Change photo" : "Upload photo"}
            </Button>
          </form>
          {avatarUrl ? (
            <form action={removeAvatarAction}>
              <Button type="submit" variant="ghost">
                <Trash2 />
                Remove
              </Button>
            </form>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, or GIF up to 1 MB.</p>
        {clientError ? (
          <p className="text-sm text-red-600" role="alert">{clientError}</p>
        ) : (
          <FormMessage state={state} />
        )}
      </div>
    </div>
  );
}
