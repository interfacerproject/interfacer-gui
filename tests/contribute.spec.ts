import { Page, expect } from "@playwright/test";
import { test } from "./fixtures/test";
import { searchMenuAdd } from "./utils/forms";

test.describe.skip("When user want to contribute", () => {
  test.describe.configure({ timeout: 60000, retries: 3 });
  let page: Page;

  test.beforeEach(async ({ context, login }) => {
    page = await context.newPage();
    await page.goto("");
    await login(page);
  });

  test("Should go to contribution page", async ({ envVariables }) => {
    await page.goto(`/project/${envVariables.PROJECT_ID}`);
    await page.waitForLoadState();
    const contributeBtn = page.getByRole("button", { name: "Make a contribution" });
    expect(contributeBtn).toBeTruthy();
    await contributeBtn?.click();
    await expect(page).toHaveURL(/propose_contribution/);
    await page.waitForLoadState("networkidle");
    await page.type("#name", "test contribution proposal");
    await searchMenuAdd(page, "#search-project", "c");
    await page.click("#description");
    await page.type("textarea", "testDescription");
    await page.locator("textarea").evaluate(e => e.blur());
    const submitBtn = page.getByRole("button", { name: "Propose contribution" });
    expect(submitBtn).toBeEnabled();
    Promise.all([await submitBtn.click(), await page.waitForURL("**/proposal/**")]);
  });
});
