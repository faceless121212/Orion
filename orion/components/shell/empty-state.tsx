import Image from "next/image";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  image,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  /** Illustration from public/brand/empty; replaces the icon when set. */
  image?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed bg-muted/20 shadow-none">
      <CardContent className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
        {image ? (
          <Image alt="" className="mb-6 h-auto w-full max-w-72 rounded-2xl" height={480} src={image} width={640} />
        ) : (
          <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <Icon className="size-5" />
          </span>
        )}
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
