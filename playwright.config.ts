import { defineConfig, devices } from "@playwright/test";

const port = 4391;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}/goi/`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // ビルド済みの dist を配信して検証する
  webServer: {
    command: `pnpm exec astro preview --ignore-lock --port ${port}`,
    url: `http://localhost:${port}/goi/`,
    reuseExistingServer: !process.env.CI,
  },
});
