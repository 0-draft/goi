import { getCollection } from "astro:content";
import { ogGlyphs } from "./render";

/** 画像を作る語（pending を除く）と、全画像で共通のフォント用の字 */
export async function ogEntries() {
  const words = (await getCollection("words")).filter((w) => !w.data.pending);
  return { words, glyphs: ogGlyphs(words.map((w) => w.data)) };
}
