import { BrowserContext, Page, expect } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("When user want to contribute", () => {
  let page: Page;

  test.beforeEach(async ({ context, login }) => {
    page = await context.newPage();
    await page.goto("");
    await login(page);
  });

  test("Should go to contribution page", async () => {
    await page.goto("/project/063FZRMJ1X6W12MG5SGRYHZ2P0");
    await page.waitForTimeout(2000);
    const contributeBtn = page.getByRole("button", { name: "Make a contribution" });
    expect(contributeBtn).toBeTruthy();
    await contributeBtn?.click();
    await expect(page).toHaveURL(/create\/contribution\//);
    await page.waitForTimeout(2000);
    await page.type("#contributionRepositoryID", "testRepo");
    await page.click("#description");
    await page.type("textarea", "testDescription");
    const submitBtn = await page.getByRole("button", { name: "Send contribution" });
    expect(submitBtn).toBeEnabled();
    Promise.all([await submitBtn?.click(), await expect(page).toHaveURL(/proposal/)]);
  });
});
