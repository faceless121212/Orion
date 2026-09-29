"use client";

import { FlaskConical } from "lucide-react";

import { demoSignInAction } from "@/app/(auth)/actions";
import type { Profile } from "@/lib/domain/types";

export function PersonaSwitcher({ current, personas }: { current: string; personas: Profile[] }) {
  return (
    <form action={demoSignInAction} className="flex items-center gap-2">
      <span className="hidden items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 sm:inline-flex">
        <FlaskConical className="size-3" />
        Demo
      </span>
      <label className="sr-only" htmlFor="demo-persona">Switch demo persona</label>
      <select
        className="h-8 max-w-44 rounded-lg border border-input bg-background px-2 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        defaultValue={current}
        id="demo-persona"
        name="userId"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {personas.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.fullName} ({persona.role === "admin" ? "Admin" : "Employee"})
          </option>
        ))}
      </select>
    </form>
  );
}
