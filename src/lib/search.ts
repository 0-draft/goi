export interface SearchDoc {
  id: string;
  word: string;
  reading: string;
  meaning: string;
}

const KATAKANA = /[ァ-ヶ]/g;

// 全角半角・カタカナひらがな・大文字小文字の差を吸収する
export function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .replace(KATAKANA, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .toLowerCase()
    .replace(/\s+/g, "");
}

export interface IndexedDoc extends SearchDoc {
  keys: { word: string; reading: string; meaning: string };
}

export function buildIndex(docs: SearchDoc[]): IndexedDoc[] {
  return docs.map((d) => ({
    ...d,
    keys: { word: normalize(d.word), reading: normalize(d.reading), meaning: normalize(d.meaning) },
  }));
}

// 見出し・読みの前方一致 > 見出し・読みの部分一致 > 意味の部分一致 の順に並べる
export function search(index: IndexedDoc[], query: string): SearchDoc[] {
  const q = normalize(query);
  if (!q) return [];
  const scored: { doc: IndexedDoc; score: number }[] = [];
  for (const doc of index) {
    const { word, reading, meaning } = doc.keys;
    let score = 0;
    if (word.startsWith(q) || reading.startsWith(q)) score = 3;
    else if (word.includes(q) || reading.includes(q)) score = 2;
    else if (meaning.includes(q)) score = 1;
    if (score) scored.push({ doc, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.doc.reading.localeCompare(b.doc.reading, "ja"))
    .map(({ doc: { keys: _, ...rest } }) => rest);
}
