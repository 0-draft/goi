// 一語一色: 語ごとに色を一つ決める。words.json には色を持たせず、id から決定的に計算する。

export const GROUND = "#ECEEEC";
export const INK = "#16181A";

// 浅葱寄りの青緑・藍鼠・鈍色・苔色・藤鼠。赤・朱・金・黄土は使わない
const SURFACES = ["#69B0AC", "#2E4A6B", "#656765", "#8A8F3A", "#8E8AA8"] as const;

// 夜は同じ色を INK に沈める（色相はそのまま、明度だけ落とす）
const NIGHT_MIX = 0.55;

export interface Swatch {
  /** 昼の面 */
  bg: string;
  /** 昼の面に載せる文字色 */
  fg: string;
  /** 夜の面 */
  bgDark: string;
  /** 夜の面に載せる文字色 */
  fgDark: string;
}

function rgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function mix(a: string, b: string, t: number): string {
  const x = rgb(a);
  const y = rgb(b);
  return toHex([x[0] * t + y[0] * (1 - t), x[1] * t + y[1] * (1 - t), x[2] * t + y[2] * (1 - t)]);
}

function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

// 面に対してコントラストが高い方の文字色を選び、AA (4.5) を割ったらビルドを止める
function textOn(bg: string): string {
  const fg = contrast(bg, INK) >= contrast(bg, GROUND) ? INK : GROUND;
  const ratio = contrast(bg, fg);
  if (ratio < 4.5) throw new Error(`contrast ${ratio.toFixed(2)} < 4.5 on ${bg}`);
  return fg;
}

function swatch(bg: string): Swatch {
  const bgDark = mix(bg, INK, NIGHT_MIX);
  return { bg, fg: textOn(bg), bgDark, fgDark: textOn(bgDark) };
}

// FNV-1a。id が変わらない限り色も変わらない
function hash(id: string): number {
  let h = 0x811c9dc5;
  for (const ch of id) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * 並び順どおりの id に色を返す。色はハッシュで決め、直前の語（末尾は先頭とも）と
 * 同じ色になるときだけ次の色へずらす。前後の語のカードが地に溶けないようにするため。
 * 語を足しても色が変わるのは、その前後の語に限られる。
 */
export function assignColors(ids: string[]): Map<string, Swatch> {
  const out = new Map<string, Swatch>();
  const picked: number[] = [];
  ids.forEach((id, n) => {
    const avoid = new Set<number>();
    if (n > 0) avoid.add(picked[n - 1]);
    if (n === ids.length - 1 && n > 1) avoid.add(picked[0]);
    let i = hash(id) % SURFACES.length;
    while (avoid.has(i)) i = (i + 1) % SURFACES.length;
    picked.push(i);
    out.set(id, swatch(SURFACES[i]));
  });
  return out;
}

/** CSS カスタムプロパティとして要素に渡す */
export function swatchVars(s: Swatch): string {
  return `--sl:${s.bg};--fl:${s.fg};--sd:${s.bgDark};--fd:${s.fgDark}`;
}
