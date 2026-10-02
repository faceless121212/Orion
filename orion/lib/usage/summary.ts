import type { UsageEvent } from "@/lib/domain/types";

export type UsageTotals = { events: number; missions: number; tokens: number; costUsd: number };

export type UsageBreakdownRow = UsageTotals & { key: string; label: string };

export type UsageDay = { date: string; tokens: number; costUsd: number };

const emptyTotals = (): UsageTotals => ({ events: 0, missions: 0, tokens: 0, costUsd: 0 });

function add(totals: UsageTotals, event: UsageEvent) {
  totals.events += 1;
  totals.missions += event.eventType === "mission_run" ? 1 : 0;
  totals.tokens += event.inputTokens + event.outputTokens;
  totals.costUsd += event.costUsd;
}

export function summarizeUsage(events: UsageEvent[]): UsageTotals {
  const totals = emptyTotals();
  events.forEach((event) => add(totals, event));
  return totals;
}

export function breakdownBy(
  events: UsageEvent[],
  keyOf: (event: UsageEvent) => { key: string; label: string },
): UsageBreakdownRow[] {
  const rows = new Map<string, UsageBreakdownRow>();

  for (const event of events) {
    const { key, label } = keyOf(event);
    const row = rows.get(key) ?? { key, label, ...emptyTotals() };
    add(row, event);
    rows.set(key, row);
  }

  return [...rows.values()].sort((a, b) => b.costUsd - a.costUsd);
}

/** One entry per calendar day (UTC) for the last `days` days, oldest first. */
export function dailyUsage(events: UsageEvent[], days: number, now = Date.now()): UsageDay[] {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);

  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - 1 - index) * 86_400_000);
    return { date: date.toISOString().slice(0, 10), tokens: 0, costUsd: 0 };
  });
  const byDate = new Map(buckets.map((bucket) => [bucket.date, bucket]));

  for (const event of events) {
    const bucket = byDate.get(event.createdAt.slice(0, 10));
    if (bucket) {
      bucket.tokens += event.inputTokens + event.outputTokens;
      bucket.costUsd += event.costUsd;
    }
  }

  return buckets;
}

export const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);

export const formatTokens = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: value >= 100_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);

export function usageWindowStart(days: number, now = Date.now()) {
  return new Date(now - days * 86_400_000).toISOString();
}
