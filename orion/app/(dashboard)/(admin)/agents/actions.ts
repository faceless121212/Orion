"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { agentSchema, promptBriefSchema, uuidSchema } from "@/lib/agents/validation";
import { createAnthropicClient } from "@/lib/ai/client";
import { generateSystemPrompt, type PromptGenerationResult } from "@/lib/ai/prompt-generation";
import { requireAdmin } from "@/lib/auth/session";
import { getCompanySettings } from "@/lib/data/company";
import { fieldsFrom, type FormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

const UNIQUE_VIOLATION = "23505";

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

  const values = {
    name: parsed.data.name,
    description: parsed.data.description,
    model: parsed.data.model,
    icon: parsed.data.icon,
    status: parsed.data.status,
    system_prompt: parsed.data.systemPrompt,
  };

  const supabase = await createClient();
  const { data, error } = parsedId
    ? await supabase.from("agents").update(values).eq("id", parsedId.data).select("id").maybeSingle()
    : await supabase
        .from("agents")
        .insert({ ...values, created_by: profile.id })
        .select("id")
        .single();

  if (error?.code === UNIQUE_VIOLATION) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: { name: ["Another agent already uses this name."] },
    };
  }

  if (error || !data) {
    return { status: "error", message: "Unable to save this agent. Try again." };
  }

  revalidatePath("/agents");
  revalidatePath("/squad");

  if (!parsedId) {
    redirect(`/agents/${data.id}?created=1`);
  }

  revalidatePath(`/agents/${data.id}`);
  return { status: "success", message: "Agent saved." };
}

export async function generateAgentPromptAction(input: {
  name: string;
  description: string;
}): Promise<PromptGenerationResult> {
  await requireAdmin();
  const parsed = promptBriefSchema.safeParse(input);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid agent details." };
  }

  const client = createAnthropicClient();

  if (!client) {
    return {
      status: "error",
      message: "AI prompt generation is not configured. Add ANTHROPIC_API_KEY to the server environment.",
    };
  }

  try {
    return await generateSystemPrompt(client, parsed.data, await getCompanySettings());
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
