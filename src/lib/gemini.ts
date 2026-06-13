import { GoogleGenAI, Type } from "@google/genai";

import {
  CORRECTION_SYSTEM_PROMPT,
  buildUserContent,
  normalizeResult,
  type CorrectionResponse,
} from "./correction";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Gemini に構造化 JSON で返させるためのレスポンススキーマ
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    corrected_text: { type: Type.STRING },
    has_errors: { type: Type.BOOLEAN },
    naturalness: { type: Type.INTEGER },
    overall_comment: { type: Type.STRING },
    corrections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          corrected: { type: Type.STRING },
          category: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["original", "corrected", "category", "explanation"],
      },
    },
    better_expression: { type: Type.STRING, nullable: true },
  },
  required: [
    "corrected_text",
    "has_errors",
    "naturalness",
    "overall_comment",
    "corrections",
  ],
};

/**
 * Gemini（無料枠想定: gemini-2.5-flash）で英文を添削する。
 * responseSchema により JSON 構造化出力を強制する。
 */
export async function correctWithGemini(
  text: string,
  scene?: string
): Promise<CorrectionResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildUserContent(text, scene),
    config: {
      systemInstruction: CORRECTION_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.3,
    },
  });

  const raw = response.text;
  if (!raw) {
    throw new Error("AI から有効な応答が得られませんでした");
  }

  const result = normalizeResult(JSON.parse(raw), text);

  return {
    result,
    usage: {
      input_tokens: response.usageMetadata?.promptTokenCount ?? 0,
      output_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    },
    model: MODEL,
  };
}
