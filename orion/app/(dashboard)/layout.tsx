import { AppSidebar } from "@/components/shell/app-sidebar";
import { DashboardHeader } from "@/components/shell/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <SidebarInset>
        <DashboardHeader profile={profile} />
        <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
