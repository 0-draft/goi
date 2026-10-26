import type { APIRoute, GetStaticPaths } from "astro";
import type { Lang } from "../../i18n/ui";
import { ogEntries } from "./entries";
import { renderSite, renderWord } from "./render";

const png = (body: Uint8Array<ArrayBuffer>) =>
  new Response(body, { headers: { "Content-Type": "image/png" } });

/** 語ごとの OGP 画像の静的パス。言語ごとのページから呼ぶ */
export function wordImagePaths(lang: Lang): GetStaticPaths {
  return async () => {
    const { byLang, glyphs } = await ogEntries();
    return byLang[lang].map(({ id, card }) => ({ params: { id }, props: { card, glyphs } }));
  };
}

export const wordImage: APIRoute = async ({ props }) => png(await renderWord(props.card, props.glyphs));

/** トップで使うサイト全体の OGP 画像 */
export function siteImage(lang: Lang): APIRoute {
  return async () => {
    const { byLang, glyphs } = await ogEntries();
    return png(await renderSite(byLang[lang].length, lang, glyphs));
  };
}
