import { describe, expect, it } from "vitest";
import { buildIndex, normalize, search } from "./search";

const docs = [
  { id: "seki-no-yama", word: "関の山", reading: "せきのやま", meaning: "精一杯のところ。" },
  { id: "hare-to-ke", word: "ハレとケ", reading: "はれとけ", meaning: "非日常と日常。" },
  { id: "kuwasemono", word: "食わせ物", reading: "くわせもの", meaning: "見かけだけの物。" },
];
const index = buildIndex(docs);
const ids = (q: string) => search(index, q).map((d) => d.id);

describe("normalize", () => {
  it("カタカナをひらがなに寄せる", () => {
    expect(normalize("ハレとケ")).toBe("はれとけ");
  });
  it("全角英数と大文字を揃える", () => {
    expect(normalize("ＡＢＣ abc")).toBe("abcabc");
  });
  it("半角カナも扱える", () => {
    expect(normalize("ﾊﾚ")).toBe("はれ");
  });
});

describe("search", () => {
  it("空のクエリは何も返さない", () => {
    expect(ids("  ")).toEqual([]);
  });
  it("読みで引ける", () => {
    expect(ids("せき")).toEqual(["seki-no-yama"]);
  });
  it("カタカナ入力でもひらがなの読みに当たる", () => {
    expect(ids("セキノヤマ")).toEqual(["seki-no-yama"]);
  });
  it("見出しの部分一致で引ける", () => {
    expect(ids("の山")).toEqual(["seki-no-yama"]);
  });
  it("見出し一致を意味一致より上に並べる", () => {
    const idx = buildIndex([
      { id: "a", word: "日常茶飯", reading: "にちじょうさはん", meaning: "ありふれたこと。" },
      { id: "b", word: "ハレとケ", reading: "はれとけ", meaning: "非日常と日常。" },
    ]);
    expect(search(idx, "日常").map((d) => d.id)).toEqual(["a", "b"]);
  });
  it("結果に内部キーを含めない", () => {
    expect(search(index, "くわせ")[0]).not.toHaveProperty("keys");
  });
});
