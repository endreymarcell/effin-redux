import { test, expect } from "@playwright/test";

test("Manual increase and reset", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 2" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 3" })).toBeVisible();
  await expect(page.getByRole("button", { name: "fizz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 4" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 5" })).toBeVisible();
  await expect(page.getByRole("button", { name: "buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 6" })).toBeVisible();
  await expect(page.getByRole("button", { name: "fizz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 7" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 8" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 9" })).toBeVisible();
  await expect(page.getByRole("button", { name: "fizz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 10" })).toBeVisible();
  await expect(page.getByRole("button", { name: "buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 11" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 12" })).toBeVisible();
  await expect(page.getByRole("button", { name: "fizz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 13" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 14" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 15" })).toBeVisible();
  await expect(page.getByRole("button", { name: "fizzbuzz" })).toBeVisible();

  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("button", { name: "Count is 16" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("button", { name: "Count is 0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "neither fizz nor buzz" })).toBeVisible();
});
