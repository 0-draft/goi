import type { Word } from "./schema";

/** 索引に並ぶ1語。番号は読みの五十音順で振る */
export interface Entry {
  id: string;
  word: Word;
  romaji: string;
  /** 01, 02 … の2桁 */
  number: string;
}

// id の区切りのうち、ローマ字で前後と離して書く助詞
const PARTICLE: Record<string, string> = {
  wo: "o",
  wa: "wa",
  no: "no",
  to: "to",
  ni: "ni",
  de: "de",
  mo: "mo",
  ga: "ga",
};

/**
 * id（語の切れ目をハイフンで区切ったローマ字）から表示用のヘボン式を作る。
 * 読みのかなからは語の切れ目が分からず「Sekinoyama」のように続いてしまうため、id の区切りを使う。
 * 長音はマクロンにし、四字熟語は前後半をハイフンでつなぐ
 */
export function romajiFromId(id: string, kind: Word["kind"]): string {
  const parts = id
    .split("-")
    .map((seg) => (PARTICLE[seg] ?? seg).replace(/cch/g, "tch").replace(/o[ou]/g, "ō").replace(/uu/g, "ū"));
  const text = parts.join(kind === "四字熟語" ? "-" : " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** 確認済みの語を読みの五十音順に並べ、番号とローマ字を付ける */
export function buildEntries(entries: { id: string; data: Word }[]): Entry[] {
  return entries
    .filter((e) => !e.data.pending)
    .sort((a, b) => a.data.reading.localeCompare(b.data.reading, "ja"))
    .map((e, i) => ({
      id: e.id,
      word: e.data,
      romaji: romajiFromId(e.id, e.data.kind),
      number: String(i + 1).padStart(2, "0"),
    }));
}

/** 日付ごとに決まる「今日の一語」。同じ日なら誰が見ても同じ語になる */
export function dailyIndex(date: Date, count: number): number {
  // 日本時間の日付で切り替える
  const day = Math.floor((date.getTime() + 9 * 3600_000) / 86400_000);
  // 連続した日に五十音順で隣り合う語が続かないよう、件数と互いに素な歩幅で飛ばす
  let step = 37;
  while (gcd(step, count) !== 1) step++;
  return (day * step) % count;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** id から決まる 0 以上 1 未満の値。選択肢の並びをビルドごとに変えないために使う */
export function seeded(id: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 2 ** 32;
}
