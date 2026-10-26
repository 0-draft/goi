import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { loadFont } from "./font";
import { collectGlyphs, headwordSize, oneLine } from "./text";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const FAMILY = "BIZ UDPGothic";
const PAD_X = 80;
const INNER = OG_WIDTH - PAD_X * 2;
const MEANING_SIZE = 32;
// 意味の行に入る全角の字数。1字ぶん余白を残す
const MEANING_CHARS = Math.floor(INNER / MEANING_SIZE) - 1;

const INK = "#161616";
const MUTED = "#6a6a66";
const PAPER = "#f4f4f1";

export const SITE_NAME = "goi";
export const SITE_TAGLINE = {
  ja: "使いたくなる日本語を集めた語彙帳",
  en: "Japanese words worth using",
} as const;

/** 画像1枚ぶんの文字列。表示言語に合わせて呼び出し側で組む */
export interface OgWord {
  word: string;
  /** 見出しの上に出す読み。日本語版はかな、英語版はローマ字。見出しと同じなら出さない */
  reading: string;
  kind: string;
  meaning: string;
}

/** 画像に描く字すべて。フォントの取得をこの字だけに絞る */
export function ogGlyphs(words: OgWord[]): string {
  return collectGlyphs(
    SITE_NAME,
    ...Object.values(SITE_TAGLINE),
    "0123456789語words …",
    ...words.flatMap((w) => [w.word, w.reading, w.kind, oneLine(w.meaning, MEANING_CHARS)]),
  );
}

// satori に渡す要素。JSX を使わずに組むための最小の形
type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown } };
const el = (style: Record<string, unknown>, children?: unknown): Node => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

function frame(top: Node[], middle: Node[], bottom: Node[]): Node {
  return el(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      flexDirection: "column",
      justifyContent: "space-between",
      padding: `64px ${PAD_X}px 72px`,
      background: PAPER,
      color: INK,
      fontFamily: FAMILY,
    },
    [
      el({ justifyContent: "space-between", alignItems: "baseline", fontSize: 26, color: MUTED }, top),
      el({ flexDirection: "column" }, middle),
      el({ flexDirection: "column" }, bottom),
    ],
  );
}

const mark = el({ fontWeight: 700, fontSize: 30, color: INK, letterSpacing: "0.02em" }, SITE_NAME);

function wordCard(w: OgWord): Node {
  const size = headwordSize(w.word, INNER);
  const showReading = w.reading !== w.word;
  return frame(
    [mark, el({}, w.kind)],
    [
      el(
        { fontSize: 34, color: MUTED, letterSpacing: "0.12em", marginBottom: 12 },
        showReading ? w.reading : "",
      ),
      el({ fontSize: size, fontWeight: 700, lineHeight: 1.15, letterSpacing: "0.02em" }, w.word),
    ],
    [
      el({ width: 56, height: 4, background: INK, marginBottom: 28 }),
      el({ fontSize: MEANING_SIZE, lineHeight: 1.4 }, oneLine(w.meaning, MEANING_CHARS)),
    ],
  );
}

function siteCard(count: number, lang: keyof typeof SITE_TAGLINE): Node {
  return frame(
    [mark, el({}, lang === "ja" ? `${count}語` : `${count} words`)],
    [el({ fontSize: 184, fontWeight: 700, lineHeight: 1.1, letterSpacing: "0.01em" }, SITE_NAME)],
    [
      el({ width: 56, height: 4, background: INK, marginBottom: 28 }),
      el({ fontSize: 40, lineHeight: 1.4 }, SITE_TAGLINE[lang]),
    ],
  );
}

async function toPng(node: Node, glyphs: string): Promise<Uint8Array<ArrayBuffer>> {
  const [regular, bold] = await Promise.all([loadFont(FAMILY, 400, glyphs), loadFont(FAMILY, 700, glyphs)]);
  const svg = await satori(node as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: FAMILY, data: regular, weight: 400, style: "normal" },
      { name: FAMILY, data: bold, weight: 700, style: "normal" },
    ],
  });
  // Response に渡せるよう、Node の Buffer から ArrayBuffer を持つ Uint8Array に移す
  return new Uint8Array(new Resvg(svg, { fitTo: { mode: "original" } }).render().asPng());
}

export const renderWord = (w: OgWord, glyphs: string) => toPng(wordCard(w), glyphs);
export const renderSite = (count: number, lang: keyof typeof SITE_TAGLINE, glyphs: string) =>
  toPng(siteCard(count, lang), glyphs);
