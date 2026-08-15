import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { CurrentProfile } from "@/lib/auth/session";

export function DashboardHeader({ profile }: { profile: CurrentProfile }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />
      <Separator className="h-5" orientation="vertical" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Orion workspace</p>
        <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
      </div>
      <Badge className="capitalize" variant="secondary">
        {profile.role}
      </Badge>
    </header>
  );
}
