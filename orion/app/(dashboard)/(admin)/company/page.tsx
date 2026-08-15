import { Building2 } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { PageHeader } from "@/components/shell/page-header";

export default function CompanyPage() {
  return (
    <>
      <PageHeader description="Centralize the company context and brand guidance every agent should understand." eyebrow="Administration" title="Company" />
      <EmptyState description="Company facts, audience context, voice, and writing guidance will be configured here in Phase 2." icon={Building2} title="Add company context" />
    </>
  );
}
