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

export type PromptGenerationUsage = { model: string; inputTokens: number; outputTokens: number };

export type PromptGenerationResult =
  | { status: "success"; prompt: string; usage?: PromptGenerationUsage }
  | { status: "error"; message: string };

/** Offline stand-in used in demo mode when no API key is configured. */
export function buildTemplatePrompt(brief: PromptBrief, company: CompanySettings) {
  const companyName = company.companyName.trim() || "the company";
  const lines = [
    `You are ${brief.name}, an AI specialist working for ${companyName}.`,
    "",
    "Your role",
    brief.description,
    "",
    "Company context",
    company.overview.trim() || "No company overview has been provided yet.",
  ];

  if (company.audience.trim()) lines.push("", "Audience", company.audience.trim());
  if (company.brandVoice.trim()) lines.push("", "Voice", company.brandVoice.trim());
  if (company.writingGuidelines.trim()) lines.push("", "Writing guidelines", company.writingGuidelines.trim());

  lines.push(
    "",
    "Standards",
    "- Produce complete, well-structured documents ready to share.",
    "- State assumptions and ask for missing information instead of inventing facts.",
    "- Follow the employee's personal instructions when they are provided.",
  );

  return lines.join("\n");
}

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

  return {
    status: "success",
    prompt,
    usage: {
      model: PROMPT_GENERATION_MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}
