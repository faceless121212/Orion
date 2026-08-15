import { Users } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";

export default async function UsersPage() {
  const profile = await requireAdmin();

  return (
    <>
      <PageHeader description="Review workspace members and prepare agent assignments for every employee." eyebrow="Administration" title="Users" />
      <Card className="overflow-hidden shadow-none">
        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Squad</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell className="font-medium"><span className="inline-flex items-center gap-2"><Users className="size-4 text-blue-600" />{profile.fullName}</span></TableCell><TableCell>{profile.email}</TableCell><TableCell><Badge className="capitalize" variant="secondary">{profile.role}</Badge></TableCell><TableCell className="text-right text-muted-foreground">0 agents</TableCell></TableRow>
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
