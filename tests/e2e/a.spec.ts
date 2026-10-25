import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { READY } from "./data";

test.describe("A 一語一色", () => {
  test("一覧から語のページに移動できる", async ({ page }) => {
    await page.goto("a/");
    await page.getByRole("link", { name: /関の山/ }).click();
    await expect(page).toHaveURL(/\/goi\/a\/w\/seki-no-yama\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("関の山");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("せきのやま");
  });

  test("確認中の語は一覧に出ず、ページもない", async ({ page }) => {
    await page.goto("a/");
    await expect(page.getByRole("link", { name: /いたい言葉/ })).toHaveCount(0);
    const res = await page.goto("a/w/itai-kotoba/");
    expect(res?.status()).toBe(404);
  });

  test("検索で一覧が絞り込まれる", async ({ page }) => {
    await page.goto("a/");
    const rows = page.locator("[data-rows] > li:visible");
    await expect(rows).toHaveCount(READY);

    const box = page.getByRole("searchbox", { name: "さがす" });
    await box.fill("セキノヤマ");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("関の山");
    await expect(page.locator("[data-count]")).toHaveText("1語");

    await box.fill("横綱");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("日下開山");

    await box.fill("ぬぬぬ");
    await expect(rows).toHaveCount(0);
    await expect(page.getByText("「ぬぬぬ」に当たる語はありません")).toBeVisible();

    await box.fill("");
    await expect(rows).toHaveCount(READY);
  });

  test("JavaScript がなくても一覧は使える", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("a/");
    await expect(page.locator("[data-rows] > li")).toHaveCount(READY);
    await expect(page.getByRole("search")).toBeHidden();
    await ctx.close();
  });

  test("前後の語へ移動できる", async ({ page }) => {
    await page.goto("a/w/seki-no-yama/");
    const nav = page.getByRole("navigation", { name: "前後の語" });
    await expect(nav.getByRole("link")).toHaveCount(2);
    await nav.getByRole("link", { name: /次の語/ }).click();
    await expect(page).not.toHaveURL(/seki-no-yama/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  for (const scheme of ["light", "dark"] as const) {
    for (const path of ["a/", "a/w/seki-no-yama/", "a/w/hinoshita-kaisan/", "a/w/hare-to-ke/"]) {
      test(`${path} (${scheme}) にアクセシビリティ違反がない`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.goto(path);
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(violations).toEqual([]);
      });
    }
  }
});
