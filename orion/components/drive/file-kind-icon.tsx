import { File, FileSpreadsheet, FileText, FileType, Sheet } from "lucide-react";

import type { DriveFileKind } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const kinds: Record<DriveFileKind, { icon: typeof File; label: string; className: string }> = {
  doc: { icon: FileText, label: "Google Doc", className: "bg-blue-50 text-blue-600" },
  sheet: { icon: FileSpreadsheet, label: "Google Sheet", className: "bg-emerald-50 text-emerald-600" },
  pdf: { icon: FileType, label: "PDF", className: "bg-red-50 text-red-600" },
  docx: { icon: FileText, label: "Word document", className: "bg-sky-50 text-sky-700" },
  txt: { icon: File, label: "Text file", className: "bg-slate-100 text-slate-600" },
  csv: { icon: Sheet, label: "CSV", className: "bg-lime-50 text-lime-700" },
};

export const fileKindLabel = (kind: DriveFileKind) => kinds[kind].label;

export function FileKindIcon({ kind, className }: { kind: DriveFileKind; className?: string }) {
  const { icon: Icon, label, className: tone } = kinds[kind];

  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", tone, className)} title={label}>
      <Icon aria-hidden="true" className="size-4" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export const formatBytes = (bytes: number) =>
  bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
