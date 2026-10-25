import type { APIRoute } from "astro";
import { robotsTxt, sitemapLocation } from "../lib/sitemap";

// GitHub Pages のプロジェクトサイトでは /goi/robots.txt に置かれ、クローラはドメイン直下の
// /robots.txt しか読まない。効き目は薄いが、sitemap の場所を示すために置いておく
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("astro.config.mjs の site が必要");
  const body = robotsTxt(sitemapLocation(site, import.meta.env.BASE_URL));
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
