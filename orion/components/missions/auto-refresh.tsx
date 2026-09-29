"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the current route while work is running so status changes appear. */
export function AutoRefresh({ active, intervalMs = 2000 }: { active: boolean; intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    const timer = window.setInterval(() => router.refresh(), intervalMs);
    return () => window.clearInterval(timer);
  }, [active, intervalMs, router]);

  return null;
}
