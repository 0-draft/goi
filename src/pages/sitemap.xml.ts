import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { sitemapUrls, sitemapXml } from "../lib/sitemap";

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("astro.config.mjs の site が必要");
  const words = (await getCollection("words")).map((w) => ({ id: w.id, pending: w.data.pending }));
  const xml = sitemapXml(sitemapUrls(site, import.meta.env.BASE_URL, words));
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
