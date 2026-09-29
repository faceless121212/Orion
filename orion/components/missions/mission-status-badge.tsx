import type { MissionStatus } from "@/lib/domain/types";
import { statusLabels, statusStyles } from "@/lib/missions/presentation";
import { cn } from "@/lib/utils";

export function MissionStatusBadge({ status, className }: { status: MissionStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        statusStyles[status].badge,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", statusStyles[status].dot)} />
      {statusLabels[status]}
    </span>
  );
}
