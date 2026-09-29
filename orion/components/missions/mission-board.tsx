import { MissionCard } from "@/components/missions/mission-card";
import { missionStatuses, type Mission } from "@/lib/domain/types";
import { statusLabels, statusStyles } from "@/lib/missions/presentation";
import { cn } from "@/lib/utils";

const emptyCopy = {
  queued: "New missions wait here until you run them.",
  in_progress: "Running missions appear here.",
  completed: "Finished documents land here.",
  failed: "Nothing has failed. Failed runs keep their text so you can retry.",
} as const;

export function MissionBoard({ missions }: { missions: Mission[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {missionStatuses.map((status) => {
        const items = missions.filter((mission) => mission.status === status);

        return (
          <section
            aria-labelledby={`column-${status}`}
            className={cn("flex min-h-64 flex-col rounded-2xl border p-3", statusStyles[status].column)}
            key={status}
          >
            <header className="mb-3 flex items-center gap-2 px-1">
              <span aria-hidden="true" className={cn("size-2 rounded-full", statusStyles[status].dot)} />
              <h2 className="text-sm font-semibold" id={`column-${status}`}>{statusLabels[status]}</h2>
              <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
                {items.length}
              </span>
            </header>
            <div className="grid gap-2.5">
              {items.length ? (
                items.map((mission) => <MissionCard key={mission.id} mission={mission} />)
              ) : (
                <p className="rounded-xl border border-dashed bg-background/60 px-3 py-6 text-center text-xs text-muted-foreground">
                  {emptyCopy[status]}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
