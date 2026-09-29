import Link from "next/link";

import { BreakdownTable } from "@/components/usage/breakdown-table";
import { DailyCostChart } from "@/components/usage/daily-cost-chart";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { modelLabel } from "@/lib/agents/catalog";
import { requireUser } from "@/lib/auth/session";
import { formatRelative } from "@/lib/missions/presentation";
import { getRepository } from "@/lib/repository";
import {
  breakdownBy,
  dailyUsage,
  formatTokens,
  formatUsd,
  summarizeUsage,
  usageWindowStart,
} from "@/lib/usage/summary";
import { cn } from "@/lib/utils";

const RANGE_DAYS = 30;

export default async function UsagePage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const [params, profile] = await Promise.all([searchParams, requireUser()]);
  const isAdmin = profile.role === "admin";
  // Employees always see only their own usage; admins can widen to everyone.
  const everyone = isAdmin && params.scope !== "me";
  const since = usageWindowStart(RANGE_DAYS);
  const events = await getRepository().listUsage({ userId: everyone ? undefined : profile.id, since });

  const totals = summarizeUsage(events);
  const byAgent = breakdownBy(events, (event) =>
    event.agentId
      ? { key: event.agentId, label: event.agentName ?? "Deleted agent" }
      : { key: "prompt-generation", label: "Prompt generation" },
  );
  const byUser = breakdownBy(events, (event) => ({ key: event.userId, label: event.userName }));

  const tiles = [
    { label: "Missions run", value: String(totals.missions) },
    { label: "Tokens used", value: formatTokens(totals.tokens) },
    { label: "Estimated cost", value: formatUsd(totals.costUsd) },
    { label: "Average per mission", value: totals.missions ? formatUsd(totals.costUsd / totals.missions) : "—" },
  ];

  return (
    <>
      <PageHeader
        actions={
          isAdmin ? (
            <nav aria-label="Usage scope" className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-sm">
              {[
                { href: "/usage", label: "Everyone", active: everyone },
                { href: "/usage?scope=me", label: "Just me", active: !everyone },
              ].map((option) => (
                <Link
                  aria-current={option.active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1 font-medium text-muted-foreground transition",
                    option.active && "bg-background text-foreground shadow-xs",
                  )}
                  href={option.href}
                  key={option.href}
                >
                  {option.label}
                </Link>
              ))}
            </nav>
          ) : null
        }
        description={`Mission activity and AI consumption over the last ${RANGE_DAYS} days${everyone ? " across the workspace" : ""}. Costs are estimates at list price.`}
        eyebrow="Insights"
        title="Usage"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card className="shadow-none" key={tile.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">{tile.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight tabular-nums">{tile.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Estimated cost per day</CardTitle>
          <CardDescription>Last 14 days. Hover a bar for the day&apos;s cost and tokens.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <DailyCostChart days={dailyUsage(events, 14)} />
        </CardContent>
      </Card>

      <div className={cn("grid gap-6", everyone && "xl:grid-cols-2")}>
        <BreakdownTable description="Where the spend goes, highest first." label="Agent" rows={byAgent} title="By agent" />
        {everyone ? (
          <BreakdownTable description="Who is using Orion the most." label="Person" rows={byUser} title="By person" />
        ) : null}
      </div>

      <Card className="gap-0 overflow-hidden pb-0 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle>Recent events</CardTitle>
          <CardDescription>The latest 25 billable events.</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              {everyone ? <TableHead>Person</TableHead> : null}
              <TableHead>Agent</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length ? (
              events.slice(0, 25).map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Badge variant={event.eventType === "mission_run" ? "secondary" : "outline"}>
                      {event.eventType === "mission_run" ? "Mission run" : "Prompt generation"}
                    </Badge>
                  </TableCell>
                  {everyone ? <TableCell>{event.userName}</TableCell> : null}
                  <TableCell className="text-muted-foreground">{event.agentName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{modelLabel(event.model)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatTokens(event.inputTokens + event.outputTokens)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatUsd(event.costUsd)}</TableCell>
                  <TableCell className="text-right text-muted-foreground" title={event.createdAt}>
                    {formatRelative(event.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-32 text-center text-muted-foreground" colSpan={everyone ? 7 : 6}>
                  Usage events will appear after the first mission.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
