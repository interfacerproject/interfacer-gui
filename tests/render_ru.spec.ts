import { Page, expect } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("when user is logged in", () => {
  test.describe.configure({ retries: 2 });
  let page: Page;

  test.beforeEach(async ({ context, login }) => {
    page = await context.newPage();
    await page.goto("");
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test("Should see /resources", async ({ page }) => {
    await page.goto("/resources");
    expect(page.getByRole("heading", { name: "Resources" }));
  });

  test.skip("Should see /project/:id", async ({ page }) => {
    await page.goto(`/project/${process.env.PROJECT_ID}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Project" })).toBeVisible();
  });

  test("Should see /profile/my_profile", async ({ page }) => {
    await page.goto(`/profile/${process.env.AUTHID}`);
    await expect(page.getByText(process.env.AUTHNAME!)).toBeTruthy();
  });

  test.skip("Should see /resource/:id", async ({ page }) => {
    await page.goto(`/resource/${process.env.RESOURCE_ID}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(process.env.RESOURCE_ID!)).toBeVisible();
  });

  test.skip("Should see /projects", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByText("Latest projects")).toBeVisible();
    await expect(page.getByRole("link", { name: "Create a new project" })).toBeVisible();
    // await expect(page.getByRole("link", { name: "Report a bug" })).toBeVisible();
    expect(page.getByRole("button", { name: "Filter by" })).toBeTruthy();
  });

  test.skip("Should see /scan", async ({ page }) => {
    await page.goto("/scan");
    await expect(page.getByRole("heading", { name: "Scan your QR code" })).toBeVisible();
  });

  test.skip("Should see every link", async ({ page, envVariables }) => {
    test.setTimeout(600000);
    page.goto("");
    await page.waitForLoadState("domcontentloaded");
    console.log("start url", page.url());
    console.log("Checking links");
    const checkLinks = async (page: Page) => {
      const seenURLs = new Set();
      let notFounded = 0;
      type CrawlProps = { url: string; fromUrl: string; text: string };
      const crawl = async (props: CrawlProps) => {
        const { url, fromUrl, text } = props;
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
        await page.waitForLoadState("domcontentloaded");

        // No link to 404 page
        // expect.soft(page.url(), `for url ${url}, found in ${fromUrl} for ${text}`).not.toContain("404")

        // no more than a limit of 404 set in .env
        if (page.url().includes("404")) {
          notFounded++;
        }
        expect
          .soft(notFounded, `for url ${url}, found in ${fromUrl} for ${text}`)
          .not.toBeGreaterThan(Number(envVariables.NOT_FOUND_LIMIT));

        // Every page has a sidebarvscode-file://vscode-app/Applications/Visual%20Studio%20Code.apvscode-file://vscode-app/Applications/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-sandbox/workbench/workbench.htmlp/Contents/Resources/app/out/vs/code/electron-sandbox/workbench/workbench.html
        expect(page.locator("#sidebarOpener"), `for url ${url}, found in ${fromUrl}`).toBeVisible();
        //TODO: add more checks?

        const urls = await page.$$eval("a", elements =>
          elements
            .filter(el => !el.innerHTML.includes("External data"))
            .map(el => ({ url: el.href, fromUrl: window.location.href, text: el.innerHTML }))
        );
        expect(urls.length, `for url ${url}`).toBeGreaterThan(0);
        console.log(`Found ${urls.length}`);
        for await (const u of urls) {
          await crawl(u);
        }
      };
      await crawl({ url: page.url(), fromUrl: "first", text: "first" });
      console.log(`Checked ${seenURLs.size} URLs`);
      console.log(`Not found ${notFounded} times`);
      return seenURLs.size;
    };
    const linksLenght = await checkLinks(page);
    expect(linksLenght).toBeGreaterThan(100);
  });
});
