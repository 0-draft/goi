// OGP 画像に載せる文字列を整える純粋な関数。描画やフォント取得から切り離して試験する

/** 全角を 1、半角（ASCII と半角カナ）を 0.5 として数えた見た目の幅 */
export function visualWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += /[\x20-\x7e｡-ﾟ]/.test(ch) ? 0.5 : 1;
  return w;
}

// 省略記号の直前に残ると見苦しい字
const TRAILING = /[、。，．・：；「『（〈《【\s]+$/u;

/**
 * 意味を1行に収める。最初の文がまるごと入るならそれを使い、
 * 入らなければ全角 max 字ぶんで切って「…」を付ける。
 */
export function oneLine(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  const first = flat.match(/^.*?。/u)?.[0] ?? flat;
  if (visualWidth(first) <= max) return first;
  let out = "";
  for (const ch of first) {
    if (visualWidth(out + ch) > max - 1) break;
    out += ch;
  }
  return `${out.replace(TRAILING, "")}…`;
}

/** 見出し語の字の大きさ。幅 width に1行で収まる大きさを min〜max の範囲で選ぶ */
export function headwordSize(word: string, width: number, min = 84, max = 184): number {
  const w = visualWidth(word);
  return Math.max(min, Math.min(max, Math.floor(width / Math.max(w, 1))));
}

/** フォントの text= に渡す字。重複を除いて並べ、同じ入力なら同じ値になるようにする */
export function collectGlyphs(...texts: string[]): string {
  return [...new Set(texts.join(""))].sort().join("");
}
