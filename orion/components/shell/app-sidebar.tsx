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
  Settings,
  Users,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getNavigation } from "@/lib/auth/access";
import type { CurrentProfile } from "@/lib/auth/session";

const icons = {
  "/missions": ClipboardList,
  "/usage": BarChart3,
  "/agents": Bot,
  "/company": Building2,
  "/users": Users,
  "/integrations": Cable,
  "/settings": Settings,
} as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppSidebar({ profile }: { profile: CurrentProfile }) {
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
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12" render={<Link href="/settings" />} size="lg">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-blue-100 text-xs font-semibold text-blue-700">
                  {initials(profile.fullName)}
                </AvatarFallback>
              </Avatar>
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
