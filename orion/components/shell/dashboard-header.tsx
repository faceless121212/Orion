import { PersonaSwitcher } from "@/components/demo/persona-switcher";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { CurrentProfile } from "@/lib/auth/session";
import type { Profile } from "@/lib/domain/types";

export function DashboardHeader({
  profile,
  companyName,
  demoPersonas,
}: {
  profile: CurrentProfile;
  companyName: string;
  demoPersonas?: Profile[];
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />
      <Separator className="h-5" orientation="vertical" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{companyName || "Orion workspace"}</p>
        <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
      </div>
      {demoPersonas ? (
        <PersonaSwitcher current={profile.id} personas={demoPersonas} />
      ) : (
        <Badge className="capitalize" variant="secondary">
          {profile.role}
        </Badge>
      )}
    </header>
  );
}
