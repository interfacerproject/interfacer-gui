import { expect } from "@playwright/test";
import { EnvVariables, test } from "./fixtures/test";

test.describe("When user is not logged in", () => {
  test("Should see /", async ({ page }) => {
    await page.goto("");
    // Hero headline, from the Figma-matched homepage (see HomeHero.tsx).
    await expect(page.getByRole("heading", { name: /Open hardware/i, level: 1 })).toBeVisible();
    // Both CTAs render as links (next/link), not buttons.
    await expect(page.getByRole("link", { name: "Explore Designs" })).toBeVisible();
    // "Join Interfacer — free" also appears further down, in the open-source
    // CTA section, so scope to the hero's one.
    await expect(page.getByRole("link", { name: "Join Interfacer — free" }).first()).toBeVisible();
  });

  test("Should see /sign_in", async ({ page }) => {
    await page.goto("/sign_in");
    expect(page.getByText("Login")).toBeTruthy();
  });

  test("Should see /sign_up", async ({ page }) => {
    await page.goto("/sign_up");
    await expect(page.getByText("Sign up")).toBeTruthy();
  });

  test("Should see /project/:id", async ({ page, envVariables }) => {
    await page.goto(`/project/${envVariables.PROJECT_ID}`);
    await expect(page.getByText("Project")).toBeTruthy();
  });

  test.skip("Should see /resource/:id", async ({ page, envVariables }) => {
    await page.goto(`/resource/${envVariables.RESOURCE_ID}`);
    await expect(page.getByText(envVariables.RESOURCE_ID!)).toBeVisible();
  });

  test("Should see /resources", async ({ page }) => {
    await page.goto("/resources");
    await expect(page.getByText("Resources")).toBeTruthy();
  });
});
