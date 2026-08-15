import { Cable, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader description="Connect company services once so agents can create and retrieve approved files." eyebrow="Administration" title="Integrations" />
      <Card className="max-w-2xl shadow-none">
        <CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle className="flex items-center gap-2"><Cable className="size-5 text-blue-600" />Google Drive</CardTitle><CardDescription className="mt-2">Create Docs, Sheets, and PDFs from completed missions.</CardDescription></div><Badge variant="outline">Not connected</Badge></CardHeader>
        <CardContent className="flex items-center justify-between border-t pt-5"><p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4" />Company-level connection</p><Button disabled variant="outline">Connect in Phase 3</Button></CardContent>
      </Card>
    </>
  );
}
