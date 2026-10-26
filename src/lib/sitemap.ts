interface MinimalWord {
  id: string;
  pending?: string | undefined;
}

const withSlash = (base: string) => (base.endsWith("/") ? base : `${base}/`);

/** 言語ごとのパスの接頭辞。英語はそのまま、日本語は ja/ の下 */
const PREFIX = { en: "", ja: "ja/" } as const;

export interface SitemapEntry {
  loc: string;
  /** 同じページの各言語版。hreflang として出す */
  alternates: Record<keyof typeof PREFIX, string>;
}

/** サイト内の全ページを言語ごとに返す。確認中の語と 404 は含めない */
export function sitemapEntries(
  site: string | URL,
  base: string,
  words: readonly MinimalWord[],
): SitemapEntry[] {
  const root = new URL(withSlash(base), site);
  const ids = words.filter((w) => !w.pending).map((w) => w.id);
  const paths = ["", ...ids.map((id) => `w/${id}/`)];
  const langs = Object.keys(PREFIX) as (keyof typeof PREFIX)[];
  return langs.flatMap((lang) =>
    paths.map((p) => {
      const alternates = Object.fromEntries(
        langs.map((l) => [l, new URL(`${PREFIX[l]}${p}`, root).href]),
      ) as SitemapEntry["alternates"];
      return { loc: alternates[lang], alternates };
    }),
  );
}

/** サイト内の全ページの絶対 URL */
export function sitemapUrls(site: string | URL, base: string, words: readonly MinimalWord[]): string[] {
  return sitemapEntries(site, base, words).map((e) => e.loc);
}

/** sitemap.xml の絶対 URL */
export function sitemapLocation(site: string | URL, base: string): string {
  return new URL(`${withSlash(base)}sitemap.xml`, site).href;
}

const escapeXml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function sitemapXml(entries: readonly SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const links = Object.entries(e.alternates)
        .map(([l, href]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(href)}"/>`)
        .join("\n");
      return `  <url>\n    <loc>${escapeXml(e.loc)}</loc>\n${links}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}

export function robotsTxt(sitemap: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
}
