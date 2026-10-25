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
