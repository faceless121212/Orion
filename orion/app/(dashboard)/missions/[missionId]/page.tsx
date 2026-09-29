import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Globe, LoaderCircle, Trash2 } from "lucide-react";

import { deleteMissionAction } from "@/app/(dashboard)/missions/actions";
import { AgentIcon } from "@/components/agents/agent-icon";
import { AutoRefresh } from "@/components/missions/auto-refresh";
import { MissionDialog } from "@/components/missions/mission-dialog";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import { RunMissionForm } from "@/components/missions/run-mission-form";
import { BackLink } from "@/components/shell/back-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { uuidSchema } from "@/lib/agents/validation";
import { requireUser } from "@/lib/auth/session";
import { canEditMission, formatRelative, outputFormatLabels } from "@/lib/missions/presentation";
import { getRepository } from "@/lib/repository";

function Timestamp({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm" title={value ?? undefined}>
        {value ? formatRelative(value) : "—"}
      </dd>
    </div>
  );
}

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const [{ missionId }, profile] = await Promise.all([params, requireUser()]);

  if (!uuidSchema.safeParse(missionId).success) {
    notFound();
  }

  const repository = getRepository();
  const [mission, squad] = await Promise.all([
    repository.getMission(profile.id, missionId),
    repository.listSquad(profile.id),
  ]);

  if (!mission) {
    notFound();
  }

  const editable = canEditMission(mission.status);
  const squadOptions = squad
    .filter((member) => member.status === "active")
    .map(({ agentId, name }) => ({ agentId, name }));
  const agentAvailable = squadOptions.some((member) => member.agentId === mission.agentId);

  return (
    <>
      <AutoRefresh active={mission.status === "in_progress"} />
      <BackLink href="/missions">All missions</BackLink>

      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <AgentIcon className="size-12 rounded-2xl" icon={mission.agentIcon} />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <MissionStatusBadge status={mission.status} />
              <span className="text-xs text-muted-foreground">{mission.agentName}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{mission.title}</h1>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-start gap-2">
          {editable && agentAvailable ? (
            <MissionDialog
              mission={{
                id: mission.id,
                agentId: mission.agentId,
                title: mission.title,
                brief: mission.brief,
                webSearch: mission.webSearch,
                outputFormat: mission.outputFormat,
              }}
              squad={squadOptions}
            />
          ) : null}
          {editable ? (
            <form action={deleteMissionAction}>
              <input name="missionId" type="hidden" value={mission.id} />
              <Button type="submit" variant="destructive">
                <Trash2 />
                Delete
              </Button>
            </form>
          ) : null}
          {editable && agentAvailable ? (
            <RunMissionForm missionId={mission.id} retry={mission.status === "failed"} />
          ) : null}
        </div>
      </div>

      {editable && !agentAvailable ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {mission.agentName} is no longer in your squad, so this mission can&apos;t run. Ask an administrator to reassign it.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid h-fit gap-6">
          {mission.status === "in_progress" ? (
            <Card className="border-blue-200 bg-blue-50/50 shadow-none">
              <CardContent className="flex items-center gap-3 text-sm text-blue-900">
                <LoaderCircle className="size-5 animate-spin" />
                {mission.agentName} is working on this mission. This page updates automatically.
              </CardContent>
            </Card>
          ) : null}

          {mission.status === "completed" && mission.outputUrl ? (
            <Card className="border-emerald-200 bg-emerald-50/50 shadow-none">
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                  <CheckCircle2 className="size-5" />
                  Your {outputFormatLabels[mission.outputFormat]} is ready.
                </p>
                <Link className={buttonVariants()} href={mission.outputUrl} target={mission.outputUrl.startsWith("http") ? "_blank" : undefined}>
                  Open {outputFormatLabels[mission.outputFormat]}
                  <ExternalLink />
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {mission.status === "failed" ? (
            <Card className="border-red-200 bg-red-50/50 shadow-none">
              <CardContent className="flex gap-3 text-sm text-red-900">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-medium">The run failed.</p>
                  <p className="mt-1 text-red-800">{mission.error ?? "No error details were recorded."}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Brief</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 whitespace-pre-wrap">{mission.brief}</p>
            </CardContent>
          </Card>

          {mission.outputText && mission.status === "failed" ? (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Text result</CardTitle>
                <CardDescription>Kept because the file could not be created. Copy it or retry the mission.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="max-h-96 overflow-auto rounded-xl bg-muted p-4 text-xs leading-5 whitespace-pre-wrap">{mission.outputText}</pre>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="h-fit shadow-none">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Output</dt>
                <dd className="mt-1 text-sm">{outputFormatLabels[mission.outputFormat]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Web search</dt>
                <dd className="mt-1 flex items-center gap-1 text-sm">
                  <Globe className="size-3.5 text-muted-foreground" />
                  {mission.webSearch ? "Allowed" : "Off"}
                </dd>
              </div>
              <Timestamp label="Created" value={mission.createdAt} />
              <Timestamp label="Started" value={mission.startedAt} />
              <Timestamp label="Finished" value={mission.completedAt} />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</dt>
                <dd className="mt-1 flex items-center gap-1 text-sm">
                  <Clock className="size-3.5 text-muted-foreground" />
                  Updated {formatRelative(mission.updatedAt)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
