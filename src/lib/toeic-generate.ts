import { GoogleGenAI, Type } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export interface GenQuestion {
  /** 設問の見出し（Part 6 は "(1)" 等、Part 7 は設問文） */
  prompt: string;
  options: string[]; // 4個
  answer: number; // 0–3
  explanation: string;
}

export interface GeneratedPartSet {
  part: 6 | 7;
  title: string;
  passage: string;
  questions: GenQuestion[];
}

export interface GenResponse {
  set: GeneratedPartSet;
  usage: { input_tokens: number; output_tokens: number };
  model: string;
}

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

function normalizeQuestions(
  raw: unknown,
  promptOf: (o: Record<string, unknown>, i: number) => string
): GenQuestion[] {
  if (!Array.isArray(raw)) return [];
  const out: GenQuestion[] = [];
  raw.forEach((q, i) => {
    const o = (q ?? {}) as Record<string, unknown>;
    const options = Array.isArray(o.options)
      ? o.options.map((x) => String(x)).filter((x) => x.length > 0)
      : [];
    const answer = typeof o.answer === "number" ? o.answer : Number(o.answer);
    if (options.length !== 4 || !Number.isInteger(answer) || answer < 0 || answer > 3)
      return;
    out.push({
      prompt: promptOf(o, i),
      options,
      answer,
      explanation: String(o.explanation ?? ""),
    });
  });
  return out;
}

async function generate(
  system: string,
  userPrompt: string,
  schema: object,
  part: 6 | 7,
  promptOf: (o: Record<string, unknown>, i: number) => string
): Promise<GenResponse> {
  const ai = client();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.85,
    },
  });
  const rawText = response.text;
  if (!rawText) throw new Error("AI から有効な応答が得られませんでした");
  const parsed = JSON.parse(rawText) as Record<string, unknown>;

  const questions = normalizeQuestions(parsed.questions, promptOf);
  const passage = String(parsed.passage ?? "").trim();
  if (!passage || questions.length === 0) {
    throw new Error("問題を生成できませんでした");
  }

  return {
    set: {
      part,
      title: String(parsed.title ?? (part === 6 ? "文書" : "読解")),
      passage,
      questions,
    },
    usage: {
      input_tokens: response.usageMetadata?.promptTokenCount ?? 0,
      output_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    },
    model: MODEL,
  };
}

// ── Part 6: 長文穴埋め ──────────────────────────────────
const PART6_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    passage: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.INTEGER },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
        },
        required: ["number", "options", "answer", "explanation"],
      },
    },
  },
  required: ["title", "passage", "questions"],
};

const PART6_SYSTEM = `あなたは TOEIC の問題作成者です。Part 6（長文穴埋め）の問題を1セット作成します。

# 仕様
- ビジネス文書（Eメール / お知らせ / 社内連絡 / 広告など）を 80〜120 語の英語で書く。
- 文中に**ちょうど4つ**の空所を作り、本文では番号付きで「(1) ______」「(2) ______」…のように示す。
- 各空所に4つの選択肢（語または句。うち1つは文挿入問題として短い英文の選択肢でもよい）、正解 index（0〜3）、**日本語の解説**を付ける。
- title は文書の種類（例: "社内メール"、"製品のお知らせ"）。
- 文法・語彙・接続表現・文脈整合を問う良問にする。
- 出力は JSON のみ。questions は number 昇順で4個。`;

export function generatePart6(): Promise<GenResponse> {
  return generate(
    PART6_SYSTEM,
    "TOEIC Part 6 の問題を1セット、新しく作成してください。",
    PART6_SCHEMA,
    6,
    (o) => `(${o.number ?? "?"})`
  );
}

// ── Part 7: 読解 ────────────────────────────────────────
const PART7_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    passage: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
        },
        required: ["question", "options", "answer", "explanation"],
      },
    },
  },
  required: ["title", "passage", "questions"],
};

const PART7_SYSTEM = `あなたは TOEIC の問題作成者です。Part 7（読解）の問題を1セット作成します。

# 仕様
- ビジネス系の文書（記事 / Eメール / お知らせ / 広告 / メッセージなど）を 130〜190 語の英語で書く。
- その内容に関する**3つ**の設問を作る。各設問は英語の question 文、4つの選択肢、正解 index（0〜3）、**日本語の解説**を持つ。
- 設問は「主旨」「詳細」「推測」「語句の意味」など TOEIC で頻出のタイプをバランス良く。
- title は文書の種類（例: "お知らせ"、"記事"）。
- 出力は JSON のみ。`;

export function generatePart7(): Promise<GenResponse> {
  return generate(
    PART7_SYSTEM,
    "TOEIC Part 7 の問題を1セット、新しく作成してください。",
    PART7_SCHEMA,
    7,
    (o) => String(o.question ?? "")
  );
}
