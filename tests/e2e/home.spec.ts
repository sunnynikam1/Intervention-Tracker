import { expect, test } from "@playwright/test";

test("homepage renders tracker and auth section", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Learner Intervention Tracker" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Authentication" })).toBeVisible();
  await expect(page.getByLabel("Learner name")).toBeVisible();
});
