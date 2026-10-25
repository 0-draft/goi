/** デザイン案のパス。トップから辿れる3案 */
export const VARIANTS = ["a", "b", "c"] as const;

interface MinimalWord {
  id: string;
  pending?: string | undefined;
}

const withSlash = (base: string) => (base.endsWith("/") ? base : `${base}/`);

/** サイト内の全ページの絶対 URL を返す。確認中の語と 404 は含めない */
export function sitemapUrls(site: string | URL, base: string, words: readonly MinimalWord[]): string[] {
  const root = new URL(withSlash(base), site);
  const ids = words.filter((w) => !w.pending).map((w) => w.id);
  const paths = ["", ...VARIANTS.flatMap((v) => [`${v}/`, ...ids.map((id) => `${v}/w/${id}/`)])];
  return paths.map((p) => new URL(p, root).href);
}

/** sitemap.xml の絶対 URL */
export function sitemapLocation(site: string | URL, base: string): string {
  return new URL(`${withSlash(base)}sitemap.xml`, site).href;
}

const escapeXml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function sitemapXml(urls: readonly string[]): string {
  const body = urls.map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function robotsTxt(sitemap: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
}
