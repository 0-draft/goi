import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("C 駅名標", () => {
  test("路線図から語の駅名標に移動できる", async ({ page }) => {
    await page.goto("c/");
    await page.getByRole("link", { name: /関の山/ }).click();
    await expect(page).toHaveURL(/\/goi\/c\/w\/seki-no-yama\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("関の山");
    await expect(page.getByText("Sekinoyama", { exact: true }).first()).toBeVisible();
  });

  test("次の駅をたどって隣の語に移れる", async ({ page }) => {
    await page.goto("c/w/hinoshita-kaisan/");
    const nav = page.getByRole("navigation", { name: "となりの語" });
    await nav.getByRole("link", { name: /次の語/ }).click();
    await expect(page).toHaveURL(/\/c\/w\/seki-no-yama\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("関の山");
  });

  test("左右の矢印キーで隣の語に移れる", async ({ page }) => {
    await page.goto("c/w/seki-no-yama/");
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/c\/w\/hinoshita-kaisan\/$/);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/c\/w\/seki-no-yama\/$/);
  });

  test("検索で路線図の駅が絞り込まれる", async ({ page }) => {
    await page.goto("c/");
    const stations = page.locator(".c-station:visible");
    await expect(stations).toHaveCount(5);

    const box = page.getByRole("searchbox", { name: "語を探す" });
    await box.fill("セキ");
    await expect(stations).toHaveCount(1);
    await expect(stations.first()).toContainText("関の山");
    await expect(page.getByRole("status")).toHaveText("1駅が見つかりました");

    await box.fill("該当しない語");
    await expect(stations).toHaveCount(0);
    await expect(page.getByText("この言葉に合う駅はありません", { exact: false })).toBeVisible();

    await box.fill("");
    await expect(stations).toHaveCount(5);
  });

  test("確認中の語は駅にならない", async ({ page }) => {
    await page.goto("c/");
    await expect(page.getByRole("link", { name: /いたい言葉/ })).toHaveCount(0);
    const res = await page.goto("c/w/itai-kotoba/");
    expect(res?.status()).toBe(404);
  });

  for (const path of ["c/", "c/w/seki-no-yama/"]) {
    for (const colorScheme of ["light", "dark"] as const) {
      test(`${path} (${colorScheme}) にアクセシビリティ違反がない`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(violations).toEqual([]);
      });
    }
  }
});
