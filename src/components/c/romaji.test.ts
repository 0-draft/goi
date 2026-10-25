import { describe, expect, it } from "vitest";
import { toRomaji } from "./romaji";

describe("toRomaji", () => {
  it.each([
    ["せきのやま", "Sekinoyama"],
    ["ひのしたかいさん", "Hinoshitakaisan"],
    ["あばたもえくぼ", "Abatamoekubo"],
    ["くわせもの", "Kuwasemono"],
    ["はれとけ", "Haretoke"],
    ["とうきょう", "Tōkyō"],
    ["しんじゅく", "Shinjuku"],
    ["きっぷ", "Kippu"],
    ["まっちゃ", "Matcha"],
    ["かんよう", "Kan'yō"],
    ["らーめん", "Rāmen"],
    ["じゃま", "Jama"],
  ])("%s → %s", (kana, romaji) => {
    expect(toRomaji(kana)).toBe(romaji);
  });
});
