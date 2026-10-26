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
    "site.title": "goi | A route map of Japanese words",
    "site.desc":
      "Japanese words worth using, laid out as a route map. Each one comes with its meaning, origin, an example and sources.",
    "lang.switch": "日本語",
    "lang.switchLabel": "Read this page in Japanese",
    "map.lead":
      "Japanese words worth using, laid out as lines by type. Pick a station to open its sign: meaning, origin, an example and sources.",
    "map.title": "Route map",
    "map.line": (kind: Word["kind"]) => `${KIND_LABEL.en[kind]} Line`,
    "map.back": "Back to the route map",
    "search.label": "Search",
    "search.placeholder": "Word, reading or English meaning",
    "search.found": (n: number) => `${n} ${n === 1 ? "station" : "stations"} found`,
    "search.none": "No station matches. Try the reading in hiragana or romaji, or part of the meaning.",
    "word.hint": "Use the left and right arrow keys, or swipe the sign, to move to the next word.",
    "word.meaning": "Meaning",
    "word.example": "Example",
    "word.origin": "Origin",
    "word.sources": "Sources",
    "word.adjacent": "Neighboring words",
    "word.prev": "Previous word",
    "word.next": "Next word",
    "word.first": "First stop",
    "word.last": "Last stop",
  },
  ja: {
    "site.name": "goi",
    "site.title": "goi｜語の路線図",
    "site.desc": "使いたくなる日本語を集めた語彙帳。種類ごとの路線図から語をたどれます。",
    "lang.switch": "English",
    "lang.switchLabel": "このページを英語で読む",
    "map.lead": "使いたくなる日本語を種類ごとの路線にまとめました。駅を選ぶと、その語の駅名標が開きます。",
    "map.title": "路線図",
    "map.line": (kind: Word["kind"]) => `${KIND_LABEL.ja[kind]}線`,
    "map.back": "路線図に戻る",
    "search.label": "語を探す",
    "search.placeholder": "見出し・読み・意味の一部",
    "search.found": (n: number) => `${n}駅が見つかりました`,
    "search.none": "この言葉に合う駅はありません。読みをひらがなで入れるか、意味の一部で探してみてください。",
    "word.hint": "左右の矢印キーか、駅名標を横にスワイプしても隣の語に移れます。",
    "word.meaning": "意味",
    "word.example": "用例",
    "word.origin": "由来",
    "word.sources": "出典",
    "word.adjacent": "となりの語",
    "word.prev": "前の語",
    "word.next": "次の語",
    "word.first": "始発",
    "word.last": "終点",
  },
} as const;

export type DictKey = keyof (typeof dict)["en"];

export function t<K extends DictKey>(lang: Lang, key: K): (typeof dict)["en"][K] {
  return dict[lang][key] as (typeof dict)["en"][K];
}
