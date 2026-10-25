import type { APIRoute } from "astro";
import { ogEntries } from "../../lib/og/entries";
import { renderSite } from "../../lib/og/render";

// トップと各案の一覧ページで使うサイト全体の OGP 画像
export const GET: APIRoute = async () => {
  const { words, glyphs } = await ogEntries();
  const png = await renderSite(words.length, glyphs);
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
