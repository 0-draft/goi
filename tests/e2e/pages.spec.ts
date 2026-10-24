import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("トップから語のページに移動できる", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: "関の山" }).click();
  await expect(page).toHaveURL(/\/goi\/w\/seki-no-yama\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("関の山");
});

test("確認中の語はページを作らない", async ({ page }) => {
  const res = await page.goto("w/itai-kotoba/");
  expect(res?.status()).toBe(404);
});

for (const path of ["./", "w/seki-no-yama/"]) {
  test(`${path} にアクセシビリティ違反がない`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations).toEqual([]);
  });
}
