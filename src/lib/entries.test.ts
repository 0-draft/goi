import { describe, expect, it } from "vitest";
import words from "../data/words.json";
import { buildEntries, dailyIndex, romajiFromId, seeded } from "./entries";
import type { Word } from "./schema";

const entries = buildEntries(words.map((w) => ({ id: w.id, data: w as Word })));
const romaji = (id: string) => entries.find((e) => e.id === id)?.romaji;

describe("romajiFromId", () => {
  it("語の切れ目で分かち書きする", () => {
    expect(romaji("seki-no-yama")).toBe("Seki no yama");
    expect(romaji("uriie-to-karayou-de-kaku-sandaime")).toBe("Uriie to karayō de kaku sandaime");
  });

  it("助詞の を は o、は は wa と書く", () => {
    expect(romaji("saba-wo-yomu")).toBe("Saba o yomu");
    expect(romaji("bushi-wa-kuwanedo-takayouji")).toBe("Bushi wa kuwanedo takayōji");
  });

  it("語の切れ目をまたいで長音にしない", () => {
    expect(romaji("nengu-no-osamedoki")).toBe("Nengu no osamedoki");
    expect(romaji("yome-toome-kasa-no-uchi")).toBe("Yome tōme kasa no uchi");
  });

  it("語の中の長音・促音", () => {
    expect(romaji("oomie-wo-kiru")).toBe("Ōmie o kiru");
    expect(romaji("oomukou")).toBe("Ōmukō");
    expect(romaji("okkuu")).toBe("Okkū");
    expect(romaji("icchoura")).toBe("Itchōra");
  });

  it("四字熟語は前後半をハイフンでつなぐ", () => {
    expect(romajiFromId("umisen-yamasen", "四字熟語")).toBe("Umisen-yamasen");
    expect(romaji("uzou-muzou")).toBe("Uzō-muzō");
  });
});

describe("buildEntries", () => {
  it("確認中の語を除き、五十音順に01から番号を振る", () => {
    expect(entries.some((e) => e.id === "itai-kotoba")).toBe(false);
    expect(entries[0].number).toBe("01");
    expect(entries.at(-1)?.number).toBe(String(entries.length).padStart(2, "0"));
    const readings = entries.map((e) => e.word.reading);
    expect(readings).toEqual([...readings].sort((a, b) => a.localeCompare(b, "ja")));
  });
});

describe("dailyIndex", () => {
  it("同じ日は同じ語、翌日は別の語", () => {
    const a = dailyIndex(new Date("2026-11-07T00:00:00+09:00"), 68);
    expect(dailyIndex(new Date("2026-11-07T23:59:00+09:00"), 68)).toBe(a);
    expect(dailyIndex(new Date("2026-11-08T00:00:00+09:00"), 68)).not.toBe(a);
  });

  it("件数ぶんの日数で全語を一巡する", () => {
    const seen = new Set<number>();
    for (let d = 0; d < 68; d++) seen.add(dailyIndex(new Date(Date.UTC(2026, 0, 1) + d * 86400_000), 68));
    expect(seen.size).toBe(68);
  });
});

describe("seeded", () => {
  it("同じ id なら同じ値", () => {
    expect(seeded("seki-no-yama")).toBe(seeded("seki-no-yama"));
    expect(seeded("seki-no-yama")).toBeGreaterThanOrEqual(0);
    expect(seeded("seki-no-yama")).toBeLessThan(1);
  });
});
