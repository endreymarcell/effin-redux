import { test, expect } from "@playwright/test";

test("Request external number", async ({ page }) => {
  await page.goto("/");

  const testId = 30;
  await page.route("https://random-data-api.com/api/v2/users", async (route) =>
    route.fulfill({ json: { id: testId } }),
  );

  await page.getByRole("button", { name: "Request external number" }).click();
  await expect(page.getByRole("button", { name: `Count is ${testId}` })).toBeVisible();
  await expect(page.getByRole("button", { name: "fizzbuzz" })).toBeVisible();
});
