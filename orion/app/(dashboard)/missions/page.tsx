import { ClipboardList, Plus, ShieldAlert, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Queued", value: "0" },
  { label: "In progress", value: "0" },
  { label: "Completed", value: "0" },
];

export default async function MissionsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <>
      {params.error === "forbidden" ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <ShieldAlert className="size-4 shrink-0" />
          Your role does not allow access to that administration page.
        </div>
      ) : null}

      <PageHeader
        actions={<Button disabled><Plus />New mission</Button>}
        description="Plan work for your assigned agents and follow every output from brief to completion."
        eyebrow="Workspace"
        title="Missions"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="shadow-none">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <EmptyState
        action={<Button disabled variant="outline"><Sparkles />Mission builder arrives in Phase 3</Button>}
        description="Once an administrator assigns agents to your squad, you will be able to turn a brief into a Google Doc, Sheet, or PDF."
        icon={ClipboardList}
        title="No missions yet"
      />
    </>
  );
}
