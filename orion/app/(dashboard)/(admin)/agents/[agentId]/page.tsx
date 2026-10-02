import { notFound } from "next/navigation";

import { AgentForm } from "@/components/agents/agent-form";
import { KnowledgeCard } from "@/components/agents/knowledge-card";
import { BackLink } from "@/components/shell/back-link";
import { PageHeader } from "@/components/shell/page-header";
import { uuidSchema } from "@/lib/agents/validation";
import { hasCompanyContext } from "@/lib/company/validation";
import { getRepository } from "@/lib/repository";

export default async function EditAgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ agentId: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ agentId }, { created }] = await Promise.all([params, searchParams]);

  if (!uuidSchema.safeParse(agentId).success) {
    notFound();
  }

  const repository = getRepository();
  const [agent, company, connection, knowledge, driveFiles] = await Promise.all([
    repository.getAgent(agentId),
    repository.getCompanySettings(),
    repository.getDriveConnection(),
    repository.listKnowledge(agentId),
    repository.listDriveFiles(),
  ]);

  if (!agent) {
    notFound();
  }

  return (
    <>
      <BackLink href="/agents">All agents</BackLink>
      <PageHeader description="Update this agent's profile, model, and standing instructions." eyebrow="Administration" title={agent.name} />
      <AgentForm
        agent={agent}
        created={created === "1"}
        hasCompanyContext={hasCompanyContext(company)}
      />
      <KnowledgeCard agentId={agent.id} connection={connection} driveFiles={driveFiles} knowledge={knowledge} />
    </>
  );
}
