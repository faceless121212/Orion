import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="-mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" href={href}>
      <ArrowLeft className="size-4" />
      {children}
    </Link>
  );
}
