import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { ProfileForm } from "@/components/settings/profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/repository";

export default async function SettingsPage() {
  const profile = await requireUser();
  const squad = (await getRepository().listSquad(profile.id)).filter((member) => member.status === "active");

  return (
    <>
      <PageHeader description="Manage how you appear in Orion and review your workspace access." eyebrow="Account" title="Settings" />
      <div className="grid max-w-3xl gap-6">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Photo</CardTitle>
            <CardDescription>Shown in the sidebar and to administrators.</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload avatarUrl={profile.avatarUrl} name={profile.fullName} />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm email={profile.email} fullName={profile.fullName} jobTitle={profile.jobTitle} />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-blue-600" />
              Access
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Role</span>
              <Badge className="capitalize" variant="secondary">{profile.role}</Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Agents in your squad</span>
              <span className="font-medium">{squad.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
