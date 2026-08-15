import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UsagePage() {
  return (
    <>
      <PageHeader description="Review mission activity and AI consumption across your permitted workspace." eyebrow="Insights" title="Usage" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Missions this month", "0"],
          ["Tokens used", "0"],
          ["Estimated cost", "$0.00"],
        ].map(([label, value]) => (
          <Card key={label} className="shadow-none">
            <CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold tracking-tight">{value}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden shadow-none">
        <Table>
          <TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Agent</TableHead><TableHead>Tokens</TableHead><TableHead className="text-right">Date</TableHead></TableRow></TableHeader>
          <TableBody><TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Usage events will appear after the first mission.</TableCell></TableRow></TableBody>
        </Table>
      </Card>
      <div className="hidden"><EmptyState icon={BarChart3} title="No usage recorded" description="Usage events arrive in Phase 4." /></div>
    </>
  );
}
