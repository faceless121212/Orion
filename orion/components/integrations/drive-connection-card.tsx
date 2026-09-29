"use client";

import { useActionState, useState } from "react";
import { Cable, CheckCircle2, CircleOff, LoaderCircle, Unplug } from "lucide-react";

import { connectDriveAction, disconnectDriveAction } from "@/app/(dashboard)/(admin)/integrations/actions";
import { FormMessage } from "@/components/forms/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DriveConnection } from "@/lib/domain/types";
import { initialFormState } from "@/lib/form-state";
import { formatRelative } from "@/lib/missions/presentation";

export function DriveConnectionCard({ connection, fileCount }: { connection: DriveConnection; fileCount: number }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async () => {
    const result = connection.status === "connected" ? await disconnectDriveAction() : await connectDriveAction();
    setConfirmOpen(false);
    return result;
  }, initialFormState);
  const connected = connection.status === "connected";

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Cable className="size-5 text-blue-600" />
            Google Drive
          </CardTitle>
          <CardDescription className="mt-2">
            Create Docs, Sheets, and PDFs from missions, and give agents read access to selected files.
          </CardDescription>
        </div>
        {connected ? (
          <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700" variant="outline">
            <CheckCircle2 className="size-3" />
            Connected
          </Badge>
        ) : (
          <Badge className="gap-1" variant="outline">
            <CircleOff className="size-3" />
            Not connected
          </Badge>
        )}
      </CardHeader>
      <CardContent className="grid gap-4 border-t pt-5">
        <FormMessage state={state} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {connection.status === "connected" ? (
            <dl className="grid gap-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Account</dt>
                <dd className="font-medium">{connection.accountEmail}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Connected</dt>
                <dd>{formatRelative(connection.connectedAt)} · {fileCount} supported files visible</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              One company-level connection. Missions cannot create files and agents cannot use knowledge until Drive is connected.
            </p>
          )}

          {connected ? (
            <Dialog onOpenChange={setConfirmOpen} open={confirmOpen}>
              <DialogTrigger render={<Button variant="outline"><Unplug />Disconnect</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disconnect Google Drive?</DialogTitle>
                  <DialogDescription>
                    Missions will stop creating files and agents lose access to their knowledge files until you reconnect. Existing documents stay in Drive.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <form action={formAction}>
                    <Button disabled={pending} type="submit" variant="destructive">
                      {pending ? <LoaderCircle className="animate-spin" /> : <Unplug />}
                      Disconnect
                    </Button>
                  </form>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <form action={formAction}>
              <Button disabled={pending} type="submit">
                {pending ? <LoaderCircle className="animate-spin" /> : <Cable />}
                Connect Google Drive
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
