import { test, expect } from "@playwright/test";

test("Start and stop counting", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start counting" }).click();

  await expect(page.getByRole("button", { name: "Count is 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await expect(page.getByRole("button", { name: "Count is 2" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await expect(page.getByRole("button", { name: "Count is 3" })).toBeVisible();
  await expect(page.getByRole("button", { name: "fizz" })).toBeVisible();

  await expect(page.getByRole("button", { name: "Count is 4" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await expect(page.getByRole("button", { name: "Count is 5" })).toBeVisible();
  await expect(page.getByRole("button", { name: "buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Stop counting" }).click();
  await expect(page.getByRole("button", { name: "Count is 5" })).toBeVisible();
  await expect(page.getByRole("button", { name: "buzz" })).toBeVisible();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await expect(page.getByRole("button", { name: "Count is 5" })).toBeVisible();
  await expect(page.getByRole("button", { name: "buzz" })).toBeVisible();
});
