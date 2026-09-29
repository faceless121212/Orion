import { z } from "zod";

import { agentIcons, agentModels, agentStatuses } from "@/lib/agents/catalog";

const modelIds = agentModels.map((model) => model.id) as [string, ...string[]];

export const agentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer."),
  model: z.enum(modelIds, "Choose a supported model."),
  icon: z.enum(agentIcons, "Choose an icon."),
  status: z.enum(agentStatuses, "Choose a status."),
  systemPrompt: z
    .string()
    .trim()
    .min(20, "Write a system prompt of at least 20 characters.")
    .max(20000, "System prompt must be 20,000 characters or fewer."),
});

export type AgentInput = z.infer<typeof agentSchema>;

export const promptBriefSchema = z.object({
  name: z.string().trim().min(2, "Name the agent before generating a prompt.").max(80),
  description: z
    .string()
    .trim()
    .min(10, "Describe the agent's job (at least 10 characters) before generating.")
    .max(500),
});

export type PromptBrief = z.infer<typeof promptBriefSchema>;

export const uuidSchema = z.uuid("Invalid identifier.");

export const assignmentSchema = z.object({
  userId: uuidSchema,
  agentId: uuidSchema,
});

export const instructionsSchema = z.object({
  agentId: uuidSchema,
  customInstructions: z
    .string()
    .trim()
    .max(4000, "Personal instructions must be 4,000 characters or fewer."),
});
