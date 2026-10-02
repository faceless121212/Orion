import type { MissionStatus, OutputFormat } from "@/lib/domain/types";

export const statusLabels: Record<MissionStatus, string> = {
  queued: "Queued",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
};

export const outputFormatLabels: Record<OutputFormat, string> = {
  google_doc: "Google Doc",
  google_sheet: "Google Sheet",
  pdf: "PDF",
};

export const statusStyles: Record<MissionStatus, { dot: string; badge: string; column: string }> = {
  queued: { dot: "bg-slate-400", badge: "border-slate-200 bg-slate-50 text-slate-700", column: "bg-slate-50/70" },
  in_progress: { dot: "bg-blue-500 animate-pulse", badge: "border-blue-200 bg-blue-50 text-blue-700", column: "bg-blue-50/40" },
  completed: { dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", column: "bg-emerald-50/40" },
  failed: { dot: "bg-red-500", badge: "border-red-200 bg-red-50 text-red-700", column: "bg-red-50/40" },
};

export function canEditMission(status: MissionStatus) {
  return status === "queued" || status === "failed";
}

export function formatRelative(iso: string, now = Date.now()) {
  const seconds = Math.round((now - Date.parse(iso)) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return formatter.format(-Math.round(seconds / size), unit);
  }

  return "just now";
}

/** Output links must be relative or https; anything else (e.g. javascript:) is dropped. */
export function safeOutputUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")) return url;

  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
