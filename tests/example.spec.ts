import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/effin-redux/);
});

test("start counting button", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start counting" }).click();
});
