import { defineConfig, devices } from "@playwright/test";

const port = 4391;

// 見た目の回帰テストは描画環境に依存するので、GOI_VISUAL=1 のとき (CI と同じ Docker イメージの中) だけ走らせる。
// ふだんの `playwright test` は機能テストだけを実行する
const visual = process.env.GOI_VISUAL === "1";
const visualSpec = /visual\.spec\.ts$/;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}/goi/`,
    trace: "retain-on-failure",
  },
  projects: visual
    ? [
        { name: "visual-desktop", testMatch: visualSpec, use: { ...devices["Desktop Chrome"] } },
        { name: "visual-mobile", testMatch: visualSpec, use: { ...devices["Pixel 7"] } },
      ]
    : [
        { name: "desktop", testIgnore: visualSpec, use: { ...devices["Desktop Chrome"] } },
        { name: "mobile", testIgnore: visualSpec, use: { ...devices["Pixel 7"] } },
      ],
  // ビルド済みの dist を配信して検証する
  webServer: {
    command: `pnpm exec astro preview --ignore-lock --port ${port}`,
    url: `http://localhost:${port}/goi/`,
    reuseExistingServer: !process.env.CI,
  },
});
