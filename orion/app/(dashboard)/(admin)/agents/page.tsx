import { Bot, Plus } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";

export default function AgentsPage() {
  return (
    <>
      <PageHeader actions={<Button disabled><Plus />New agent</Button>} description="Create and manage the AI specialists available to your company." eyebrow="Administration" title="Agents" />
      <EmptyState action={<Button disabled variant="outline">Agent editor arrives in Phase 2</Button>} description="Configure names, models, system prompts, icons, and availability from this workspace." icon={Bot} title="Build your first agent" />
    </>
  );
}
