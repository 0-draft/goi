import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const L404 = [
  {
    lang: "en",
    prefix: "",
    h1: "Page not found",
    moved: "This page has moved",
    home: "Back to the route map",
    wordLink: "the page for 日下開山",
    mapLink: "the route map",
  },
  {
    lang: "ja",
    prefix: "ja/",
    h1: "ページが見つかりません",
    moved: "ページは移動しました",
    home: "トップの路線図に戻る",
    wordLink: "「日下開山」のページ",
    mapLink: "トップの路線図",
  },
] as const;

for (const L of L404) {
  test.describe(`404 (${L.lang})`, () => {
    test("存在しないパスで 404 ページを返し、トップへ案内する", async ({ page }) => {
      const res = await page.goto(`${L.prefix}no-such-page/`);
      expect(res?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", L.lang);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(L.h1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
      await expect(page.getByRole("link", { name: L.home })).toHaveAttribute("href", `/goi/${L.prefix}`);
      await expect(page.getByRole("heading", { name: L.moved })).toBeHidden();
    });

    test("3案を出していたころの語のページを今の URL へ案内する", async ({ page }) => {
      for (const v of ["a", "b", "c"]) {
        await page.goto(`${L.prefix}${v}/w/hinoshita-kaisan/`);
        await expect(page.getByRole("heading", { name: L.moved })).toBeVisible();
        await expect(page.getByRole("link", { name: L.wordLink })).toHaveAttribute(
          "href",
          `/goi/${L.prefix}w/hinoshita-kaisan/`,
        );
      }
    });

    test("3案の一覧ページはトップへ案内する", async ({ page }) => {
      await page.goto(`${L.prefix}b/`);
      await expect(page.getByRole("heading", { name: L.moved })).toBeVisible();
      await expect(page.getByRole("link", { name: L.mapLink, exact: true })).toHaveAttribute(
        "href",
        `/goi/${L.prefix}`,
      );
    });

    test("ない語や確認中の語には案内を出さない", async ({ page }) => {
      for (const id of ["no-such-word", "itai-kotoba"]) {
        await page.goto(`${L.prefix}a/w/${id}/`);
        await expect(page.getByRole("heading", { name: L.moved })).toBeHidden();
      }
    });

    for (const colorScheme of ["light", "dark"] as const) {
      test(`アクセシビリティ違反がない (${colorScheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(`${L.prefix}c/w/hinoshita-kaisan/`);
        await expect(page.getByRole("heading", { name: L.moved })).toBeVisible();
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(violations).toEqual([]);
      });
    }
  });
}

test("sitemap.xml と robots.txt を配信する", async ({ request }) => {
  const sitemap = await request.get("sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).toContain("<loc>https://0-draft.github.io/goi/</loc>");
  expect(xml).toContain("<loc>https://0-draft.github.io/goi/ja/w/hinoshita-kaisan/</loc>");
  expect(xml).toContain('hreflang="ja" href="https://0-draft.github.io/goi/ja/w/hinoshita-kaisan/"');
  expect(xml).not.toContain("itai-kotoba");

  const robots = await request.get("robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap: https://0-draft.github.io/goi/sitemap.xml");
});
