import words from "../../src/data/words.json" with { type: "json" };

// ページを持つ (pending でない) 語の数
export const READY = words.filter((w) => !("pending" in w)).length;
