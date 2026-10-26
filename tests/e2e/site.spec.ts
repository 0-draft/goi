import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { READY } from "./data";

// 英語版と日本語版で同じ動きを確かめる。文言だけ言語ごとに持つ
const LANGS = [
  {
    lang: "en",
    prefix: "",
    adjacent: "Neighboring words",
    next: /Next word/,
    search: "Search",
    found: "1 station found",
    none: "No station matches",
    switchTo: "日本語",
  },
  {
    lang: "ja",
    prefix: "ja/",
    adjacent: "となりの語",
    next: /次の語/,
    search: "語を探す",
    found: "1駅が見つかりました",
    none: "この言葉に合う駅はありません",
    switchTo: "English",
  },
] as const;

for (const L of LANGS) {
  test.describe(`駅名標 (${L.lang})`, () => {
    test("路線図から語の駅名標に移動できる", async ({ page }) => {
      await page.goto(L.prefix || "./");
      await expect(page.locator("html")).toHaveAttribute("lang", L.lang);
      await page.getByRole("link", { name: /関の山/ }).click();
      await expect(page).toHaveURL(new RegExp(`/goi/${L.prefix}w/seki-no-yama/$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("関の山");
      await expect(page.getByText("Sekinoyama", { exact: true }).first()).toBeVisible();
    });

    test("次の駅をたどって隣の語に移れる", async ({ page }) => {
      await page.goto(`${L.prefix}w/seki-no-yama/`);
      const next = page.getByRole("navigation", { name: L.adjacent }).getByRole("link", { name: L.next });
      const href = await next.getAttribute("href");
      expect(href).toMatch(new RegExp(`^/goi/${L.prefix}w/[a-z0-9-]+/$`));
      await next.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.getByRole("heading", { level: 1 })).not.toHaveText("関の山");
    });

    test("左右の矢印キーで隣の語に移れる", async ({ page }) => {
      await page.goto(`${L.prefix}w/seki-no-yama/`);
      const next = await page
        .getByRole("navigation", { name: L.adjacent })
        .getByRole("link", { name: L.next })
        .getAttribute("href");
      await page.keyboard.press("ArrowRight");
      await expect(page).toHaveURL(new RegExp(`${next}$`));
      await page.keyboard.press("ArrowLeft");
      await expect(page).toHaveURL(new RegExp(`/${L.prefix}w/seki-no-yama/$`));
    });

    test("検索で路線図の駅が絞り込まれる", async ({ page }) => {
      await page.goto(L.prefix || "./");
      const stations = page.locator(".c-station:visible");
      await expect(stations).toHaveCount(READY);

      const box = page.getByRole("searchbox", { name: L.search });
      await box.fill("セキノヤマ");
      await expect(stations).toHaveCount(1);
      await expect(stations.first()).toContainText("関の山");
      await expect(page.getByRole("status")).toHaveText(L.found);

      await box.fill("該当しない語");
      await expect(stations).toHaveCount(0);
      await expect(page.getByText(L.none, { exact: false })).toBeVisible();

      await box.fill("");
      await expect(stations).toHaveCount(READY);
    });

    test("英語の訳語やローマ字でも引ける", async ({ page }) => {
      test.skip(L.lang !== "en", "英語版だけの検索");
      await page.goto("./");
      const stations = page.locator(".c-station:visible");
      const box = page.getByRole("searchbox", { name: L.search });
      await box.fill("love is blind");
      await expect(stations).toHaveCount(1);
      await expect(stations.first()).toContainText("痘痕も靨");
      await box.fill("sekinoyama");
      await expect(stations).toHaveCount(1);
      await expect(stations.first()).toContainText("関の山");
    });

    test("もう一方の言語の同じページへ切り替えられる", async ({ page }) => {
      await page.goto(`${L.prefix}w/seki-no-yama/`);
      await page.getByRole("link", { name: L.switchTo }).click();
      const other = L.prefix ? "" : "ja/";
      await expect(page).toHaveURL(new RegExp(`/goi/${other}w/seki-no-yama/$`));
      const alternates = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((els) => els.map((e) => `${e.getAttribute("hreflang")} ${e.getAttribute("href")}`));
      expect(alternates).toEqual([
        "en https://0-draft.github.io/goi/w/seki-no-yama/",
        "ja https://0-draft.github.io/goi/ja/w/seki-no-yama/",
        "x-default https://0-draft.github.io/goi/w/seki-no-yama/",
      ]);
    });

    test("確認中の語は駅にならない", async ({ page }) => {
      await page.goto(L.prefix || "./");
      await expect(page.getByRole("link", { name: /いたい言葉/ })).toHaveCount(0);
      const res = await page.goto(`${L.prefix}w/itai-kotoba/`);
      expect(res?.status()).toBe(404);
    });

    for (const path of ["", "w/seki-no-yama/"]) {
      for (const colorScheme of ["light", "dark"] as const) {
        test(`${L.prefix}${path} (${colorScheme}) にアクセシビリティ違反がない`, async ({ page }) => {
          await page.emulateMedia({ colorScheme });
          await page.goto(`${L.prefix}${path}` || "./");
          const { violations } = await new AxeBuilder({ page }).analyze();
          expect(violations).toEqual([]);
        });
      }
    }
  });
}
