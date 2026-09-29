import { ArrowRight, ShieldCheck } from "lucide-react";

import { demoSignInAction } from "@/app/(auth)/actions";
import { UserAvatar } from "@/components/shell/user-avatar";
import type { Profile } from "@/lib/domain/types";

export function PersonaPicker({ personas }: { personas: Profile[] }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Demo mode: data lives in memory and resets when the server restarts. Pick a persona to explore.
      </div>
      {personas.map((persona) => (
        <form action={demoSignInAction} key={persona.id}>
          <input name="userId" type="hidden" value={persona.id} />
          <button
            className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50 focus-visible:ring-4 focus-visible:ring-blue-100 focus-visible:outline-none"
            type="submit"
          >
            <UserAvatar avatarUrl={persona.avatarUrl} className="size-11" name={persona.fullName} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-semibold text-slate-950">
                {persona.fullName}
                {persona.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                    <ShieldCheck className="size-3" />
                    Admin
                  </span>
                ) : null}
              </span>
              <span className="block truncate text-sm text-slate-500">{persona.jobTitle} · {persona.email}</span>
            </span>
            <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
          </button>
        </form>
      ))}
    </div>
  );
}
