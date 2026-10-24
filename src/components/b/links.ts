import type { Word } from "../../lib/schema";

// 本文中に他の語の見出しが出てきたら、ビルド時にリンクへ置き換える。
// words.json にはフィールドを足さず、ここで全部計算する。

export type Segment =
  | { type: "text"; text: string }
  | { type: "self"; text: string }
  | { type: "link"; text: string; id: string };

export interface Entry {
  id: string;
  data: Word;
}

const HIRAGANA = /^[\p{Script=Hiragana}ー]+$/u;
const KANA = /^[\p{Script=Katakana}\p{Script=Hiragana}ー]+$/u;

// 語を指す表記の候補。見出しそのもの、4 字以上のひらがな読み、
// 「ハレとケ」のような対語なら 2 字以上の片割れ（ハレ）も拾う。
export function termsOf(w: Word): string[] {
  const terms = new Set<string>([w.word]);
  if (w.reading.length >= 4 && HIRAGANA.test(w.reading)) terms.add(w.reading);
  const pair = w.word.match(/^(.+)と(.+)$/);
  if (pair) {
    for (const part of pair.slice(1)) if (part.length >= 2 && KANA.test(part)) terms.add(part);
  }
  return [...terms];
}

interface Term {
  text: string;
  id: string;
}

function allTerms(entries: Entry[]): Term[] {
  return entries
    .flatMap((e) => termsOf(e.data).map((text) => ({ text, id: e.id })))
    .sort((a, b) => b.text.length - a.text.length);
}

// 長い表記を優先し、重ならないように左から切り分ける
export function segment(text: string, selfId: string, entries: Entry[]): Segment[] {
  const terms = allTerms(entries);
  const out: Segment[] = [];
  let buf = "";
  let i = 0;
  while (i < text.length) {
    const hit = terms.find((t) => text.startsWith(t.text, i));
    if (!hit) {
      buf += text[i];
      i += 1;
      continue;
    }
    if (buf) out.push({ type: "text", text: buf });
    buf = "";
    out.push(
      hit.id === selfId ? { type: "self", text: hit.text } : { type: "link", text: hit.text, id: hit.id },
    );
    i += hit.text.length;
  }
  if (buf) out.push({ type: "text", text: buf });
  return out;
}

function bodyOf(w: Word): string[] {
  return [w.meaning, w.example, w.origin];
}

// 語 id → その語を参照しているページ、参照先
export function linkGraph(entries: Entry[]) {
  const outgoing = new Map<string, Set<string>>();
  const incoming = new Map<string, Set<string>>();
  for (const e of entries) {
    outgoing.set(e.id, new Set());
    incoming.set(e.id, new Set());
  }
  for (const e of entries) {
    for (const text of bodyOf(e.data)) {
      for (const s of segment(text, e.id, entries)) {
        if (s.type !== "link") continue;
        outgoing.get(e.id)?.add(s.id);
        incoming.get(s.id)?.add(e.id);
      }
    }
  }
  return { outgoing, incoming };
}

export function byReading(a: Entry, b: Entry): number {
  return a.data.reading.localeCompare(b.data.reading, "ja");
}
