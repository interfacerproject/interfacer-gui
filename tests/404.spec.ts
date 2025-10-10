import { expect } from "@playwright/test";
import { test } from "./fixtures/test";
import { matchers } from "expect-playwright";

expect.extend(matchers);

test.describe.skip("should display 404 page", () => {
  test.beforeEach(async ({ page, login }) => {
    await page.goto("");
    await login(page);
  });

  test.skip("should display 404 page", async ({ page, random }) => {
    const randomUrl = `/${random.randomString(10)}`;
    const response = await page.goto(randomUrl, { timeout: 0, waitUntil: "networkidle" });
    const status = response!.status();
    expect(status).toEqual(404);
    await page.goto(randomUrl, { timeout: 0, waitUntil: "networkidle" });
    await expect(page).toHaveSelector("#error404");
    // await expect(page).toHaveText("404");
    const img = await page.$('[alt="404"]');
    const imgg = await img?.boundingBox();
    expect(imgg?.width).toBeGreaterThan(300);
  });
});
