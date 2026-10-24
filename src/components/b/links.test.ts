import { describe, expect, it } from "vitest";
import type { Word } from "../../lib/schema";
import { type Entry, linkGraph, segment, termsOf } from "./links";

const word = (id: string, w: string, reading: string, example = ""): Entry => ({
  id,
  data: { id, word: w, reading, kind: "名詞", meaning: "", origin: "", example, sources: [] } as Word,
});

const hare = word("hare-to-ke", "ハレとケ", "はれとけ", "今日はハレの日だ。");
const seki = word("seki-no-yama", "関の山", "せきのやま", "晴れ舞台もハレの一つ。関の山だ。");
const entries = [hare, seki];

describe("links", () => {
  it("対語の片割れも表記の候補にする", () => {
    expect(termsOf(hare.data)).toEqual(["ハレとケ", "はれとけ", "ハレ"]);
  });

  it("他の語の見出しはリンク、自分の見出しは self にする", () => {
    expect(segment(seki.data.example, seki.id, entries)).toEqual([
      { type: "text", text: "晴れ舞台も" },
      { type: "link", text: "ハレ", id: "hare-to-ke" },
      { type: "text", text: "の一つ。" },
      { type: "self", text: "関の山" },
      { type: "text", text: "だ。" },
    ]);
  });

  it("被参照を集める", () => {
    const { incoming, outgoing } = linkGraph(entries);
    expect([...(incoming.get("hare-to-ke") ?? [])]).toEqual(["seki-no-yama"]);
    expect([...(outgoing.get("hare-to-ke") ?? [])]).toEqual([]);
  });
});
