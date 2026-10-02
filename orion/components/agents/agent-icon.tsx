import Image from "next/image";
import {
  BarChart3,
  Bot,
  Briefcase,
  FileText,
  Lightbulb,
  Megaphone,
  PenLine,
  Scale,
  Search,
  Shield,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { agentIcons, type AgentIcon as AgentIconName } from "@/lib/agents/catalog";
import { cn } from "@/lib/utils";

/** Line icons, kept for compact contexts and as a fallback. */
export const agentIconComponents: Record<AgentIconName, LucideIcon> = {
  bot: Bot,
  briefcase: Briefcase,
  chart: BarChart3,
  "file-text": FileText,
  lightbulb: Lightbulb,
  megaphone: Megaphone,
  pen: PenLine,
  scale: Scale,
  search: Search,
  shield: Shield,
  sparkles: Sparkles,
  users: Users,
};

export const agentIconSrc = (icon: string) =>
  (agentIcons as readonly string[]).includes(icon) ? `/brand/agents/${icon}.webp` : "/brand/agents/bot.webp";

/** Illustrated agent tile generated for Orion (see public/brand/agents). */
export function AgentIcon({ icon, className }: { icon: string; className?: string }) {
  return (
    <Image
      alt=""
      className={cn("size-9 shrink-0 rounded-xl object-cover ring-1 ring-black/5", className)}
      height={128}
      src={agentIconSrc(icon)}
      width={128}
    />
  );
}
