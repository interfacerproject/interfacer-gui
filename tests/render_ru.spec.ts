import { Page, expect, test } from "@playwright/test";
import { login } from "./utils";

test.describe("when user is logged in", () => {
  let page: Page;

  test.beforeEach(async ({ context }) => {
    page = await context.newPage();
    await page.goto("");
    await login(page);
  });

  //   test.afterEach(async ({ page }) => {
  //     await page.goto("");
  //     await page.click("#logout");
  //   });

  test("Should see /resources", async ({ page }) => {
    await page.goto("/resources");
    expect(page.getByRole("heading", { name: "Resources" }));
  });

  test("Should see /project/:id", async ({ page }) => {
    await page.goto(`/project/${process.env.PROJECT_ID}`);
    await expect(page.getByRole("heading", { name: "Project" })).toBeVisible();
  });

  test.skip("Should render html in /project/:id", async ({ page }) => {
    await page.goto(`/project/${process.env.PROJECT_ID}`);
    await expect(page).toHaveText("strong", "bold");
    await expect(page).toHaveText("em", "italics");
    await expect(page).toHaveText("ins", "subbed");
  });

  test("Should see /profile/my_profile", async ({ page }) => {
    await page.goto(`/profile/${process.env.AUTHID}`);
    await expect(page.getByText(process.env.AUTHNAME!)).toBeTruthy();
  });

  test("Should see /resource/:id", async ({ page }) => {
    await page.goto(`/resource/${process.env.RESOURCE_ID}`);
    await page.waitForTimeout(2000);
    await expect(page.getByText(process.env.RESOURCE_ID!)).toBeVisible();
  });

  test("Should see /projects", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByText("Latest projects")).toBeVisible();
    await expect(page.getByRole("link", { name: "Create a new project" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Report a bug" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Filter by" })).toBeTruthy();
  });
});
