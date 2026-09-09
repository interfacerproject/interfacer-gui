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

  test("Should see /search", async ({ page }) => {
    await page.goto("/search?q=test");
    // New search surface: dark header with the query as the H1.
    await expect(page.getByRole("heading", { level: 1, name: /Results for/i })).toBeVisible();
    // The toolbar renders in every result state, including "nothing found",
    // so this does not depend on the fixture data matching anything.
    await expect(page.getByRole("button", { name: /Filters/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("Should keep the search shell on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/search");

    await expect(page.getByRole("heading", { name: /Search the platform/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("Should see /search with no query", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("heading", { name: /Search the platform/i })).toBeVisible();
  });

  test("Should see /profile/:id", async ({ page }) => {
    await page.goto(`/profile/${process.env.AUTHID}`);
    await expect(page.getByText(process.env.AUTHNAME!)).toBeTruthy();
  });
});
