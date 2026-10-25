import { describe, expect, it } from "vitest";
import { langFromPath, localePath, stripLocale } from "./ui";

// テストでは base が "/" になるので、期待値も BASE_URL から組み立てる
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

describe("locale paths", () => {
  it("英語は base 直下、日本語は /ja/ の下", () => {
    expect(localePath("en", "a/w/seki-no-yama/")).toBe(`${base}/a/w/seki-no-yama/`);
    expect(localePath("ja", "a/w/seki-no-yama/")).toBe(`${base}/ja/a/w/seki-no-yama/`);
    expect(localePath("en")).toBe(`${base}/`);
    expect(localePath("ja")).toBe(`${base}/ja/`);
  });

  it("接頭辞を外して往復できる", () => {
    for (const p of ["", "a/", "c/w/hare-to-ke/"]) {
      for (const lang of ["en", "ja"] as const) {
        const path = localePath(lang, p);
        expect(stripLocale(path)).toBe(p);
        expect(langFromPath(path)).toBe(lang);
      }
    }
  });

  it("ja で始まる別の語を日本語と取り違えない", () => {
    expect(langFromPath(`${base}/a/w/jaxx/`)).toBe("en");
  });
});
