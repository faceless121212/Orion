import { describe, expect, it } from "vitest";

import {
  buildPromptRequest,
  generateSystemPrompt,
  PROMPT_GENERATION_MODEL,
} from "@/lib/ai/prompt-generation";
import { emptyCompanySettings } from "@/lib/company/validation";

const brief = { name: "Proposal Writer", description: "Drafts client proposals from a brief." };
const company = {
  ...emptyCompanySettings,
  companyName: "Acme Clinics",
  brandVoice: "Warm and plain-spoken.",
};

function fakeClient(response: unknown) {
  const calls: unknown[] = [];
  const client = {
    beta: {
      messages: {
        create: async (params: unknown) => {
          calls.push(params);
          return response;
        },
      },
    },
  };

  return { client: client as unknown as Parameters<typeof generateSystemPrompt>[0], calls };
}

describe("buildPromptRequest", () => {
  it("includes only the company fields that are filled in", () => {
    const request = buildPromptRequest(brief, company);

    expect(request).toContain("Company name: Acme Clinics");
    expect(request).toContain("Brand voice: Warm and plain-spoken.");
    expect(request).not.toContain("Audience:");
    expect(request).toContain("Name: Proposal Writer");
  });

  it("says when no company context exists", () => {
    expect(buildPromptRequest(brief, emptyCompanySettings)).toContain(
      "No company context has been configured yet.",
    );
  });
});

describe("generateSystemPrompt", () => {
  it("returns the model's text with server-side fallbacks enabled", async () => {
    const { client, calls } = fakeClient({
      stop_reason: "end_turn",
      content: [{ type: "text", text: "  You are Acme's proposal writer.  " }],
    });

    await expect(generateSystemPrompt(client, brief, company)).resolves.toEqual({
      status: "success",
      prompt: "You are Acme's proposal writer.",
    });
    expect(calls[0]).toMatchObject({
      model: PROMPT_GENERATION_MODEL,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
  });

  it("reports a refusal instead of returning partial text", async () => {
    const { client } = fakeClient({
      stop_reason: "refusal",
      content: [{ type: "text", text: "partial" }],
    });

    await expect(generateSystemPrompt(client, brief, company)).resolves.toMatchObject({
      status: "error",
    });
  });

  it("treats an empty response as an error", async () => {
    const { client } = fakeClient({ stop_reason: "end_turn", content: [] });

    await expect(generateSystemPrompt(client, brief, company)).resolves.toMatchObject({
      status: "error",
    });
  });
});
