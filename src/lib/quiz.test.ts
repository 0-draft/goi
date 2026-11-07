import { describe, expect, it } from "vitest";
import words from "../data/words.json";
import { buildEntries } from "./entries";
import { quizOptions, shortMeaning } from "./quiz";
import type { Word } from "./schema";

const entries = buildEntries(words.map((w) => ({ id: w.id, data: w as Word })));

describe("quizOptions", () => {
  it.each(entries.map((e) => [e.id, e] as const))("%s は正解がちょうど1つで、選択肢が重ならない", (_, e) => {
    for (const lang of ["en", "ja"] as const) {
      const opts = quizOptions(e, entries, lang);
      expect(opts.length).toBeGreaterThanOrEqual(2);
      expect(opts.filter((o) => o.correct)).toHaveLength(1);
      expect(new Set(opts.map((o) => o.text)).size).toBe(opts.length);
    }
  });

  it("同じ語なら毎回同じ並び", () => {
    const e = entries[0];
    expect(quizOptions(e, entries, "en")).toEqual(quizOptions(e, entries, "en"));
  });

  it("調査のある語は調査の選択肢と割合を出す", () => {
    const surveyed = entries.filter((e) => e.word.survey);
    for (const e of surveyed) {
      const opts = quizOptions(e, entries, "ja");
      expect(opts.every((o) => typeof o.pct === "number")).toBe(true);
    }
  });
});

describe("shortMeaning", () => {
  it("日本語は意味の一文目を句点つきで返す", () => {
    const e = entries.find((x) => x.id === "seki-no-yama");
    expect(e && shortMeaning(e, "ja")).toBe("どう頑張ってもそこまでが限度、という精一杯のところ。");
    expect(e && shortMeaning(e, "en")).toBe("the most one can manage");
  });
});
