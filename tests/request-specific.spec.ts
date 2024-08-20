import { test, expect } from "@playwright/test";

test("Request external number", async ({ page }) => {
  await page.goto("/");

  await page.locator("input").fill("30");
  await page.getByRole("button", { name: "Request this number" }).click();

  await expect(page.getByRole("button", { name: "Count is 30" })).toBeVisible();
  await expect(page.getByRole("button", { name: "fizzbuzz" })).toBeVisible();
});
