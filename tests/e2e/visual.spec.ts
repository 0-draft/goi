import { expect, test } from "@playwright/test";

// 見た目の回帰テスト。CI と同じ Playwright の Docker イメージの中でだけ実行する
// (フォントの描画が OS ごとに違うため)。基準画像は visual-baseline ワークフローで作る (README 参照)

const pages = [
  { name: "top", path: "./" },
  { name: "word", path: "w/hinoshita-kaisan/" },
  { name: "ja-top", path: "ja/" },
  { name: "ja-word", path: "ja/w/hinoshita-kaisan/" },
  { name: "word-long", path: "w/uriie-to-karayou-de-kaku-sandaime/" },
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
        // fullPage で撮ると撮影中のリサイズで駅名標の横スクロールが先頭に戻るので、
        // 先にビューポートをページの高さまで伸ばしてから表示範囲を撮る
        const width = page.viewportSize()?.width ?? 1280;
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.setViewportSize({ width, height });
        await expect(page).toHaveScreenshot(`${name}-${colorScheme}.png`, {
          animations: "disabled",
          caret: "hide",
        });
      });
    }
  });
}
