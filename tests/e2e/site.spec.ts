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
    found: "1 word found",
    none: "Nothing matches",
    quiz: "Which meaning is right?",
    skip: "Just show me",
    meaning: "Meaning",
    switchTo: "日本語",
  },
  {
    lang: "ja",
    prefix: "ja/",
    adjacent: "となりの語",
    next: /次の語/,
    search: "語を探す",
    found: "1語が見つかりました",
    none: "合う語がありません",
    quiz: "どちらの意味？",
    skip: "答えを見る",
    meaning: "意味",
    switchTo: "English",
  },
] as const;

for (const L of LANGS) {
  test.describe(`語のページと索引 (${L.lang})`, () => {
    test("索引から語のページに移動できる", async ({ page }) => {
      await page.goto(L.prefix || "./");
      await expect(page.locator("html")).toHaveAttribute("lang", L.lang);
      await page.locator(".row").filter({ hasText: "関の山" }).getByRole("link").click();
      await expect(page).toHaveURL(new RegExp(`/goi/${L.prefix}w/seki-no-yama/$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("関の山");
      await expect(page.getByText("Seki no yama", { exact: true }).first()).toBeVisible();
    });

    test("次の語をたどって隣の語に移れる", async ({ page }) => {
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

    test("検索で索引の語が絞り込まれる", async ({ page }) => {
      await page.goto(L.prefix || "./");
      const rows = page.locator(".row:visible");
      await expect(rows).toHaveCount(READY);

      const box = page.getByRole("searchbox", { name: L.search });
      await box.fill("セキノヤマ");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("関の山");
      await expect(page.getByRole("status")).toHaveText(L.found);

      await box.fill("該当しない語");
      await expect(rows).toHaveCount(0);
      await expect(page.getByText(L.none, { exact: false })).toBeVisible();

      await box.fill("");
      await expect(rows).toHaveCount(READY);
    });

    test("英語の訳語やローマ字でも引ける", async ({ page }) => {
      test.skip(L.lang !== "en", "英語版だけの検索");
      await page.goto("./");
      const rows = page.locator(".row:visible");
      const box = page.getByRole("searchbox", { name: L.search });
      await box.fill("love is blind");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("痘痕も靨");
      await box.fill("sekinoyama");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toContainText("関の山");
    });

    test("意味は二択に答えるまで伏せ、答えると開く", async ({ page }) => {
      await page.goto(`${L.prefix}w/seki-no-yama/`);
      await expect(page.getByRole("heading", { name: L.quiz })).toBeVisible();
      const meaning = page.locator("#meaning-h");
      await expect(meaning).toBeHidden();
      await page.locator(".quiz__opt[data-correct]").click();
      await expect(meaning).toBeVisible();
      await expect(page.locator(".quiz__opt[data-correct]")).toHaveClass(/is-correct/);
      // 答えは覚えておき、次に開いたときは最初から開いておく
      await page.reload();
      await expect(meaning).toBeVisible();
    });

    test("「答えを見る」で二択を飛ばせる", async ({ page }) => {
      await page.goto(`${L.prefix}w/seki-no-yama/`);
      await page.getByRole("button", { name: L.skip }).click();
      await expect(page.locator("#meaning-h")).toBeVisible();
    });

    test("世論調査のある語は、答えたあとに回答の割合を出す", async ({ page }) => {
      await page.goto(`${L.prefix}w/kosoku/`);
      const poll = page.locator("[data-poll]");
      await expect(poll).toBeHidden();
      await page.locator(".quiz__opt:not([data-correct])").click();
      await expect(poll).toBeVisible();
      await expect(poll).toContainText("73.9%");
      await expect(poll).toContainText("17.4%");
    });

    test("由来で索引を絞り込み、URL に残す", async ({ page }) => {
      await page.goto(L.prefix || "./");
      const rows = page.locator(".row:visible");
      await page.locator('[data-filter="sumo"]').click();
      await expect(page).toHaveURL(/\?t=sumo$/);
      await expect(rows).toHaveCount(4);
      await expect(page.locator(".row:visible").filter({ hasText: "勇み足" })).toHaveCount(1);
      await page.reload();
      await expect(rows).toHaveCount(4);
      await page.locator('[data-filter=""]').click();
      await expect(rows).toHaveCount(READY);
    });

    test("でたらめに一語で別の語のページへ移る", async ({ page }) => {
      await page.goto(`${L.prefix}w/seki-no-yama/`);
      await page.locator("[data-random]").click();
      await expect(page).toHaveURL(new RegExp(`/goi/${L.prefix}w/(?!seki-no-yama/)[a-z0-9-]+/$`));
    });

    test("もう一方の言語の同じページへ切り替えられる", async ({ page }) => {
      await page.goto(`${L.prefix}w/seki-no-yama/`);
      await page.getByRole("link", { name: L.switchTo }).click();
      const other = L.prefix ? "" : "ja/";
      await expect(page).toHaveURL(new RegExp(`/goi/${other}w/seki-no-yama/$`));
      // ビュー遷移が終わる前に head を読むと待ち続けることがあるので、読み込みの完了を待つ
      await page.waitForLoadState("load");
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
