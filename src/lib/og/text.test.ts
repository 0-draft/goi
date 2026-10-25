import { describe, expect, it } from "vitest";
import words from "../../data/words.json";
import { ogGlyphs } from "./render";
import { collectGlyphs, headwordSize, oneLine, visualWidth } from "./text";

describe("visualWidth", () => {
  it("全角を1、半角を0.5で数える", () => {
    expect(visualWidth("関の山")).toBe(3);
    expect(visualWidth("goi")).toBe(1.5);
    expect(visualWidth("ｶﾅ")).toBe(1);
  });
});

describe("oneLine", () => {
  it("最初の文が収まればそのまま使う", () => {
    expect(oneLine("人情の機微に疎いこと。二文目。", 20)).toBe("人情の機微に疎いこと。");
  });

  it("句点がなく収まる文はそのまま返す", () => {
    expect(oneLine("短い説明", 10)).toBe("短い説明");
  });

  it("長い文は max 字以内で切って省略記号を付ける", () => {
    const long = "初代が苦労して築いた家も、三代目になると遊びにふけって潰してしまうという皮肉。";
    const out = oneLine(long, 20);
    expect(out.endsWith("…")).toBe(true);
    expect(visualWidth(out)).toBeLessThanOrEqual(20);
    expect(long.startsWith(out.slice(0, -1))).toBe(true);
  });

  it("省略記号の直前に読点を残さない", () => {
    // 9字目が読点になる長さで切る
    expect(oneLine("あいうえおかきく、けこさしすせそたちつてと。", 10)).toBe("あいうえおかきく…");
  });

  it("改行や連続する空白は1つにまとめる", () => {
    expect(oneLine("a\n  b", 10)).toBe("a b");
  });
});

describe("headwordSize", () => {
  it("短い語は上限、長い語は幅に収まる大きさ", () => {
    expect(headwordSize("野暮", 1040)).toBe(184);
    const size = headwordSize("売り家と唐様で書く三代目", 1040);
    expect(size * 12).toBeLessThanOrEqual(1040);
  });

  it("どれほど長くても下限より小さくしない", () => {
    expect(headwordSize("あ".repeat(40), 1040)).toBe(84);
  });
});

describe("collectGlyphs", () => {
  it("重複を除いて並べ、順序に依らず同じ値を返す", () => {
    expect(collectGlyphs("ばなな", "なば")).toBe(collectGlyphs("なば", "ばなな"));
    expect(collectGlyphs("ばなな")).toBe("なば");
  });

  it("確定した語の見出し・読み・種類を取りこぼさない", () => {
    const ready = words.filter((w) => !("pending" in w));
    const glyphs = new Set(ogGlyphs(ready));
    for (const w of ready) {
      for (const ch of w.word + w.reading + w.kind) expect(glyphs.has(ch), `${w.id}: ${ch}`).toBe(true);
    }
    for (const ch of "goi語…0123456789") expect(glyphs.has(ch)).toBe(true);
  });
});
