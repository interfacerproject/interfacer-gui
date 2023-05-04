import { Page, expect, test } from "@playwright/test";

test.describe("When user is not logged in", () => {
  let page: Page;
  test.beforeEach(async ({ context }) => {
    page = await context.newPage();
  });
  test("Should see /", async ({ page }) => {
    await page.goto("");
    await expect(page.getByRole("heading", { name: "Empowering the Open Source Hardware Community" })).toBeVisible();
    expect(page.getByRole("button", { name: "Log In" })).toBeTruthy();
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("Should see /sign_in", async ({ page }) => {
    await page.goto("/sign_in");
    await expect(page.getByText("Login")).toBeTruthy();
  });

  test("Should see /sign_up", async ({ page }) => {
    await page.goto("/sign_up");
    await expect(page.getByText("Sign up")).toBeVisible();
  });
});
