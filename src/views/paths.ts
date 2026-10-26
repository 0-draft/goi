import { getCollection } from "astro:content";
import { buildRoute } from "../components/c/route";

/** 語のページの静的パス。英語版と日本語版で同じものを使う */
export async function wordPaths() {
  const { stations } = buildRoute(await getCollection("words"));
  return stations.map((station, i) => ({
    params: { id: station.id },
    props: { station, prev: stations[i - 1], next: stations[i + 1] },
  }));
}
