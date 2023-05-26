import { expect } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("When user visit the profile page", () => {
  let page;

  test.beforeEach(async ({ context, login }) => {
    page = await context.newPage();
    await page.goto("");
    await login(page);
  });

  test("The profile page should work", async ({ page }) => {
    const authId = "0634YMEGWHNGCVVBKETRXJQCWM"; //process.env.auth_id
    await page.goto(`/profile/${authId}`);
    expect(page.getByText(authId)).toBeTruthy();
    expect(page.getByRole("heading", { name: "My projects" })).toBeTruthy();
    expect(page.getByRole("button", { name: "DID Explorer" })).toBeTruthy();
  });

  test("The profile page should render slightly differently for other user", async ({ page }) => {
    const otherUserId = "0634YN1WS21RMWRYTS8N2XGNAW"; //process.env.other_user_id
    await page.goto(`/profile/${otherUserId}`);
    expect(page.getByText(otherUserId)).toBeTruthy();
    expect(page.getByRole("heading", { name: "Projects" })).toBeTruthy();
    await expect(page.locator("text=My List")).toBeHidden();
  });

  test("Click to DID Explorer button should redirect to the explorer", async ({ page }) => {
    const authId = "0634YMEGWHNGCVVBKETRXJQCWM"; //process.env.auth_id
    await page.goto(`/profile/${authId}`);
    await page.getByRole("button", { name: "DID Explorer" }).click();
    await expect(page.url()).toContain("https://explorer.did.dyne.org/");
  });
});
