import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("404", () => {
  const moved = "ページは移動しました";

  test("存在しないパスで 404 ページを返し、トップへ案内する", async ({ page }) => {
    const res = await page.goto("no-such-page/");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ページが見つかりません");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.getByRole("link", { name: "トップの路線図に戻る" })).toHaveAttribute("href", "/goi/");
    await expect(page.getByRole("heading", { name: moved })).toBeHidden();
  });

  test("3案を出していたころの語のページを今の URL へ案内する", async ({ page }) => {
    for (const v of ["a", "b", "c"]) {
      await page.goto(`${v}/w/hinoshita-kaisan/`);
      await expect(page.getByRole("heading", { name: moved })).toBeVisible();
      await expect(page.getByRole("link", { name: "「日下開山」のページ" })).toHaveAttribute(
        "href",
        "/goi/w/hinoshita-kaisan/",
      );
    }
  });

  test("3案の一覧ページはトップへ案内する", async ({ page }) => {
    await page.goto("b/");
    await expect(page.getByRole("heading", { name: moved })).toBeVisible();
    await expect(page.getByRole("link", { name: "トップの路線図", exact: true })).toHaveAttribute(
      "href",
      "/goi/",
    );
  });

  test("ない語や確認中の語には案内を出さない", async ({ page }) => {
    for (const id of ["no-such-word", "itai-kotoba"]) {
      await page.goto(`a/w/${id}/`);
      await expect(page.getByRole("heading", { name: moved })).toBeHidden();
    }
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`アクセシビリティ違反がない (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("c/w/hinoshita-kaisan/");
      await expect(page.getByRole("heading", { name: moved })).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations).toEqual([]);
    });
  }
});

test("sitemap.xml と robots.txt を配信する", async ({ request }) => {
  const sitemap = await request.get("sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).toContain("<loc>https://0-draft.github.io/goi/</loc>");
  expect(xml).toContain("<loc>https://0-draft.github.io/goi/w/hinoshita-kaisan/</loc>");
  expect(xml).not.toContain("itai-kotoba");

  const robots = await request.get("robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap: https://0-draft.github.io/goi/sitemap.xml");
});
