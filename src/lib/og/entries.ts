import { getCollection } from "astro:content";
import { KIND_LABEL, LANGS, type Lang, wordText } from "../../i18n/ui";
import { buildEntries } from "../entries";
import type { Word } from "../schema";
import { type OgWord, ogGlyphs } from "./render";

/** 世論調査のある語は「本来の意味を選んだ人の割合」を画像の主役にする */
function surveyHook(w: Word, lang: Lang): string | undefined {
  const right = w.survey?.options.find((o) => o.correct);
  if (!w.survey || !right) return undefined;
  return lang === "ja"
    ? `本来の意味で答えた人は${right.pct}%（文化庁・${w.survey.year}）`
    : `Only ${right.pct}% in Japan chose the original meaning (${w.survey.yearEn})`;
}

/** 言語ごとの画像の中身（pending を除く）と、全画像で共通のフォント用の字 */
export async function ogEntries() {
  const entries = buildEntries(await getCollection("words"));
  const cards = (lang: Lang) =>
    entries.map((s): { id: string; card: OgWord } => {
      const text = wordText(s.word, lang);
      return {
        id: s.id,
        card: {
          word: s.word.word,
          reading: lang === "ja" ? s.word.reading : s.romaji,
          kind: KIND_LABEL[lang][s.word.kind],
          meaning: lang === "ja" ? text.meaning : text.gloss || text.meaning,
          hook: surveyHook(s.word, lang),
        },
      };
    });
  const byLang = Object.fromEntries(LANGS.map((l) => [l, cards(l)])) as Record<
    Lang,
    ReturnType<typeof cards>
  >;
  const glyphs = ogGlyphs(LANGS.flatMap((l) => byLang[l].map((c) => c.card)));
  return { byLang, glyphs };
}
