import { test, expect } from "@playwright/test";

test("Initial app state", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Count is 0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await expect(page.getByRole("button", { name: "Start counting" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Stop counting" })).toBeDisabled();

  await expect(page.getByRole("button", { name: "Increase" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Reset" })).toBeDisabled();

  await expect(page.getByRole("button", { name: "Request external number" })).toBeEnabled();

  expect(await page.locator("input[type='number']").inputValue()).toBe("0");
  await expect(page.getByRole("button", { name: "Request this number" })).toBeDisabled();
});
