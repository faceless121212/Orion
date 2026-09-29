import { notFound } from "next/navigation";

import { AgentForm } from "@/components/agents/agent-form";
import { BackLink } from "@/components/shell/back-link";
import { PageHeader } from "@/components/shell/page-header";
import { uuidSchema } from "@/lib/agents/validation";
import { hasCompanyContext } from "@/lib/company/validation";
import { getAgent } from "@/lib/data/agents";
import { getCompanySettings } from "@/lib/data/company";

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

  const [agent, company] = await Promise.all([getAgent(agentId), getCompanySettings()]);

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
    </>
  );
}
