import { describe, expect, it } from "vitest";
import words from "../../data/words.json";
import type { Word } from "../../lib/schema";
import { buildRoute } from "./route";

const entries = words.map((w) => ({ id: w.id, data: w as Word }));

describe("buildRoute のローマ字", () => {
  const route = buildRoute(entries);
  const romaji = (id: string) => route.stations.find((s) => s.id === id)?.romaji;

  it("語の切れ目をまたいで長音にしない", () => {
    expect(romaji("nengu-no-osamedoki")).toBe("Nengunoosamedoki");
    expect(romaji("yome-toome-kasa-no-uchi")).toBe("Yometōmekasanouchi");
  });

  it("語の中の長音はそのまま", () => {
    expect(romaji("oomie-wo-kiru")).toBe("Ōmieokiru");
  });
});
