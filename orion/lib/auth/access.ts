export type AppRole = "admin" | "user";

export type NavigationItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
};

const navigation: NavigationItem[] = [
  { label: "Missions", href: "/missions" },
  { label: "My Squad", href: "/squad" },
  { label: "Usage", href: "/usage" },
  { label: "Agents", href: "/agents", adminOnly: true },
  { label: "Company", href: "/company", adminOnly: true },
  { label: "Users", href: "/users", adminOnly: true },
  { label: "Integrations", href: "/integrations", adminOnly: true },
  { label: "Settings", href: "/settings" },
];

export function getNavigation(role: AppRole) {
  return navigation.filter((item) => !item.adminOnly || role === "admin");
}

export function canAccessRoute(role: AppRole, pathname: string) {
  const route = navigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return Boolean(route && (!route.adminOnly || role === "admin"));
}
