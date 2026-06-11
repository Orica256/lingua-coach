export interface TypingScene {
  key: string;
  label: string;
  /** カードに表示する短い説明 */
  description: string;
  /** 入力欄に表示するお題（日本語の状況説明） */
  prompt: string;
  /** 入力欄のプレースホルダー例 */
  placeholder: string;
}

/**
 * タイピング添削のプリセットシーン。
 * ユーザーは自由入力も選べる（key: "free"）。
 */
export const TYPING_SCENES: TypingScene[] = [
  {
    key: "self_intro",
    label: "自己紹介",
    description: "初対面の相手に自分を紹介する",
    prompt: "初めて会う人に、自分の名前・仕事・趣味などを英語で自己紹介してみましょう。",
    placeholder: "Hi, my name is ... I work as ...",
  },
  {
    key: "business_email",
    label: "ビジネスメール",
    description: "取引先や同僚へのメールを書く",
    prompt: "海外の取引先に、打ち合わせの日程を調整するメールを英語で書いてみましょう。",
    placeholder: "Dear Mr. Smith, I am writing to ...",
  },
  {
    key: "travel",
    label: "旅行・道案内",
    description: "旅先で道や情報をたずねる",
    prompt: "旅行先で、駅やホテルへの行き方を英語でたずねてみましょう。",
    placeholder: "Excuse me, could you tell me how to get to ...",
  },
  {
    key: "restaurant",
    label: "レストラン",
    description: "注文や要望を伝える",
    prompt: "レストランで料理を注文したり、アレルギーについて伝えてみましょう。",
    placeholder: "I'd like to order ... Do you have anything without ...",
  },
  {
    key: "opinion",
    label: "意見を述べる",
    description: "あるテーマに自分の考えを書く",
    prompt: "「リモートワークについてどう思いますか？」というテーマに、英語で自分の意見を書いてみましょう。",
    placeholder: "In my opinion, remote work ...",
  },
  {
    key: "diary",
    label: "今日の出来事",
    description: "日記のように一日を振り返る",
    prompt: "今日あった出来事を、英語で日記のように書いてみましょう。",
    placeholder: "Today I went to ... It was ...",
  },
];

export const FREE_SCENE_KEY = "free";
