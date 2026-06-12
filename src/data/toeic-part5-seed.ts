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
  {
    id: 21,
    part: 5,
    category: "関係詞",
    question:
      "The factory, ______ was built in 1990, will be renovated next year.",
    options: ["that", "which", "where", "what"],
    answer: 1,
    explanation:
      "コンマ付きの非制限用法で先行詞は物（factory）なので which。非制限用法では that は使えず、where は後ろに完全文が必要、what は先行詞を取らない。",
    targetScore: 730,
  },
  {
    id: 22,
    part: 5,
    category: "関係詞",
    question:
      "We visited the office ______ the new equipment was installed.",
    options: ["which", "that", "where", "what"],
    answer: 2,
    explanation:
      "後ろが完全な文（the equipment was installed）で場所を表すので関係副詞 where。which/that は後ろに不完全文（主語や目的語の欠け）が続く。",
    targetScore: 730,
  },
  {
    id: 23,
    part: 5,
    category: "関係詞",
    question:
      "The applicants ______ we interviewed last week were highly qualified.",
    options: ["who", "whom", "whose", "which"],
    answer: 1,
    explanation:
      "後ろに we interviewed と主語＋動詞が続き、関係詞は interviewed の目的語にあたるので目的格 whom。先行詞は人なので which は不可。",
    targetScore: 860,
  },
  {
    id: 24,
    part: 5,
    category: "代名詞",
    question: "The CEO prepared the entire presentation ______.",
    options: ["he", "him", "his", "himself"],
    answer: 3,
    explanation:
      "主語 The CEO と同一人物を指し『自分自身で』と強調するので再帰代名詞 himself。文の要素は既に揃っているため目的格 him は不要。",
    targetScore: 600,
  },
  {
    id: 25,
    part: 5,
    category: "代名詞",
    question:
      "Some employees prefer to work from home, while ______ prefer the office.",
    options: ["another", "other", "others", "the other"],
    answer: 2,
    explanation:
      "『ある人々は〜、他の人々は〜』は some ... others。others は単独で『他の人々』を表す複数代名詞。another は単数、other は後ろに名詞が必要。",
    targetScore: 600,
  },
  {
    id: 26,
    part: 5,
    category: "代名詞",
    question:
      "The two departments often support ______ during busy seasons.",
    options: ["themselves", "each other", "every other", "the other"],
    answer: 1,
    explanation:
      "2者間の『お互いを』は each other。themselves（再帰）だと『自分自身を支える』となり意味が合わない。",
    targetScore: 600,
  },
  {
    id: 27,
    part: 5,
    category: "比較",
    question:
      "The new model is ______ more efficient than the previous one.",
    options: ["very", "far", "more", "too"],
    answer: 1,
    explanation:
      "比較級 more efficient を強める語は far / much / even。very は原級（形容詞・副詞の元の形）を修飾し、比較級は強められない。",
    targetScore: 600,
  },
  {
    id: 28,
    part: 5,
    category: "比較",
    question:
      "Of all the candidates, she is the ______ qualified for the position.",
    options: ["more", "most", "very", "much"],
    answer: 1,
    explanation:
      "Of all 〜 と the に挟まれ、3者以上の中で最上を表すので最上級 most qualified。more は2者の比較。",
    targetScore: 730,
  },
  {
    id: 29,
    part: 5,
    category: "比較",
    question: "The more you practice, the ______ your skills will become.",
    options: ["good", "well", "better", "best"],
    answer: 2,
    explanation:
      "The 比較級 …, the 比較級 … の構文。become の補語になる形容詞の比較級 better。best（最上級）は the+最上級でこの構文には合わない。",
    targetScore: 860,
  },
  {
    id: 30,
    part: 5,
    category: "数量",
    question:
      "______ employees attended the workshop than the organizers had expected.",
    options: ["Less", "Fewer", "Much", "A little"],
    answer: 1,
    explanation:
      "employees は可算名詞の複数形なので fewer（few の比較級）。less / a little / much は不可算名詞に用いる。",
    targetScore: 600,
  },
  {
    id: 31,
    part: 5,
    category: "数量",
    question:
      "There is ______ information available about the upcoming merger.",
    options: ["few", "little", "many", "a number of"],
    answer: 1,
    explanation:
      "information は不可算名詞なので little（ほとんどない）。few / many / a number of は可算名詞に用いる。",
    targetScore: 600,
  },
  {
    id: 32,
    part: 5,
    category: "数量",
    question: "______ applicant must submit two professional references.",
    options: ["All", "Every", "Most", "Both"],
    answer: 1,
    explanation:
      "単数名詞 applicant と単数動詞 must submit に合うのは Every（+ 単数名詞）。All / Most は複数名詞、Both は2つのものに用いる。",
    targetScore: 470,
  },
  {
    id: 33,
    part: 5,
    category: "接続詞",
    question:
      "______ the report was thorough, it lacked a clear conclusion.",
    options: ["Despite", "Although", "Because", "Therefore"],
    answer: 1,
    explanation:
      "後ろが節（主語＋動詞）で『〜だが』という譲歩を表すので接続詞 Although。Despite は名詞句を取り、Therefore は副詞、Because は因果で意味が合わない。",
    targetScore: 730,
  },
  {
    id: 34,
    part: 5,
    category: "接続詞",
    question: "Please review the contract carefully ______ you sign it.",
    options: ["before", "during", "despite", "instead"],
    answer: 0,
    explanation:
      "後ろが節 you sign it で『署名する前に』という時を表すので接続詞 before。during / despite は前置詞、instead は副詞で節を導けない。",
    targetScore: 600,
  },
  {
    id: 35,
    part: 5,
    category: "前置詞",
    question: "The replacement parts will arrive ______ three business days.",
    options: ["until", "within", "by", "since"],
    answer: 1,
    explanation:
      "『3営業日以内に』と期間の範囲を表すので within。by は特定の期限（時点）、until は継続の終点、since は起点を表す。",
    targetScore: 600,
  },
  {
    id: 36,
    part: 5,
    category: "語彙",
    question:
      "The supervisor will ______ the new procedure at tomorrow's meeting.",
    options: ["explain", "tell", "say", "talk"],
    answer: 0,
    explanation:
      "explain + 物事（手順）で『〜を説明する』。tell は『人に伝える』、say は内容を直接目的語に取り、talk は talk about の形を取る。",
    targetScore: 600,
  },
  {
    id: 37,
    part: 5,
    category: "語彙",
    question: "The company offers competitive salaries to ______ top talent.",
    options: ["attract", "attend", "attach", "attempt"],
    answer: 0,
    explanation:
      "『優秀な人材を引きつける』なので attract。attend は『出席する』、attach は『添付する』、attempt は『試みる』で意味が合わない。",
    targetScore: 730,
  },
  {
    id: 38,
    part: 5,
    category: "語彙",
    question:
      "All employees are required to ______ with the new safety regulations.",
    options: ["comply", "apply", "reply", "supply"],
    answer: 0,
    explanation:
      "comply with 〜 で『〜（規則）に従う』。apply / reply / supply は with をこの意味で取らない。",
    targetScore: 730,
  },
  {
    id: 39,
    part: 5,
    category: "品詞",
    question: "The renovation was completed in a ______ manner.",
    options: ["time", "timely", "times", "timed"],
    answer: 1,
    explanation:
      "名詞 manner を修飾するのは形容詞 timely（時宜を得た）。-ly で終わるが副詞ではなく形容詞である点が狙い。time / times は名詞。",
    targetScore: 600,
  },
  {
    id: 40,
    part: 5,
    category: "動詞の形",
    question: "If the client ______ the proposal, we will begin work next week.",
    options: ["approve", "approves", "approved", "will approve"],
    answer: 1,
    explanation:
      "時・条件を表す副詞節（if節）では未来のことも現在形で表す。主語 the client は三人称単数なので approves。will approve は使わない。",
    targetScore: 730,
  },
];

/** 正答率（0–100）からざっくりした到達度コメントを返す（公式スコアではない）。 */
export function accuracyToComment(accuracy: number): string {
  if (accuracy >= 90) return "素晴らしい！文法・語彙の基礎は十分です。さらに難問に挑戦しましょう。";
  if (accuracy >= 70) return "good! 安定してきました。間違えた問題の解説を復習しましょう。";
  if (accuracy >= 50) return "もう一歩。品詞・動詞の形を中心に弱点を埋めていきましょう。";
  return "基礎から固めましょう。解説をよく読み、繰り返し演習するのが近道です。";
}
