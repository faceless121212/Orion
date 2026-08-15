import { Settings } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const profile = await requireUser();

  return (
    <>
      <PageHeader description="Review your Orion identity and personal workspace access." eyebrow="Account" title="Settings" />
      <Card className="max-w-2xl shadow-none">
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="size-5 text-blue-600" />Profile</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="size-16"><AvatarFallback className="bg-blue-100 text-lg font-semibold text-blue-700">{profile.fullName.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
          <dl className="grid flex-1 gap-4 sm:grid-cols-2">
            <div><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</dt><dd className="mt-1 text-sm font-medium">{profile.fullName}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt><dd className="mt-1 text-sm font-medium">{profile.email}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</dt><dd className="mt-1"><Badge className="capitalize" variant="secondary">{profile.role}</Badge></dd></div>
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
