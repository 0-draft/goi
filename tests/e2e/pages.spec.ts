import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("トップから3つのデザイン案に移動できる", async ({ page }) => {
  for (const [name, path] of [
    ["一語一色", "a"],
    ["注の網", "b"],
    ["駅名標", "c"],
  ]) {
    await page.goto("./");
    await page.getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`/goi/${path}/$`));
  }
});

test("トップにアクセシビリティ違反がない", async ({ page }) => {
  await page.goto("./");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
});

test("トップはダークモードでもアクセシビリティ違反がない", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("./");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(21, 21, 21)");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
});

test.describe("404", () => {
  const moved = "語のページは移動しました";

  test("存在しないパスで 404 ページを返し、トップと3案へ案内する", async ({ page }) => {
    const res = await page.goto("no-such-page/");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ページが見つかりません");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    for (const [name, href] of [
      ["トップ", "/goi/"],
      ["一語一色", "/goi/a/"],
      ["注の網", "/goi/b/"],
      ["駅名標", "/goi/c/"],
    ]) {
      await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
    }
    await expect(page.getByRole("heading", { name: moved })).toBeHidden();
  });

  test("旧 /goi/w/<id>/ は各案の語のページへ案内する", async ({ page }) => {
    await page.goto("w/hinoshita-kaisan/");
    await expect(page.getByRole("heading", { name: moved })).toBeVisible();
    await expect(page.getByText("「日下開山」")).toBeVisible();
    for (const [name, v] of [
      ["一語一色で見る", "a"],
      ["注の網で見る", "b"],
      ["駅名標で見る", "c"],
    ]) {
      await expect(page.getByRole("link", { name })).toHaveAttribute("href", `/goi/${v}/w/hinoshita-kaisan/`);
    }
    await page.getByRole("link", { name: "駅名標で見る" }).click();
    await expect(page).toHaveURL(/\/goi\/c\/w\/hinoshita-kaisan\/$/);
  });

  test("旧 URL でも、ない語や確認中の語には案内を出さない", async ({ page }) => {
    for (const id of ["no-such-word", "itai-kotoba"]) {
      await page.goto(`w/${id}/`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("ページが見つかりません");
      await expect(page.getByRole("heading", { name: moved })).toBeHidden();
    }
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`アクセシビリティ違反がない (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("w/hinoshita-kaisan/");
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
  expect(xml).toContain("<loc>https://0-draft.github.io/goi/b/w/hinoshita-kaisan/</loc>");
  expect(xml).not.toContain("itai-kotoba");

  const robots = await request.get("robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap: https://0-draft.github.io/goi/sitemap.xml");
});
