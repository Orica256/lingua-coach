import Anthropic from "@anthropic-ai/sdk";

import {
  CORRECTION_SYSTEM_PROMPT,
  buildUserContent,
  normalizeResult,
  parseLooseJson,
  type CorrectionResponse,
} from "./correction";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

/**
 * Anthropic Claude で英文を添削する。
 * （現在の既定プロバイダは Gemini。env LLM_PROVIDER=anthropic で切替可能）
 */
export async function correctWithAnthropic(
  text: string,
  scene?: string
): Promise<CorrectionResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: CORRECTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserContent(text, scene) }],
  });

  const textBlock = message.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) {
    throw new Error("AI から有効な応答が得られませんでした");
  }

  const result = normalizeResult(parseLooseJson(textBlock.text), text);

  return {
    result,
    usage: {
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
    },
    model: MODEL,
  };
}
