import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Dashboard" });
    this.logoutBtn = page.getByRole("button", { name: "Logout" });
  }

  async isVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.heading).toBeVisible();
  }

  async getUserEmailText(): Promise<string | null> {
    return this.page.locator("nav span").textContent();
  }

  async logout(): Promise<void> {
    await this.logoutBtn.click();
  }
}
