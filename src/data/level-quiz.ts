export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface QuizQuestion {
  id: number;
  level: CefrLevel;
  question: string;
  options: [string, string, string, string];
  answer: number; // 0-indexed
}

export const QUESTIONS: QuizQuestion[] = [
  // ── A1 ──────────────────────────────────────────────────────
  {
    id: 1,
    level: "A1",
    question: "I ___ a student at this university.",
    options: ["am", "is", "are", "be"],
    answer: 0,
  },
  {
    id: 2,
    level: "A1",
    question: "She ___ coffee every morning before work.",
    options: ["drink", "drinks", "drinking", "drank"],
    answer: 1,
  },
  {
    id: 3,
    level: "A1",
    question: "Please close ___ door when you leave.",
    options: ["a", "an", "the", "(no article)"],
    answer: 2,
  },
  // ── A2 ──────────────────────────────────────────────────────
  {
    id: 4,
    level: "A2",
    question: "We ___ to Kyoto for our school trip last year.",
    options: ["go", "goes", "gone", "went"],
    answer: 3,
  },
  {
    id: 5,
    level: "A2",
    question: "This exercise is ___ than the previous one.",
    options: ["difficult", "difficulter", "more difficult", "most difficult"],
    answer: 2,
  },
  {
    id: 6,
    level: "A2",
    question: "How long ___ you been learning English?",
    options: ["do", "did", "have", "had"],
    answer: 2,
  },
  // ── B1 ──────────────────────────────────────────────────────
  {
    id: 7,
    level: "B1",
    question: "If I ___ the manager, I would change the schedule.",
    options: ["am", "was", "were", "would be"],
    answer: 2,
  },
  {
    id: 8,
    level: "B1",
    question: "The report ___ before the meeting starts.",
    options: ["will send", "will be sent", "is sending", "sends"],
    answer: 1,
  },
  {
    id: 9,
    level: "B1",
    question: "She mentioned that she ___ attend the conference.",
    options: ["will", "would", "shall", "must"],
    answer: 1,
  },
  {
    id: 10,
    level: "B1",
    question: "I'm not used to ___ such long hours every day.",
    options: ["work", "worked", "working", "have worked"],
    answer: 2,
  },
  // ── B2 ──────────────────────────────────────────────────────
  {
    id: 11,
    level: "B2",
    question: "By the time he arrived at the station, the train ___.",
    options: [
      "already left",
      "has already left",
      "had already left",
      "was already left",
    ],
    answer: 2,
  },
  {
    id: 12,
    level: "B2",
    question: "The suspect admitted ___ the building after hours.",
    options: ["to enter", "enter", "entered", "entering"],
    answer: 3,
  },
  {
    id: 13,
    level: "B2",
    question: "No sooner ___ the concert started than it began to rain.",
    options: ["did", "had", "was", "has"],
    answer: 1,
  },
  {
    id: 14,
    level: "B2",
    question:
      "Her presentation was ___ impressive — the entire board was persuaded.",
    options: [
      "nothing but",
      "nothing short of",
      "nothing more than",
      "nothing less",
    ],
    answer: 1,
  },
  // ── C1 ──────────────────────────────────────────────────────
  {
    id: 15,
    level: "C1",
    question:
      "Had we read the contract carefully, we ___ avoided this problem.",
    options: ["could", "could have", "will have", "would"],
    answer: 1,
  },
  {
    id: 16,
    level: "C1",
    question:
      "The new regulations were ___ to curb misleading advertising practices.",
    options: ["enacted", "enacting", "been enacted", "enact"],
    answer: 0,
  },
  {
    id: 17,
    level: "C1",
    question:
      "His ___ approach to the dispute helped both sides reach an agreement.",
    options: ["conciliatory", "conciliated", "conciliation", "conciliate"],
    answer: 0,
  },
  // ── C2 ──────────────────────────────────────────────────────
  {
    id: 18,
    level: "C2",
    question:
      "The revised treaty ___ all previous bilateral agreements between the two nations.",
    options: ["surpassed", "overcame", "superseded", "substituted"],
    answer: 2,
  },
  {
    id: 19,
    level: "C2",
    question:
      "___ difficult the circumstances may be, maintaining professionalism is essential.",
    options: ["Whatever", "However", "Whenever", "Wherever"],
    answer: 1,
  },
  {
    id: 20,
    level: "C2",
    question:
      "The novelist, ___ debut work received critical acclaim, went on to write seven more books.",
    options: ["who", "whom", "whose", "which"],
    answer: 2,
  },
];

/** スコア（正解数）→ CEFR レベル変換 */
export function scoreToCefr(score: number): CefrLevel {
  if (score >= 19) return "C2";
  if (score >= 17) return "C1";
  if (score >= 13) return "B2";
  if (score >= 9) return "B1";
  if (score >= 5) return "A2";
  return "A1";
}
