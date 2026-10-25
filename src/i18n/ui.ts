import type { Word } from "../lib/schema";

export const LANGS = ["en", "ja"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/**
 * base (/goi) を含むサイト内パスを返す。英語はそのまま、日本語は /ja/ の下。
 * path は "a/w/seki-no-yama/" のような base からの相対パス（先頭の / はあってもなくてもよい）
 */
export function localePath(lang: Lang, path = ""): string {
  const p = path.replace(/^\//, "");
  return lang === DEFAULT_LANG ? `${BASE}/${p}` : `${BASE}/${lang}/${p}`;
}

/** /goi/ja/a/ → a/ のように、base と言語の接頭辞を外したパス */
export function stripLocale(pathname: string): string {
  return pathname
    .replace(new RegExp(`^${BASE}`), "")
    .replace(/^\/ja(?=\/|$)/, "")
    .replace(/^\//, "");
}

export function langFromPath(pathname: string): Lang {
  return new RegExp(`^${BASE}/ja(/|$)`).test(pathname) ? "ja" : "en";
}

export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "ja" : "en";
}

/** 表示言語での意味・由来・例文。日本語は原文、英語は en 欄 */
export function wordText(w: Word, lang: Lang) {
  if (lang === "ja" || !w.en) {
    return { gloss: "", meaning: w.meaning, origin: w.origin, example: w.example, exampleNote: "" };
  }
  // 英語版でも例文は日本語のまま出し、英訳を添える
  return {
    gloss: w.en.gloss,
    meaning: w.en.meaning,
    origin: w.en.origin,
    example: w.example,
    exampleNote: w.en.example,
  };
}

export const KIND_LABEL: Record<Lang, Record<Word["kind"], string>> = {
  en: { ことわざ: "Proverb", 慣用句: "Idiom", 四字熟語: "Four-character compound", ことば: "Word" },
  ja: { ことわざ: "ことわざ", 慣用句: "慣用句", 四字熟語: "四字熟語", ことば: "ことば" },
};

export const dict = {
  en: {
    "site.name": "goi",
    "site.desc": "Japanese words worth using, with meanings, origins, examples and sources.",
    "site.count": (n: number) => `${n} words`,
    "lang.switch": "日本語",
    "lang.switchLabel": "Switch to Japanese",
    "word.meaning": "Meaning",
    "word.origin": "Origin",
    "word.example": "Example",
    "word.sources": "Sources",
    "word.prev": "Previous",
    "word.next": "Next",
    "search.label": "Search",
    "search.placeholder": "Word, reading or meaning",
    "search.count": (n: number) => `${n} ${n === 1 ? "word" : "words"}`,
    "search.none": (q: string) =>
      `No words match "${q}". Try the reading in hiragana or part of the meaning.`,
  },
  ja: {
    "site.name": "goi",
    "site.desc": "使いたくなる日本語を集めた語彙帳。意味・由来・例文・出典つき。",
    "site.count": (n: number) => `${n}語`,
    "lang.switch": "English",
    "lang.switchLabel": "英語に切り替える",
    "word.meaning": "意味",
    "word.origin": "由来",
    "word.example": "用例",
    "word.sources": "出典",
    "word.prev": "前の語",
    "word.next": "次の語",
    "search.label": "語を探す",
    "search.placeholder": "見出し・読み・意味",
    "search.count": (n: number) => `${n}語`,
    "search.none": (q: string) => `「${q}」に合う語はありません。読みのひらがなや、意味の一部でも探せます。`,
  },
} as const;

export type DictKey = keyof (typeof dict)["en"];

export function t<K extends DictKey>(lang: Lang, key: K): (typeof dict)["en"][K] {
  return dict[lang][key] as (typeof dict)["en"][K];
}
