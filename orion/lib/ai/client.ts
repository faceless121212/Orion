import "server-only";

import Anthropic from "@anthropic-ai/sdk";

export function createAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.startsWith("replace_")) {
    return null;
  }

  return new Anthropic({ apiKey, timeout: 120_000 });
}
