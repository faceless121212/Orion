import { formatTokens, formatUsd, type UsageDay } from "@/lib/usage/summary";

const dayLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Single-series daily cost bars; each column is a full-height hover target. */
export function DailyCostChart({ days }: { days: UsageDay[] }) {
  const max = Math.max(...days.map((day) => day.costUsd), 0.01);
  const total = days.reduce((sum, day) => sum + day.costUsd, 0);

  return (
    <figure>
      <div className="flex h-44 items-stretch gap-0.5 border-b border-border/70" aria-hidden="true">
        {days.map((day, index) => {
          const align =
            index < 3 ? "left-0" : index >= days.length - 3 ? "right-0" : "left-1/2 -translate-x-1/2";
          const height = day.costUsd > 0 ? Math.max((day.costUsd / max) * 100, 3) : 0;

          return (
            <div className="group relative flex flex-1 flex-col justify-end" key={day.date}>
              <div
                className="mx-auto w-3/5 max-w-7 rounded-t-[4px] bg-blue-600 transition-colors group-hover:bg-blue-700"
                style={{ height: `${height}%` }}
              />
              <div className={`pointer-events-none absolute top-0 z-10 hidden rounded-lg ${align} border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md group-hover:block`}>
                <p className="font-medium">{dayLabel(day.date)}</p>
                <p className="text-muted-foreground">
                  {formatUsd(day.costUsd)} · {formatTokens(day.tokens)} tokens
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground" aria-hidden="true">
        <span>{dayLabel(days[0].date)}</span>
        <span>{dayLabel(days[days.length - 1].date)}</span>
      </div>
      <figcaption className="sr-only">
        Estimated cost per day for the last {days.length} days, {formatUsd(total)} in total.
      </figcaption>
      <table className="sr-only">
        <thead>
          <tr>
            <th>Day</th>
            <th>Estimated cost</th>
            <th>Tokens</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <td>{dayLabel(day.date)}</td>
              <td>{formatUsd(day.costUsd)}</td>
              <td>{formatTokens(day.tokens)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
