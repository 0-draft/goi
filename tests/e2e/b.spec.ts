import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("B 注の網", () => {
  test("一覧から語のページに移動できる", async ({ page }) => {
    await page.goto("b/");
    await page.getByRole("link", { name: "関の山" }).click();
    await expect(page).toHaveURL(/\/goi\/b\/w\/seki-no-yama\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("関の山");
  });

  test("検索で一覧が絞り込まれる", async ({ page }) => {
    await page.goto("b/");
    const items = page.locator("#b-words > li:visible");
    await expect(items).toHaveCount(5);
    await page.getByLabel("語を探す").fill("セキ");
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText("関の山");
    await expect(page.locator("#b-status")).toHaveText("「セキ」に合う語は1語。");
    await page.getByLabel("語を探す").fill("ぜんぜんない");
    await expect(items).toHaveCount(0);
    await page.getByLabel("語を探す").fill("");
    await expect(items).toHaveCount(5);
  });

  test("見出しだけに畳むと意味が隠れる", async ({ page }) => {
    await page.goto("b/");
    const gloss = page.locator(".words-gloss").first();
    await expect(gloss).toBeVisible();
    await page.getByLabel("見出しだけ").check();
    await expect(gloss).toBeHidden();
  });

  test("由来の注が開く（狭い画面はポップオーバー、広い画面は傍注）", async ({ page }) => {
    await page.goto("b/w/seki-no-yama/");
    const note = page.locator("#n-origin");
    const ref = page.getByRole("button", { name: "由来" });
    if (await ref.isVisible()) {
      await expect(note).toBeHidden();
      await ref.focus();
      await page.keyboard.press("Enter");
      await expect(note).toBeVisible();
      await expect(note).toContainText("関宿");
      await page.keyboard.press("Escape");
      await expect(note).toBeHidden();
    } else {
      await expect(note).toBeVisible();
      await expect(note).toContainText("関宿");
    }
  });

  test("語へのリンクにフォーカスするとプレビューが出る", async ({ page }) => {
    await page.goto("b/w/seki-no-yama/");
    const next = page.getByRole("link", { name: /次の語/ });
    const id = (await next.getAttribute("data-preview")) ?? "";
    await next.focus();
    const preview = page.locator(`#${id}`);
    await expect(preview).toBeVisible();
    await expect(next).toHaveAttribute("aria-describedby", id);
    await page.keyboard.press("Escape");
    await expect(preview).toBeHidden();
  });

  test("確認中の語はページを作らない", async ({ page }) => {
    const res = await page.goto("b/w/itai-kotoba/");
    expect(res?.status()).toBe(404);
  });

  for (const path of ["b/", "b/w/seki-no-yama/"]) {
    test(`${path} にアクセシビリティ違反がない`, async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations).toEqual([]);
    });
  }

  test("ダークモードでもアクセシビリティ違反がない", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    for (const path of ["b/", "b/w/hare-to-ke/"]) {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations).toEqual([]);
    }
  });
});
