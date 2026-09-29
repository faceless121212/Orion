import { Users } from "lucide-react";

import { AgentIcon } from "@/components/agents/agent-icon";
import { EmptyState } from "@/components/shell/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { InstructionsForm } from "@/components/squad/instructions-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { modelLabel } from "@/lib/agents/catalog";
import { requireUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/repository";

export default async function SquadPage() {
  const profile = await requireUser();
  const squad = (await getRepository().listSquad(profile.id)).filter((member) => member.status === "active");

  return (
    <>
      <PageHeader description="The AI agents assigned to you, and the personal instructions you give each one." eyebrow="Workspace" title="My Squad" />
      {squad.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {squad.map((member) => (
            <Card className="shadow-none" key={member.agentId}>
              <CardHeader className="flex flex-row items-start gap-3">
                <AgentIcon icon={member.icon} />
                <div className="min-w-0 flex-1">
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="mt-1">{member.description || "No description provided."}</CardDescription>
                </div>
                <Badge variant="secondary">{modelLabel(member.model)}</Badge>
              </CardHeader>
              <CardContent>
                <InstructionsForm agentId={member.agentId} agentName={member.name} instructions={member.customInstructions} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState description="Your squad is empty. An administrator assigns agents to you from the Users page." icon={Users} title="No agents assigned yet" />
      )}
    </>
  );
}
