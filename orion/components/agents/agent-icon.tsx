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

import type { AgentIcon as AgentIconName } from "@/lib/agents/catalog";
import { cn } from "@/lib/utils";

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

export function AgentIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = agentIconComponents[icon as AgentIconName] ?? Bot;

  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
    </span>
  );
}
