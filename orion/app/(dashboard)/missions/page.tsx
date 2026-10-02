import Link from "next/link";
import { ClipboardList, ShieldAlert } from "lucide-react";

import { AutoRefresh } from "@/components/missions/auto-refresh";
import { MissionBoard } from "@/components/missions/mission-board";
import { MissionDialog } from "@/components/missions/mission-dialog";
import { EmptyState } from "@/components/shell/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { missionStatuses } from "@/lib/domain/types";
import { statusLabels } from "@/lib/missions/presentation";
import { getRepository } from "@/lib/repository";

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; new?: string }>;
}) {
  const [params, profile] = await Promise.all([searchParams, requireUser()]);
  const repository = getRepository();
  const [missions, squad] = await Promise.all([
    repository.listMissions(profile.id),
    repository.listSquad(profile.id),
  ]);
  const activeSquad = squad
    .filter((member) => member.status === "active")
    .map(({ agentId, name }) => ({ agentId, name }));
  const requestedAgent = activeSquad.find((member) => member.agentId === params.new)?.agentId;

  return (
    <>
      <AutoRefresh active={missions.some((mission) => mission.status === "in_progress")} />

      {params.error === "forbidden" ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <ShieldAlert className="size-4 shrink-0" />
          Your role does not allow access to that administration page.
        </div>
      ) : null}

      <PageHeader
        actions={
          <MissionDialog
            defaultAgentId={requestedAgent}
            defaultOpen={Boolean(requestedAgent)}
            key={requestedAgent ?? "new"}
            squad={activeSquad}
          />
        }
        description="Plan work for your assigned agents and follow every output from brief to completion."
        eyebrow="Workspace"
        title="Missions"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {missionStatuses.map((status) => (
          <Card className="shadow-none" key={status}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">{statusLabels[status]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">
                {missions.filter((mission) => mission.status === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeSquad.length || missions.length ? (
        <MissionBoard missions={missions} />
      ) : (
        <EmptyState
          action={<Link className={buttonVariants({ variant: "outline" })} href="/squad">Open My Squad</Link>}
          description="Once an administrator assigns agents to your squad, you can turn a brief into a Google Doc, Sheet, or PDF."
          icon={ClipboardList} image="/brand/empty/missions.webp"
          title="No agents in your squad yet"
        />
      )}
    </>
  );
}
