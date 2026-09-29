"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Building2,
  Cable,
  ClipboardList,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { agentIconComponents } from "@/components/agents/agent-icon";
import { UserAvatar } from "@/components/shell/user-avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getNavigation } from "@/lib/auth/access";
import type { CurrentProfile } from "@/lib/auth/session";
import type { AgentIcon } from "@/lib/agents/catalog";

const icons = {
  "/missions": ClipboardList,
  "/squad": Sparkles,
  "/usage": BarChart3,
  "/agents": Bot,
  "/company": Building2,
  "/users": Users,
  "/integrations": Cable,
  "/settings": Settings,
} as const;

export type SidebarSquadItem = { agentId: string; name: string; icon: AgentIcon };

export function AppSidebar({ profile, squad }: { profile: CurrentProfile; squad: SidebarSquadItem[] }) {
  const pathname = usePathname();
  const items = getNavigation(profile.role);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-11 gap-3 px-2 data-[active=true]:bg-transparent"
              isActive
              render={<Link href="/missions" />}
              size="lg"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">
                O
              </span>
              <span className="text-base font-bold tracking-tight">Orion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = icons[item.href as keyof typeof icons];
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={item.href} />}
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>My Squad</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {squad.length ? (
                squad.map((member) => {
                  const Icon = agentIconComponents[member.icon] ?? Bot;

                  return (
                    <SidebarMenuItem key={member.agentId}>
                      <SidebarMenuButton
                        render={<Link href={`/missions?new=${member.agentId}`} />}
                        tooltip={`New mission with ${member.name}`}
                      >
                        <Icon />
                        <span>{member.name}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        aria-label={`New mission with ${member.name}`}
                        render={<Link href={`/missions?new=${member.agentId}`} />}
                        showOnHover
                      >
                        <Plus />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  );
                })
              ) : (
                <p className="px-2 py-1 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                  No agents assigned yet.
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12" render={<Link href="/settings" />} size="lg">
              <UserAvatar
                avatarUrl={profile.avatarUrl}
                className="size-8 rounded-lg"
                fallbackClassName="rounded-lg text-xs"
                name={profile.fullName}
              />
              <span className="grid min-w-0 flex-1 text-left text-xs leading-tight">
                <span className="truncate font-semibold">{profile.fullName}</span>
                <span className="truncate text-muted-foreground capitalize">{profile.role}</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logoutAction}>
              <SidebarMenuButton className="w-full" tooltip="Sign out" type="submit">
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
