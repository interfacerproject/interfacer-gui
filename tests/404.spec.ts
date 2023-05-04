import { expect, test } from "@playwright/test";
import { matchers } from "expect-playwright";
import { login, randomString } from "./utils";

expect.extend(matchers);

test.describe("should display 404 page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("");
    await login(page);
  });

  test("should display 404 page", async ({ page }) => {
    const randomUrl = `/${randomString(10)}`;
    const response = await page.goto(randomUrl, { timeout: 0, waitUntil: "networkidle" });
    const status = response!.status();
    expect(status).toEqual(404);
    await page.goto(randomUrl, { timeout: 0, waitUntil: "networkidle" });
    await expect(page).toHaveSelector("#error404");
    await expect(page).toHaveText("404");
    const img = await page.$('[alt="404"]');
    const imgg = await img?.boundingBox();
    expect(imgg?.width).toBeGreaterThan(300);
  });
});
