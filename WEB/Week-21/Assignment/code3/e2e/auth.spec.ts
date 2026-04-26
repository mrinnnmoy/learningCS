import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

// Mock the products API for all tests in this file so the
// homepage does not make real network calls during auth tests.
const mockProductsRoute = async (
  page: import("@playwright/test").Page,
): Promise<void> => {
  await page.route("**/dummyjson.com/products*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ products: [], total: 0 }),
    }),
  );
};

test.describe("Authentication", () => {
  test("user can log in with valid credentials and is redirected to /dashboard", async ({
    page,
  }) => {
    await mockProductsRoute(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login("alice@example.com", "anypassword");
    await dashboardPage.isVisible();
  });

  test("navbar shows the user email after login", async ({ page }) => {
    await mockProductsRoute(page);
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("alice@example.com", "anypassword");

    await expect(page).toHaveURL(/\/dashboard/);

    // The email is displayed as a span inside the navbar
    await expect(page.getByText("alice@example.com")).toBeVisible();
  });

  test("shows an error when the form is submitted with both fields empty", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    // Click submit without filling any fields
    await loginPage.submitButton.click();

    await loginPage.expectError("Both fields are required");
    await loginPage.expectToBeOnLoginPage();
  });

  test("shows an error when only the email field is filled", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.emailInput.fill("alice@example.com");
    // Leave password empty and submit
    await loginPage.submitButton.click();

    await loginPage.expectError("Both fields are required");
    await loginPage.expectToBeOnLoginPage();
  });

  test("shows an error when only the password field is filled", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.passwordInput.fill("somepassword");
    // Leave email empty and submit
    await loginPage.submitButton.click();

    await loginPage.expectError("Both fields are required");
    await loginPage.expectToBeOnLoginPage();
  });

  test("redirects unauthenticated users from /dashboard to /login", async ({
    page,
  }) => {
    // Attempt to access the protected dashboard without logging in
    await page.goto("/dashboard");

    // ProtectedRoute should redirect immediately to /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("user can log out and is returned to /login", async ({ page }) => {
    await mockProductsRoute(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Log in first
    await loginPage.goto();
    await loginPage.login("alice@example.com", "anypassword");
    await dashboardPage.isVisible();

    // Log out
    await dashboardPage.logout();

    // Should be back on the login page with the sign-in button visible
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("visiting /dashboard after logout redirects back to /login", async ({
    page,
  }) => {
    await mockProductsRoute(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Log in, then log out
    await loginPage.goto();
    await loginPage.login("alice@example.com", "anypassword");
    await dashboardPage.isVisible();
    await dashboardPage.logout();

    // Now try to navigate directly to the protected route
    await page.goto("/dashboard");

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });
});
