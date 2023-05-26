import { expect } from "@playwright/test";
import { EnvVariables, test } from "./fixtures/test";

test.describe("When user is not logged in", () => {
  test("Should see /", async ({ page }) => {
    await page.goto("");
    await expect(page.getByRole("heading", { name: "Empowering the Open Source Hardware Community" })).toBeVisible();
    expect(page.getByRole("button", { name: "Log In" })).toBeTruthy();
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("Should see /sign_in", async ({ page }) => {
    await page.goto("/sign_in");
    expect(page.getByText("Login")).toBeTruthy();
  });

  test("Should see /sign_up", async ({ page }) => {
    await page.goto("/sign_up");
    await expect(page.getByText("Sign up")).toBeVisible();
  });

  test("Should see /project/:id", async ({ page, envVariables }) => {
    await page.goto(`/project/${envVariables.PROJECT_ID}`);
    await expect(page.getByText("Project")).toBeTruthy();
  });

  test("Should see /resource/:id", async ({ page, envVariables }) => {
    await page.goto(`/resource/${envVariables.RESOURCE_ID}`);
    await expect(page.getByText(envVariables.RESOURCE_ID)).toBeVisible();
  });

  test("Should see /resources", async ({ page }) => {
    await page.goto("/resources");
    await expect(page.getByText("Resources")).toBeTruthy();
  });
});
