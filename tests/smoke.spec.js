const { test, expect } = require("@playwright/test");

test("главная и версия", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#appVersion")).toHaveText(/^0\.\d+\.\d+$/);
  await expect(page.locator(".home-action.primary")).toBeVisible();
});

test("тест: ответ и следующий вопрос", async ({ page }) => {
  await page.goto("/#/quiz/analytics");
  await expect(page.locator(".option")).toHaveCount(4);
  await page.locator(".option").first().click();
  await expect(page.locator("#next")).toBeVisible();
  await page.locator("#next").click();
  await expect(page.locator(".option")).toHaveCount(4);
});

test("тренажёр: ответ даёт вердикт", async ({ page }) => {
  await page.goto("/#/trainer/analytics");
  await expect(page.locator("#app h1")).toContainText("Аналитика");
  if (await page.locator(".option[data-k]").count()) {
    await page.locator(".option[data-k]").first().click();
  } else {
    await page.locator("#ans").fill("1");
    await page.locator("#check").click();
  }
  await expect(page.locator(".verdict")).toBeVisible();
});

test("30 минут: шаг отмечается и сбрасывается", async ({ page }) => {
  await page.goto("/#/session");
  const step = page.locator('[data-session-step="theory"]');
  await step.check();
  await expect(step).toBeChecked();
  await page.locator("#sessionReset").click();
  await expect(step).not.toBeChecked();
  await expect(page.locator("#sessionClock")).toHaveText("30:00");
});

test("таймер 30 минут переживает переход", async ({ page }) => {
  await page.goto("/#/session");
  await page.locator("#sessionStart").click();
  await page.waitForTimeout(1100);
  await page.evaluate(() => { location.hash = "#/theory/analytics/0"; });
  await expect(page.locator("#sessionDock")).toBeVisible();
});

test("Pyodide: pandas-кейс загружает CSV", async ({ page }) => {
  test.setTimeout(240000);
  await page.goto("/#/pandas-lab");
  await page.locator("#nbStart").click();
  await expect(page.locator("#nbStatus")).toContainText("Python готов", { timeout: 180000 });
  await page.locator('button[data-run="0"]').click();
  await expect(page.locator('[data-out="0"]')).toContainText("(3000, 6)", { timeout: 60000 });
});

test("ключевые страницы открываются", async ({ page }) => {
  const routes = ["/#/", "/#/theory/analytics/0", "/#/theory/ai", "/#/theory/marketing", "/#/theory/simulation", "/#/marketing-project", "/#/demos/aicost", "/#/demos/montecarlo", "/#/demos/queue", "/#/glossary", "/#/session", "/#/project", "/#/dbt-project", "/#/achievements", "/#/cases", "/#/prompt-lab", "/#/calc", "/#/cards", "/#/progress", "/#/cheatsheet"];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("#app h1").first()).toBeVisible();
  }
});
