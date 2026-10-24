import { getCollection } from "astro:content";
import type { Word } from "../../lib/schema";
import { normalize } from "../../lib/search";
import { assignColors, type Swatch } from "./color";

export interface Entry {
  id: string;
  data: Word;
  swatch: Swatch;
  /** 見出しがかな書きで、読みを振る意味がない */
  kanaOnly: boolean;
}

/** 確定した語を五十音順に並べ、色を付けて返す */
export async function loadEntries(): Promise<Entry[]> {
  const words = (await getCollection("words"))
    .filter((w) => !w.data.pending)
    .sort((a, b) => a.data.reading.localeCompare(b.data.reading, "ja"));
  const colors = assignColors(words.map((w) => w.id));
  return words.map((w) => ({
    id: w.id,
    data: w.data,
    // biome-ignore lint/style/noNonNullAssertion: assignColors は渡した id すべてに色を返す
    swatch: colors.get(w.id)!,
    kanaOnly: normalize(w.data.word) === normalize(w.data.reading),
  }));
}

/** 見出し用ディスプレイ書体を、実際に使う字だけに絞って読み込むための text= 値 */
export function displayGlyphs(entries: Entry[]): string {
  return [...new Set(entries.flatMap((e) => [...e.data.word]))].sort().join("");
}

export const vtName = (id: string) => `w-${id}`;
