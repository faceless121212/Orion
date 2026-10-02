import Image from "next/image";

import { cn } from "@/lib/utils";

export function LogoMark({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      alt=""
      className={cn("size-8 shrink-0 object-contain", className)}
      height={64}
      priority={priority}
      src="/brand/logo.webp"
      width={64}
    />
  );
}
