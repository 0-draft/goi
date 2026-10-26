import { describe, expect, it } from "vitest";
import words from "../data/words.json";
import { robotsTxt, sitemapEntries, sitemapLocation, sitemapUrls, sitemapXml } from "./sitemap";

const SITE = "https://0-draft.github.io";

describe("sitemapUrls", () => {
  const urls = sitemapUrls(SITE, "/goi/", words);
  const ready = words.filter((w) => !("pending" in w));

  it("英語と日本語それぞれのトップと確定したすべての語を含む", () => {
    expect(urls[0]).toBe(`${SITE}/goi/`);
    expect(urls).toHaveLength(2 * (1 + ready.length));
    expect(urls).toContain(`${SITE}/goi/w/hinoshita-kaisan/`);
    expect(urls).toContain(`${SITE}/goi/ja/`);
    expect(urls).toContain(`${SITE}/goi/ja/w/hinoshita-kaisan/`);
  });

  it("各ページに英語版と日本語版の相互リンクを持つ", () => {
    const entry = sitemapEntries(SITE, "/goi/", words).find(
      (e) => e.loc === `${SITE}/goi/ja/w/hinoshita-kaisan/`,
    );
    expect(entry?.alternates).toEqual({
      en: `${SITE}/goi/w/hinoshita-kaisan/`,
      ja: `${SITE}/goi/ja/w/hinoshita-kaisan/`,
    });
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
  it("loc と hreflang を並べ、特殊文字をエスケープする", () => {
    const xml = sitemapXml([
      {
        loc: "https://example.com/a&b/",
        alternates: { en: "https://example.com/a&b/", ja: "https://example.com/ja/a&b/" },
      },
    ]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain("<loc>https://example.com/a&#38;b/</loc>");
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="ja" href="https://example.com/ja/a&#38;b/"/>',
    );
  });
});

describe("robotsTxt", () => {
  it("全許可で sitemap の絶対 URL を示す", () => {
    const loc = sitemapLocation(SITE, "/goi/");
    expect(loc).toBe(`${SITE}/goi/sitemap.xml`);
    expect(robotsTxt(loc)).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/goi/sitemap.xml\n`);
  });
});
