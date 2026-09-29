import { AppSidebar } from "@/components/shell/app-sidebar";
import { DashboardHeader } from "@/components/shell/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/mode";
import { getRepository } from "@/lib/repository";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();
  const repository = getRepository();
  const demo = isDemoMode();
  const [squad, company, personas] = await Promise.all([
    repository.listSquad(profile.id),
    repository.getCompanySettings(),
    demo ? repository.listUsers() : Promise.resolve(undefined),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar
        profile={profile}
        squad={squad
          .filter((member) => member.status === "active")
          .map(({ agentId, name, icon }) => ({ agentId, name, icon }))}
      />
      <SidebarInset>
        <DashboardHeader companyName={company.companyName} demoPersonas={personas} profile={profile} />
        <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
