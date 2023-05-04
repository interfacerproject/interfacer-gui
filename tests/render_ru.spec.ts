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
    // await expect(page.getByRole("link", { name: "Report a bug" })).toBeVisible();
    expect(page.getByRole("button", { name: "Filter by" })).toBeTruthy();
  });

  test("Should see every link", async ({ page }) => {
    test.setTimeout(600000);
    page.goto("");
    await page.waitForTimeout(1000);
    console.log("start url", page.url());
    console.log("Checking links");
    const checkLinks = async (page: Page) => {
      const seenURLs = new Set();
      const crawl = async (url: string) => {
        if (seenURLs.has(url)) {
          return;
        }
        if (!url.startsWith("http://localhost")) {
          return;
        }
        if (seenURLs.size > 100) {
          return;
        }
        seenURLs.add(url);
        console.log(`Visiting ${url}`);
        await page.goto(url);
        await page.waitForTimeout(1000);
        expect(page.url()).not.toContain("404");
        const urls = await page.$$eval("a", elements =>
          elements.filter(el => !el.innerHTML.includes("Go to source")).map(el => el.href)
        );
        console.log(`Found ${urls.length}`);
        for await (const u of urls) {
          await crawl(u);
        }
      };
      await crawl(page.url());
      console.log(`Checked ${seenURLs.size} URLs`);
      return seenURLs.size;
    };
    const pp = await checkLinks(page);
    expect(pp).toBeGreaterThan(100);
  });
});
