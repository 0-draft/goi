import type { Word } from "../lib/schema";
import type { Theme } from "../lib/themes";

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

export const THEME_LABEL: Record<Lang, Record<Theme, string>> = {
  en: {
    sumo: "Sumo",
    stage: "The stage",
    buddhism: "Buddhism",
    history: "History",
    trade: "Trade & money",
    body: "Body & mind",
    animals: "Animals",
    everyday: "Everyday life",
  },
  ja: {
    sumo: "相撲",
    stage: "芝居・舞台",
    buddhism: "仏教",
    history: "歴史",
    trade: "商い・お金",
    body: "体と心",
    animals: "生き物",
    everyday: "暮らし",
  },
};

export const dict = {
  en: {
    "site.name": "goi",
    "site.title": "goi | Japanese words people know but rarely use",
    "site.desc":
      "A glossary of Japanese idioms, proverbs and words that most people know but rarely say themselves, each with its meaning, origin, an example and sources.",
    "lang.switch": "日本語",
    "lang.switchLabel": "Read this page in Japanese",
    "home.lead": (n: number) =>
      `Japanese words most people know but rarely say themselves. Each of the ${n} comes with its meaning, where it came from, an example and sources.`,
    "today.title": "Today",
    "today.read": "Read",
    "today.another": "Another word",
    "index.title": "Index",
    "index.filter": "Filter by origin",
    "index.all": "All",
    "index.misread": "Often misread",
    "index.back": "Index",
    "search.label": "Search",
    "search.placeholder": "Word, reading, romaji or English",
    "search.found": (n: number) => `${n} ${n === 1 ? "word" : "words"} found`,
    "search.none": "Nothing matches. Try the reading in hiragana or romaji, or part of the meaning.",
    "word.no": "No.",
    "word.meaning": "Meaning",
    "word.example": "Example",
    "word.origin": "Origin",
    "word.sources": "Sources",
    "word.adjacent": "Neighboring words",
    "word.prev": "Previous word",
    "word.next": "Next word",
    "word.random": "Random word",
    "quiz.title": "Which meaning is right?",
    "quiz.skip": "Just show me",
    "quiz.right": "Right.",
    "quiz.wrong": "Not quite.",
    "quiz.survey": (year: string) => `How people in Japan answered (Agency for Cultural Affairs, ${year})`,
    "quiz.you": "your answer",
    "quiz.original": "original meaning",
    "footer.note": "Every meaning and origin links to the sources it was checked against.",
  },
  ja: {
    "site.name": "goi",
    "site.title": "goi｜知っているのに使わない日本語",
    "site.desc":
      "知っているのに自分では使わない慣用句・ことわざ・四字熟語を集めた語彙帳。意味・由来・用例と出典つき。",
    "lang.switch": "English",
    "lang.switchLabel": "このページを英語で読む",
    "home.lead": (n: number) =>
      `知っているのに、自分ではあまり使わない日本語の語彙帳です。${n}語それぞれに意味・由来・用例と、確かめた出典をつけています。`,
    "today.title": "今日の一語",
    "today.read": "読む",
    "today.another": "ほかの語",
    "index.title": "索引",
    "index.filter": "由来で絞る",
    "index.all": "すべて",
    "index.misread": "取り違えやすい",
    "index.back": "索引",
    "search.label": "語を探す",
    "search.placeholder": "見出し・読み・意味の一部",
    "search.found": (n: number) => `${n}語が見つかりました`,
    "search.none": "合う語がありません。読みをひらがなで入れるか、意味の一部で探してみてください。",
    "word.no": "No.",
    "word.meaning": "意味",
    "word.example": "用例",
    "word.origin": "由来",
    "word.sources": "出典",
    "word.adjacent": "となりの語",
    "word.prev": "前の語",
    "word.next": "次の語",
    "word.random": "でたらめに一語",
    "quiz.title": "どちらの意味？",
    "quiz.skip": "答えを見る",
    "quiz.right": "正解。",
    "quiz.wrong": "残念。",
    "quiz.survey": (year: string) => `文化庁「国語に関する世論調査」${year}の回答`,
    "quiz.you": "あなたの答え",
    "quiz.original": "本来の意味",
    "footer.note": "意味と由来は、ページごとに挙げた出典で確かめています。",
  },
} as const;

export type DictKey = keyof (typeof dict)["en"];

export function t<K extends DictKey>(lang: Lang, key: K): (typeof dict)["en"][K] {
  return dict[lang][key] as (typeof dict)["en"][K];
}
