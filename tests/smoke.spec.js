const { test, expect } = require("@playwright/test");

test("главная и версия", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#appVersion")).toHaveText(/^0\.7\.\d+$/);
  await expect(page.locator(".home-action.primary")).toBeVisible();
});

test("тест: варианты и переход дальше", async ({ page }) => {
  await page.goto("/#/quiz/analytics");
  await expect(page.locator(".option")).toHaveCount(4);
  await page.locator(".option").first().click();
  await expect(page.locator("#next")).toBeVisible();
});

test("тренажёр: задача отображается", async ({ page }) => {
  await page.goto("/#/trainer/analytics");
  await expect(page.locator("#app h1")).toContainText("Аналитика");
  await expect(page.locator("#check, .option[data-k]")).toBeVisible();
});

test("таймер 30 минут переживает переход", async ({ page }) => {
  await page.goto("/#/session");
  await page.locator("#sessionStart").click();
  await page.waitForTimeout(1100);
  await page.evaluate(() => { location.hash = "#/theory/analytics/0"; });
  await expect(page.locator("#sessionDock")).toBeVisible();
});
