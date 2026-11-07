import { getCollection } from "astro:content";
import { buildEntries } from "../lib/entries";

/** 語のページの静的パス。英語版と日本語版で同じものを使う */
export async function wordPaths() {
  const entries = buildEntries(await getCollection("words"));
  return entries.map((entry, i) => ({
    params: { id: entry.id },
    props: { entry, prev: entries[i - 1], next: entries[i + 1], entries },
  }));
}
