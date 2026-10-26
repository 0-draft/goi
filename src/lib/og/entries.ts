import { getCollection } from "astro:content";
import { buildRoute } from "../../components/c/route";
import { KIND_LABEL, LANGS, type Lang, wordText } from "../../i18n/ui";
import { type OgWord, ogGlyphs } from "./render";

/** 言語ごとの画像の中身（pending を除く）と、全画像で共通のフォント用の字 */
export async function ogEntries() {
  const { stations } = buildRoute(await getCollection("words"));
  const cards = (lang: Lang) =>
    stations.map((s): { id: string; card: OgWord } => {
      const text = wordText(s.word, lang);
      return {
        id: s.id,
        card: {
          word: s.word.word,
          reading: lang === "ja" ? s.word.reading : s.romaji,
          kind: KIND_LABEL[lang][s.word.kind],
          meaning: lang === "ja" ? text.meaning : text.gloss || text.meaning,
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
