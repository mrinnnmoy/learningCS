import { test, expect } from "@playwright/test";

const MOCK_PRODUCTS = [
  {
    id: 1,
    title: "Mock Laptop",
    price: 999,
    thumbnail: "https://via.placeholder.com/150",
    category: "electronics",
    rating: 4.5,
    description: "A great laptop.",
  },
  {
    id: 2,
    title: "Mock Phone",
    price: 599,
    thumbnail: "https://via.placeholder.com/150",
    category: "electronics",
    rating: 4.2,
    description: "A great phone.",
  },
  {
    id: 3,
    title: "Mock Watch",
    price: 199,
    thumbnail: "https://via.placeholder.com/150",
    category: "accessories",
    rating: 4.0,
    description: "A great watch.",
  },
];

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the dummyjson products API and return mock data.
    // This prevents real network requests and makes tests fast and deterministic.
    await page.route("**/dummyjson.com/products*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ products: MOCK_PRODUCTS, total: 3 }),
      }),
    );

    await page.goto("/");
  });

  test("displays the Products heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  });

  test("renders a card for each mocked product", async ({ page }) => {
    await expect(page.getByText("Mock Laptop")).toBeVisible();
    await expect(page.getByText("Mock Phone")).toBeVisible();
    await expect(page.getByText("Mock Watch")).toBeVisible();
  });

  test("renders the price for each product", async ({ page }) => {
    await expect(page.getByText("$999")).toBeVisible();
    await expect(page.getByText("$599")).toBeVisible();
    await expect(page.getByText("$199")).toBeVisible();
  });

  test("clicking a product card navigates to the detail page", async ({
    page,
  }) => {
    // Also mock the individual product endpoint before clicking
    await page.route("**/dummyjson.com/products/1", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PRODUCTS[0]),
      }),
    );

    await page.getByText("Mock Laptop").click();

    await expect(page).toHaveURL(/\/products\/1/);
  });

  test("the navbar contains links to Home and Dashboard", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });
});
