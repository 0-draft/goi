import type { Lang } from "../i18n/ui";
import { wordText } from "../i18n/ui";
import { type Entry, seeded } from "./entries";

export interface QuizOption {
  text: string;
  correct: boolean;
  /** 世論調査でこの答えを選んだ人の割合。調査のない語では undefined */
  pct?: number;
}

/** 一覧や問いに出す短い意味。英語は訳語、日本語は意味の一文目 */
export function shortMeaning(e: Entry, lang: Lang): string {
  const text = wordText(e.word, lang);
  return text.gloss || `${text.meaning.split("。")[0]}。`.replace(/。。$/, "。");
}

/**
 * 意味を開く前に出す二択（調査のある語はその選択肢）。
 * 調査のない語は、ほかの語の意味を外れの選択肢にする。並びと外れの語は id で決め、ビルドごとに変えない
 */
export function quizOptions(entry: Entry, entries: Entry[], lang: Lang): QuizOption[] {
  const survey = entry.word.survey;
  if (survey) {
    return survey.options.map((o) => ({ text: o[lang], correct: o.correct, pct: o.pct }));
  }
  const others = entries.filter((e) => e.id !== entry.id);
  const decoy = others[Math.floor(seeded(entry.id) * others.length)];
  const options = [
    { text: shortMeaning(entry, lang), correct: true },
    { text: shortMeaning(decoy, lang), correct: false },
  ];
  return seeded(entry.id, 1) < 0.5 ? options : options.reverse();
}
