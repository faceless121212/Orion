import { FileKindIcon, fileKindLabel, formatBytes } from "@/components/drive/file-kind-icon";
import { DriveConnectionCard } from "@/components/integrations/drive-connection-card";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRelative } from "@/lib/missions/presentation";
import { getRepository } from "@/lib/repository";

export default async function IntegrationsPage() {
  const repository = getRepository();
  const [connection, files] = await Promise.all([repository.getDriveConnection(), repository.listDriveFiles()]);

  return (
    <>
      <PageHeader description="Connect company services once so agents can create and retrieve approved files." eyebrow="Administration" title="Integrations" />
      <div className="grid max-w-4xl gap-6">
        <DriveConnectionCard connection={connection} fileCount={files.length} />

        {connection.status === "connected" ? (
          <Card className="gap-0 overflow-hidden pb-0 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle>Available files</CardTitle>
              <CardDescription>
                Google Docs, Sheets, DOCX, PDF, TXT, and CSV files agents can use as knowledge. Attach them from an agent&apos;s page.
              </CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <span className="flex items-center gap-3 font-medium">
                        <FileKindIcon kind={file.kind} />
                        {file.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{fileKindLabel(file.kind)}</TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">{formatBytes(file.sizeBytes)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatRelative(file.modifiedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : null}
      </div>
    </>
  );
}
