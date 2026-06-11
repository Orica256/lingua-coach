// TOEIC Part 5（短文穴埋め・文法/語彙）の自作シード問題バンク。
// 過去問の転載は一切せず、TOEIC 形式を模したオリジナル問題のみで構成している。
// Claude 生成問題はキー登録後に同形式で追加・統合する想定。

export type ToeicPart5Category =
  | "品詞"
  | "動詞の形"
  | "前置詞"
  | "接続詞"
  | "関係詞"
  | "代名詞"
  | "比較"
  | "数量"
  | "語彙";

/** 目安となる目標スコア帯（参考表示用） */
export type ToeicTargetScore = 470 | 600 | 730 | 860;

export interface ToeicQuestion {
  id: number;
  part: 5;
  category: ToeicPart5Category;
  question: string;
  options: [string, string, string, string];
  answer: number; // 0-indexed
  explanation: string; // 日本語の解説
  targetScore: ToeicTargetScore;
}

export const TOEIC_PART5_SEED: ToeicQuestion[] = [
  {
    id: 1,
    part: 5,
    category: "品詞",
    question: "The marketing team worked ______ to meet the tight deadline.",
    options: ["efficient", "efficiently", "efficiency", "efficiencies"],
    answer: 1,
    explanation:
      "動詞 worked を修飾するので副詞 efficiently が正解。形容詞 efficient は名詞を修飾、efficiency / efficiencies は名詞。",
    targetScore: 470,
  },
  {
    id: 2,
    part: 5,
    category: "動詞の形",
    question: "By the time the manager arrived, the meeting had already ______.",
    options: ["begin", "begun", "began", "beginning"],
    answer: 1,
    explanation:
      "had + 過去分詞で過去完了。begin の過去分詞は begun。began は過去形なので不可。",
    targetScore: 600,
  },
  {
    id: 3,
    part: 5,
    category: "前置詞",
    question: "The new policy will take effect ______ January 1.",
    options: ["in", "at", "on", "by"],
    answer: 2,
    explanation: "特定の日付の前は前置詞 on を使う（on January 1）。",
    targetScore: 470,
  },
  {
    id: 4,
    part: 5,
    category: "接続詞",
    question: "______ the heavy rain, the outdoor event was canceled.",
    options: ["Although", "Because of", "Despite", "However"],
    answer: 1,
    explanation:
      "後ろが名詞句 the heavy rain で、原因（雨のため中止）を表すので Because of が正解。Although/However は節を導き、Despite は『〜にもかかわらず』で意味が合わない。",
    targetScore: 600,
  },
  {
    id: 5,
    part: 5,
    category: "動詞の形",
    question: "All expense reports must ______ by the end of the month.",
    options: ["submit", "be submitted", "submitting", "submission"],
    answer: 1,
    explanation:
      "レポートは『提出される』側なので受動態。助動詞 must の後は be + 過去分詞で be submitted。",
    targetScore: 600,
  },
  {
    id: 6,
    part: 5,
    category: "関係詞",
    question: "The candidate ______ resume impressed the panel was hired.",
    options: ["who", "whom", "whose", "which"],
    answer: 2,
    explanation:
      "後ろの名詞 resume を修飾し『その候補者の履歴書』という所有の意味なので所有格の関係代名詞 whose。",
    targetScore: 730,
  },
  {
    id: 7,
    part: 5,
    category: "品詞",
    question: "The company offers a ______ discount to its loyal customers.",
    options: ["substantial", "substance", "substantially", "substantiate"],
    answer: 0,
    explanation:
      "名詞 discount を修飾するので形容詞 substantial（かなりの）。substance は名詞、substantially は副詞、substantiate は動詞。",
    targetScore: 600,
  },
  {
    id: 8,
    part: 5,
    category: "代名詞",
    question: "Employees are asked to submit ______ timesheets by Monday.",
    options: ["they", "them", "their", "theirs"],
    answer: 2,
    explanation:
      "名詞 timesheets の前なので所有格 their。they は主格、them は目的格、theirs は所有代名詞。",
    targetScore: 470,
  },
  {
    id: 9,
    part: 5,
    category: "比較",
    question:
      "This year's sales figures are much higher than ______ of last year.",
    options: ["that", "those", "them", "it"],
    answer: 1,
    explanation:
      "比較対象は複数形の figures なので、繰り返しを避ける代名詞も複数の those を使う。",
    targetScore: 730,
  },
  {
    id: 10,
    part: 5,
    category: "前置詞",
    question: "The conference room is available ______ 2 P.M. to 4 P.M.",
    options: ["from", "since", "during", "for"],
    answer: 0,
    explanation:
      "from A to B で『AからBまで』。since は完了形と共に起点を表し、to との相関では使わない。",
    targetScore: 470,
  },
  {
    id: 11,
    part: 5,
    category: "動詞の形",
    question: "The committee recommended ______ the project until next quarter.",
    options: ["to postpone", "postpone", "postponing", "postponed"],
    answer: 2,
    explanation:
      "recommend は目的語に動名詞（-ing）を取る動詞。recommend doing。to 不定詞は不可。",
    targetScore: 730,
  },
  {
    id: 12,
    part: 5,
    category: "接続詞",
    question: "______ you have any questions, please contact our support team.",
    options: ["Unless", "Whether", "If", "So"],
    answer: 2,
    explanation:
      "『もし質問があれば』という条件なので If。Unless は『〜でない限り』で意味が逆になる。",
    targetScore: 470,
  },
  {
    id: 13,
    part: 5,
    category: "品詞",
    question: "The ______ of the new software greatly improved productivity.",
    options: ["implement", "implemented", "implementation", "implementing"],
    answer: 2,
    explanation:
      "The と of に挟まれ、文の主語になる名詞が必要なので implementation（導入）。",
    targetScore: 600,
  },
  {
    id: 14,
    part: 5,
    category: "動詞の形",
    question: "She ______ for the firm for ten years before she retired.",
    options: ["works", "has worked", "had worked", "is working"],
    answer: 2,
    explanation:
      "過去の retired より前から続いていた動作なので過去完了 had worked。現在完了 has worked は過去の基準点とは併用しない。",
    targetScore: 730,
  },
  {
    id: 15,
    part: 5,
    category: "語彙",
    question:
      "The manager will ______ all new employees about the safety procedures.",
    options: ["inform", "inquire", "announce", "mention"],
    answer: 0,
    explanation:
      "inform + 人 + about 〜 で『人に〜を知らせる』。inquire は『尋ねる』、announce/mention は人を直接目的語に取らない。",
    targetScore: 730,
  },
  {
    id: 16,
    part: 5,
    category: "前置詞",
    question: "Our company is committed ______ providing excellent service.",
    options: ["to", "for", "with", "on"],
    answer: 0,
    explanation:
      "be committed to -ing で『〜することに尽力している』。この to は前置詞なので後ろは動名詞。",
    targetScore: 730,
  },
  {
    id: 17,
    part: 5,
    category: "品詞",
    question: "The instructions were ______ clear, so everyone understood them.",
    options: ["perfect", "perfection", "perfectly", "perfecting"],
    answer: 2,
    explanation:
      "形容詞 clear を強調・修飾するので副詞 perfectly。perfect は形容詞、perfection は名詞。",
    targetScore: 600,
  },
  {
    id: 18,
    part: 5,
    category: "数量",
    question: "______ of the two proposals was accepted by the board.",
    options: ["Both", "Neither", "All", "Every"],
    answer: 1,
    explanation:
      "述語動詞が単数の was で、of the two（2つのうち）と続くので Neither（どちらも〜ない）。Both なら were、All/Every は3つ以上や単数名詞向け。",
    targetScore: 860,
  },
  {
    id: 19,
    part: 5,
    category: "動詞の形",
    question: "The products ______ in this factory are exported worldwide.",
    options: ["make", "made", "making", "makes"],
    answer: 1,
    explanation:
      "products を後ろから修飾する分詞。製品は『作られる』側なので過去分詞 made（=which are made）。",
    targetScore: 730,
  },
  {
    id: 20,
    part: 5,
    category: "語彙",
    question:
      "Due to the recent ______ in demand, the company hired more staff.",
    options: ["increase", "increasing", "increased", "increasingly"],
    answer: 0,
    explanation:
      "the recent ______ in と冠詞・形容詞に続く名詞が必要なので increase（増加）。increasing/increased は分詞・形容詞、increasingly は副詞。",
    targetScore: 600,
  },
];

/** 正答率（0–100）からざっくりした到達度コメントを返す（公式スコアではない）。 */
export function accuracyToComment(accuracy: number): string {
  if (accuracy >= 90) return "素晴らしい！文法・語彙の基礎は十分です。さらに難問に挑戦しましょう。";
  if (accuracy >= 70) return "good! 安定してきました。間違えた問題の解説を復習しましょう。";
  if (accuracy >= 50) return "もう一歩。品詞・動詞の形を中心に弱点を埋めていきましょう。";
  return "基礎から固めましょう。解説をよく読み、繰り返し演習するのが近道です。";
}
