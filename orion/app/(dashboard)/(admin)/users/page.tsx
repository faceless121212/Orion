import Link from "next/link";

import { PageHeader } from "@/components/shell/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listUsers } from "@/lib/data/users";
import { initials } from "@/lib/utils";

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <>
      <PageHeader description="Review workspace members and assign the agents in each employee's squad." eyebrow="Administration" title="Users" />
      <Card className="overflow-hidden py-0 shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Squad</TableHead>
              <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Avatar className="size-7"><AvatarFallback className="bg-blue-100 text-[10px] font-semibold text-blue-700">{initials(user.fullName)}</AvatarFallback></Avatar>
                    {user.fullName}
                  </span>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge className="capitalize" variant="secondary">{user.role}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{user.squadSize} {user.squadSize === 1 ? "agent" : "agents"}</TableCell>
                <TableCell className="text-right">
                  <Link aria-label={`Manage squad for ${user.fullName}`} className={buttonVariants({ size: "sm", variant: "outline" })} href={`/users/${user.id}`}>
                    Manage squad
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
