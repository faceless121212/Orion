import type Anthropic from "@anthropic-ai/sdk";

import type { PromptBrief } from "@/lib/agents/validation";
import type { CompanySettings } from "@/lib/company/validation";

export const PROMPT_GENERATION_MODEL = "claude-opus-5";

const GENERATOR_INSTRUCTIONS = `You write system prompts for AI agents that employees of one company use to produce business documents (Google Docs, Google Sheets, and PDFs).

Write a single system prompt, addressed to the agent in the second person, that:
- defines the agent's role, responsibilities, and the kinds of documents it produces;
- grounds the agent in the company context provided, including audience and brand voice;
- sets clear quality standards and tells the agent to ask for or state missing information instead of inventing facts;
- stays under 600 words.

Return only the system prompt text, with no preamble, title, or surrounding quotes.`;

const companyFields: Array<[keyof CompanySettings, string]> = [
  ["companyName", "Company name"],
  ["overview", "Company overview"],
  ["audience", "Audience"],
  ["brandVoice", "Brand voice"],
  ["writingGuidelines", "Writing guidelines"],
];

export function buildPromptRequest(brief: PromptBrief, company: CompanySettings) {
  const context = companyFields
    .filter(([key]) => company[key].trim())
    .map(([key, label]) => `<${key}>\n${label}: ${company[key].trim()}\n</${key}>`)
    .join("\n");

  return [
    "<company_context>",
    context || "No company context has been configured yet. Keep company references generic.",
    "</company_context>",
    "",
    "<agent>",
    `Name: ${brief.name}`,
    `Job description: ${brief.description}`,
    "</agent>",
    "",
    "Write the system prompt for this agent.",
  ].join("\n");
}

export type PromptGenerationResult =
  | { status: "success"; prompt: string }
  | { status: "error"; message: string };

type MessagesClient = Pick<Anthropic, "beta">;

export async function generateSystemPrompt(
  client: MessagesClient,
  brief: PromptBrief,
  company: CompanySettings,
): Promise<PromptGenerationResult> {
  const response = await client.beta.messages.create({
    model: PROMPT_GENERATION_MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: GENERATOR_INSTRUCTIONS,
    messages: [{ role: "user", content: buildPromptRequest(brief, company) }],
  });

  if (response.stop_reason === "refusal") {
    return {
      status: "error",
      message: "The model declined to write this prompt. Adjust the description and try again.",
    };
  }

  const prompt = response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("")
    .trim();

  if (!prompt) {
    return { status: "error", message: "The model returned an empty prompt. Try again." };
  }

  return { status: "success", prompt };
}
