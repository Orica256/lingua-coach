import { GoogleGenAI } from "@google/genai";

/** GEMINI_API_KEY を使う共通クライアントを生成（サーバー専用）。 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

// Google 側の一時的な過負荷・レート系（リトライで回復しうるもの）
const TRANSIENT =
  /\b(503|429|500|UNAVAILABLE|RESOURCE_EXHAUSTED|INTERNAL)\b|overloaded|high demand|try again later/i;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type GenerateParams = Parameters<GoogleGenAI["models"]["generateContent"]>[0];

/**
 * generateContent を一時的エラー（503 高負荷・429・500 等）に対して指数バックオフでリトライする。
 * 恒久エラーは即時 throw。リトライ尽きた一時的エラーはユーザー向けの分かりやすいメッセージにして throw。
 */
export async function generateContentWithRetry(
  params: GenerateParams,
  retries = 2,
  baseDelayMs = 900
) {
  const ai = getGeminiClient();
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const transient = TRANSIENT.test(msg);
      if (!transient) throw e;
      if (attempt === retries) {
        throw new Error(
          "AI が混雑しています。少し時間をおいて再度お試しください。"
        );
      }
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }
  // 到達しないが型のため
  throw new Error("AI 呼び出しに失敗しました。");
}
