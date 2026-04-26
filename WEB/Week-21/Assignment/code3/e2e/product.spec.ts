import { test, expect } from "@playwright/test";

// These tests make REAL requests to dummyjson.com.
// They demonstrate the difference between mocked (home.spec.ts)
// and unmocked E2E tests. Run with network connectivity.
test.describe("Product Detail Page", () => {
  test("displays the product title and price for product 1", async ({
    page,
  }) => {
    await page.goto("/products/1");

    // Wait for the h1 to be visible — product loads asynchronously
    await expect(page.locator("h1")).toBeVisible();

    // A price in the format $XX or $XXX appears somewhere on the page
    await expect(page.getByText(/\$\d+/)).toBeVisible();
  });

  test("URL contains the correct product ID", async ({ page }) => {
    await page.goto("/products/3");
    await expect(page).toHaveURL(/\/products\/3/);
  });

  test("displays Back to products link", async ({ page }) => {
    await page.goto("/products/1");
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /back to products/i }),
    ).toBeVisible();
  });

  test("back link returns to the homepage", async ({ page }) => {
    await page.goto("/products/1");

    // Wait for product to finish loading
    await expect(page.locator("h1")).toBeVisible();

    await page.getByRole("link", { name: /back to products/i }).click();

    await expect(page).toHaveURL("/");
  });
});
