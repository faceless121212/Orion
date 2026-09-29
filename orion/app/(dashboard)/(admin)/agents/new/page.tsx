import { AgentForm } from "@/components/agents/agent-form";
import { BackLink } from "@/components/shell/back-link";
import { PageHeader } from "@/components/shell/page-header";
import { hasCompanyContext } from "@/lib/company/validation";
import { getCompanySettings } from "@/lib/data/company";

export default async function NewAgentPage() {
  const company = await getCompanySettings();

  return (
    <>
      <BackLink href="/agents">All agents</BackLink>
      <PageHeader description="Define a specialist that employees can use for their missions." eyebrow="Administration" title="New agent" />
      <AgentForm hasCompanyContext={hasCompanyContext(company)} />
    </>
  );
}
