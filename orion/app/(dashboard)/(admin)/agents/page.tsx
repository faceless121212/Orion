import Link from "next/link";
import { Bot, Plus } from "lucide-react";

import { AgentIcon } from "@/components/agents/agent-icon";
import { EmptyState } from "@/components/shell/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { modelLabel } from "@/lib/agents/catalog";
import { getRepository } from "@/lib/repository";

export default async function AgentsPage() {
  const agents = await getRepository().listAgents();
  const newAgent = (
    <Link className={buttonVariants()} href="/agents/new">
      <Plus />
      New agent
    </Link>
  );

  return (
    <>
      <PageHeader actions={newAgent} description="Create and manage the AI specialists available to your company." eyebrow="Administration" title="Agents" />
      {agents.length ? (
        <Card className="overflow-hidden py-0 shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <Link className="flex items-center gap-3 hover:underline" href={`/agents/${agent.id}`}>
                      <AgentIcon icon={agent.icon} />
                      <span className="grid min-w-0">
                        <span className="font-medium">{agent.name}</span>
                        <span className="max-w-md truncate text-xs text-muted-foreground">{agent.description || "No description"}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{modelLabel(agent.model)}</TableCell>
                  <TableCell>
                    <Badge className="capitalize" variant={agent.status === "active" ? "secondary" : "outline"}>{agent.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {agent.assignedCount} {agent.assignedCount === 1 ? "user" : "users"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState action={newAgent} description="Configure names, models, system prompts, icons, and availability from this workspace." icon={Bot} title="Build your first agent" />
      )}
    </>
  );
}
