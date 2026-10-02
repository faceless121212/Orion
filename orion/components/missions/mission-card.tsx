import Link from "next/link";
import { FileSpreadsheet, FileText, FileType, Globe } from "lucide-react";

import { AgentIcon } from "@/components/agents/agent-icon";
import type { Mission, OutputFormat } from "@/lib/domain/types";
import { formatRelative, outputFormatLabels } from "@/lib/missions/presentation";

const formatIcons: Record<OutputFormat, typeof FileText> = {
  google_doc: FileText,
  google_sheet: FileSpreadsheet,
  pdf: FileType,
};

export function MissionCard({ mission }: { mission: Mission }) {
  const FormatIcon = formatIcons[mission.outputFormat];

  return (
    <Link
      className="group block rounded-xl border bg-card p-3.5 shadow-xs transition hover:border-blue-300 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      href={`/missions/${mission.id}`}
    >
      <div className="flex items-start gap-3">
        <AgentIcon className="size-8 rounded-lg" icon={mission.agentIcon} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold group-hover:text-blue-700">{mission.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{mission.agentName}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{mission.brief}</p>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <FormatIcon className="size-3.5" />
          {outputFormatLabels[mission.outputFormat]}
        </span>
        {mission.webSearch ? (
          <span className="inline-flex items-center gap-1">
            <Globe className="size-3.5" />
            Web
          </span>
        ) : null}
        <span className="ml-auto">{formatRelative(mission.updatedAt)}</span>
      </div>
      {mission.status === "in_progress" ? (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-1/3 animate-[mission-progress_1.4s_ease-in-out_infinite] rounded-full bg-blue-500" />
        </div>
      ) : null}
    </Link>
  );
}
