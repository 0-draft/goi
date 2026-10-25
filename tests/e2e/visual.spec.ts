import { expect, test } from "@playwright/test";

// 見た目の回帰テスト。CI と同じ Playwright の Docker イメージの中でだけ実行する
// (フォントの描画が OS ごとに違うため)。基準画像は visual-baseline ワークフローで作る (README 参照)

const pages = [
  { name: "top", path: "./" },
  { name: "a-index", path: "a/" },
  { name: "b-index", path: "b/" },
  { name: "c-index", path: "c/" },
  { name: "a-word", path: "a/w/hinoshita-kaisan/" },
  { name: "b-word", path: "b/w/hinoshita-kaisan/" },
  { name: "c-word", path: "c/w/hinoshita-kaisan/" },
];

test.beforeEach(async ({ page }) => {
  // Web フォントは Google Fonts からネットワーク越しに届き、版も届く時刻も一定しない。
  // 遮断してフォールバック書体 (イメージに入っている書体) で描かせる
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort());
});

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme, reducedMotion: "reduce" });

    for (const { name, path } of pages) {
      test(name, async ({ page }) => {
        await page.goto(path, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`${name}-${colorScheme}.png`, {
          fullPage: true,
          animations: "disabled",
          caret: "hide",
        });
      });
    }
  });
}
