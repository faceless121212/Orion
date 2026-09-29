export const agentModels = [
  { id: "claude-opus-5", label: "Claude Opus 5", description: "Best default for complex writing and analysis." },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5", description: "Fast and capable for everyday documents." },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", description: "Lowest cost for short, simple tasks." },
  { id: "claude-fable-5-1", label: "Claude Fable 5.1", description: "Most capable; highest cost and latency." },
] as const;

export type AgentModelId = (typeof agentModels)[number]["id"];

export const defaultAgentModel: AgentModelId = "claude-opus-5";

export const agentIcons = [
  "bot",
  "briefcase",
  "chart",
  "file-text",
  "lightbulb",
  "megaphone",
  "pen",
  "scale",
  "search",
  "shield",
  "sparkles",
  "users",
] as const;

export type AgentIcon = (typeof agentIcons)[number];

export const agentStatuses = ["active", "archived"] as const;

export type AgentStatus = (typeof agentStatuses)[number];

export function modelLabel(modelId: string) {
  return agentModels.find((model) => model.id === modelId)?.label ?? modelId;
}
