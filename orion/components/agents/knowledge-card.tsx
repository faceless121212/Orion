import Link from "next/link";
import { BookOpen, Trash2 } from "lucide-react";

import { detachKnowledgeAction } from "@/app/(dashboard)/(admin)/agents/actions";
import { AttachKnowledgeDialog } from "@/components/agents/attach-knowledge-dialog";
import { FileKindIcon, fileKindLabel } from "@/components/drive/file-kind-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DriveConnection, DriveFile, KnowledgeFile } from "@/lib/domain/types";
import { formatRelative } from "@/lib/missions/presentation";

export function KnowledgeCard({
  agentId,
  connection,
  knowledge,
  driveFiles,
}: {
  agentId: string;
  connection: DriveConnection;
  knowledge: KnowledgeFile[];
  driveFiles: DriveFile[];
}) {
  const attached = new Set(knowledge.map((file) => file.id));
  const available = driveFiles.filter((file) => !attached.has(file.id));

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-blue-600" />
            Knowledge
          </CardTitle>
          <CardDescription className="mt-1.5">
            Drive files this agent reads on every mission. Orion stores only file references, never file contents.
          </CardDescription>
        </div>
        {connection.status === "connected" ? <AttachKnowledgeDialog agentId={agentId} files={available} /> : null}
      </CardHeader>
      <CardContent className="grid gap-2">
        {connection.status !== "connected" ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Google Drive is not connected. <Link className="font-medium underline" href="/integrations">Connect it</Link> to attach knowledge files.
          </p>
        ) : null}
        {knowledge.length ? (
          knowledge.map((file) => (
            <div className="flex items-center gap-3 rounded-xl border p-3" key={file.id}>
              <FileKindIcon kind={file.kind} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {fileKindLabel(file.kind)} · attached {formatRelative(file.attachedAt)}
                </p>
              </div>
              <form action={detachKnowledgeAction}>
                <input name="agentId" type="hidden" value={agentId} />
                <input name="fileIds" type="hidden" value={file.id} />
                <Button aria-label={`Remove ${file.name}`} size="icon-sm" type="submit" variant="ghost">
                  <Trash2 />
                </Button>
              </form>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">No knowledge files attached yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
