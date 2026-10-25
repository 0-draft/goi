import type { APIRoute, GetStaticPaths } from "astro";
import { ogEntries } from "../../lib/og/entries";
import { renderWord } from "../../lib/og/render";

// 3案の語ページが共有する OGP 画像。ビルド時に静的な PNG として書き出す
export const getStaticPaths = (async () => {
  const { words, glyphs } = await ogEntries();
  return words.map((w) => ({ params: { id: w.id }, props: { word: w.data, glyphs } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderWord(props.word, props.glyphs);
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
