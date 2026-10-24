import { describe, expect, it } from "vitest";
import words from "../data/words.json";
import { wordSchema } from "./schema";

describe("words.json", () => {
  it.each(words.map((w) => [w.id, w] as const))("%s がスキーマに合う", (_, w) => {
    const r = wordSchema.safeParse(w);
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
  });

  it("id が重複しない", () => {
    const ids = words.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("見出しが重複しない", () => {
    const heads = words.map((w) => w.word);
    expect(new Set(heads).size).toBe(heads.length);
  });

  it("スキーマは不正な語を弾く", () => {
    const bad = { ...words[0], reading: "セキノヤマ" };
    expect(wordSchema.safeParse(bad).success).toBe(false);
    const noSource = { ...words[0], sources: [] };
    expect(wordSchema.safeParse(noSource).success).toBe(false);
  });
});
