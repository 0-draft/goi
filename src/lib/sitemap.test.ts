import { describe, expect, it } from "vitest";
import words from "../data/words.json";
import { robotsTxt, sitemapLocation, sitemapUrls, sitemapXml } from "./sitemap";

const SITE = "https://0-draft.github.io";

describe("sitemapUrls", () => {
  const urls = sitemapUrls(SITE, "/goi/", words);
  const ready = words.filter((w) => !("pending" in w));

  it("トップと3案の一覧を含む", () => {
    expect(urls[0]).toBe(`${SITE}/goi/`);
    for (const v of ["a", "b", "c"]) expect(urls).toContain(`${SITE}/goi/${v}/`);
  });

  it("確定した語は3案すべてに載る", () => {
    expect(urls).toHaveLength(1 + 3 * (1 + ready.length));
    for (const v of ["a", "b", "c"]) {
      expect(urls).toContain(`${SITE}/goi/${v}/w/hinoshita-kaisan/`);
    }
  });

  it("確認中の語と 404 は載らない", () => {
    expect(words.some((w) => w.id === "itai-kotoba" && "pending" in w)).toBe(true);
    expect(urls.some((u) => u.includes("itai-kotoba"))).toBe(false);
    expect(urls.some((u) => u.includes("404"))).toBe(false);
  });

  it("すべて絶対 URL で末尾がスラッシュ、重複しない", () => {
    for (const u of urls) {
      expect(u.startsWith(`${SITE}/goi/`)).toBe(true);
      expect(u.endsWith("/")).toBe(true);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("base の末尾スラッシュの有無に左右されない", () => {
    expect(sitemapUrls(SITE, "/goi", words)).toEqual(urls);
  });
});

describe("sitemapXml", () => {
  it("loc を並べ、特殊文字をエスケープする", () => {
    const xml = sitemapXml(["https://example.com/a&b/"]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<loc>https://example.com/a&#38;b/</loc>");
  });
});

describe("robotsTxt", () => {
  it("全許可で sitemap の絶対 URL を示す", () => {
    const loc = sitemapLocation(SITE, "/goi/");
    expect(loc).toBe(`${SITE}/goi/sitemap.xml`);
    expect(robotsTxt(loc)).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/goi/sitemap.xml\n`);
  });
});
