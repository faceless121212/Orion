import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";

import { removeAssignmentAction } from "@/app/(dashboard)/(admin)/users/actions";
import { AgentIcon } from "@/components/agents/agent-icon";
import { BackLink } from "@/components/shell/back-link";
import { PageHeader } from "@/components/shell/page-header";
import { AssignAgentForm } from "@/components/users/assign-agent-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { modelLabel } from "@/lib/agents/catalog";
import { uuidSchema } from "@/lib/agents/validation";
import { getRepository } from "@/lib/repository";

export default async function UserSquadPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  if (!uuidSchema.safeParse(userId).success) {
    notFound();
  }

  const repository = getRepository();
  const [user, squad, agents] = await Promise.all([
    repository.getProfile(userId),
    repository.listSquad(userId),
    repository.listAgents(),
  ]);

  if (!user) {
    notFound();
  }

  const assignedIds = new Set(squad.map((member) => member.agentId));
  const assignable = agents.filter((agent) => agent.status === "active" && !assignedIds.has(agent.id));

  return (
    <>
      <BackLink href="/users">All users</BackLink>
      <PageHeader description={`${user.email} · ${user.role}`} eyebrow="Squad" title={user.fullName} />

      <Card className="max-w-3xl shadow-none">
        <CardHeader>
          <CardTitle>Assign an agent</CardTitle>
          <CardDescription>Assigned agents appear in this employee&apos;s My Squad.</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignAgentForm agents={assignable.map(({ id, name }) => ({ id, name }))} userId={user.id} />
        </CardContent>
      </Card>

      <Card className="max-w-3xl shadow-none">
        <CardHeader>
          <CardTitle>Current squad</CardTitle>
          <CardDescription>{squad.length} {squad.length === 1 ? "agent" : "agents"} assigned.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {squad.length ? (
            squad.map((member) => (
              <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start" key={member.agentId}>
                <AgentIcon icon={member.icon} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {member.name}
                    {member.status === "archived" ? <Badge variant="outline">Archived</Badge> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{modelLabel(member.model)}</p>
                  {member.customInstructions ? (
                    <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                      <span className="font-medium text-foreground">Personal instructions: </span>
                      {member.customInstructions}
                    </p>
                  ) : null}
                </div>
                <form action={removeAssignmentAction}>
                  <input name="userId" type="hidden" value={user.id} />
                  <input name="agentId" type="hidden" value={member.agentId} />
                  <Button aria-label={`Remove ${member.name} from squad`} size="sm" type="submit" variant="destructive">
                    <Trash2 />
                    Remove
                  </Button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No agents assigned yet.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
