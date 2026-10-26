import { expect, test } from "@playwright/test";

const ID = "uriie-to-karayou-de-kaku-sandaime";
const SITE = "https://0-draft.github.io";

async function meta(page: import("@playwright/test").Page, key: string) {
  return page.locator(`meta[property="${key}"], meta[name="${key}"]`).getAttribute("content");
}

for (const [lang, prefix, locale] of [
  ["en", "", "en_US"],
  ["ja", "ja/", "ja_JP"],
] as const) {
  test(`語のページに言語別の OGP 画像が付いている (${lang})`, async ({ page, request }) => {
    await page.goto(`${prefix}w/${ID}/`);
    const image = await meta(page, "og:image");
    expect(image).toBe(`${SITE}/goi/${prefix}og/${ID}.png`);
    expect(await meta(page, "og:image:width")).toBe("1200");
    expect(await meta(page, "og:image:height")).toBe("630");
    expect(await meta(page, "og:image:alt")).toContain("売り家と唐様で書く三代目");
    expect(await meta(page, "twitter:card")).toBe("summary_large_image");
    expect(await meta(page, "og:site_name")).toBe("goi");
    expect(await meta(page, "og:locale")).toBe(locale);

    // 本番のホストではなく、配信中のビルドから同じパスを取る
    const res = await request.get(new URL(image ?? "").pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
    const body = await res.body();
    expect(body.subarray(1, 4).toString()).toBe("PNG");
  });
}

test("トップにサイトの OGP 画像が付いている", async ({ page, request }) => {
  await page.goto("./");
  const image = await meta(page, "og:image");
  expect(image).toBe(`${SITE}/goi/og/index.png`);
  const res = await request.get(new URL(image ?? "").pathname);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/png");
});
