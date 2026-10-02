"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { agentSchema, knowledgeSchema, promptBriefSchema, uuidSchema } from "@/lib/agents/validation";
import { createAnthropicClient } from "@/lib/ai/client";
import {
  buildTemplatePrompt,
  generateSystemPrompt,
  PROMPT_GENERATION_MODEL,
  type PromptGenerationResult,
} from "@/lib/ai/prompt-generation";
import { requireAdmin } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/mode";
import { failureMessage, fieldsFrom, type FormState } from "@/lib/form-state";
import { getRepository } from "@/lib/repository";

export async function saveAgentAction(_state: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireAdmin();
  const { agentId, ...fields } = fieldsFrom(formData);
  const parsed = agentSchema.safeParse(fields);
  const parsedId = agentId ? uuidSchema.safeParse(agentId) : null;

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsedId && !parsedId.success) {
    return { status: "error", message: "This agent no longer exists." };
  }

  const repository = getRepository();
  const result = parsedId
    ? await repository.updateAgent(parsedId.data, parsed.data)
    : await repository.createAgent(parsed.data, profile.id);

  if (!result.ok && result.reason === "conflict") {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: { name: ["Another agent already uses this name."] },
    };
  }

  if (!result.ok) {
    return { status: "error", message: failureMessage(result, "Unable to save this agent. Try again.") };
  }

  revalidatePath("/agents");
  revalidatePath("/squad");

  if (!parsedId) {
    const created = result as { ok: true; value: { id: string } };
    redirect(`/agents/${created.value.id}?created=1`);
  }

  revalidatePath(`/agents/${parsedId.data}`);
  return { status: "success", message: "Agent saved." };
}

export async function generateAgentPromptAction(input: {
  name: string;
  description: string;
}): Promise<PromptGenerationResult> {
  const profile = await requireAdmin();
  const parsed = promptBriefSchema.safeParse(input);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid agent details." };
  }

  const repository = getRepository();
  const company = await repository.getCompanySettings();
  const client = createAnthropicClient();

  if (!client) {
    if (isDemoMode()) {
      const prompt = buildTemplatePrompt(parsed.data, company);
      await repository.recordPromptGeneration(profile.id, {
        model: PROMPT_GENERATION_MODEL,
        inputTokens: 1200,
        outputTokens: Math.round(prompt.length / 4),
      });
      return { status: "success", prompt };
    }

    return {
      status: "error",
      message: "AI prompt generation is not configured. Add ANTHROPIC_API_KEY to the server environment.",
    };
  }

  try {
    const result = await generateSystemPrompt(client, parsed.data, company);

    if (result.status === "success" && result.usage) {
      await repository.recordPromptGeneration(profile.id, result.usage);
    }

    return result.status === "success" ? { status: "success", prompt: result.prompt } : result;
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return { status: "error", message: "The AI service is busy. Wait a moment and try again." };
    }

    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Prompt generation failed: Anthropic rejected the configured API key.");
      return { status: "error", message: "AI prompt generation is misconfigured. Contact your administrator." };
    }

    console.error(
      "Prompt generation failed:",
      error instanceof Anthropic.APIError ? `${error.status} ${error.name}` : error,
    );
    return { status: "error", message: "Unable to generate a prompt right now. Try again." };
  }
}

export async function attachKnowledgeAction(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = knowledgeSchema.safeParse({
    agentId: formData.get("agentId"),
    fileIds: formData.getAll("fileIds"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Choose at least one file." };
  }

  const result = await getRepository().attachKnowledge(parsed.data.agentId, parsed.data.fileIds);

  if (!result.ok) {
    return { status: "error", message: failureMessage(result, "Unable to attach these files.") };
  }

  revalidatePath(`/agents/${parsed.data.agentId}`);
  return {
    status: "success",
    message: `${parsed.data.fileIds.length} ${parsed.data.fileIds.length === 1 ? "file" : "files"} added to knowledge.`,
  };
}

export async function detachKnowledgeAction(formData: FormData) {
  await requireAdmin();
  const parsed = knowledgeSchema.safeParse({
    agentId: formData.get("agentId"),
    fileIds: formData.getAll("fileIds"),
  });

  if (!parsed.success) {
    throw new Error("Invalid knowledge file.");
  }

  const repository = getRepository();
  for (const fileId of parsed.data.fileIds) {
    const result = await repository.detachKnowledge(parsed.data.agentId, fileId);
    if (!result.ok) throw new Error(failureMessage(result, "Unable to remove this file."));
  }

  revalidatePath(`/agents/${parsed.data.agentId}`);
}
