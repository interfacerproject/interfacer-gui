import { expect, Page } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("Notification", () => {
  let page: Page;

  test.describe("with mock data", () => {
    test.beforeEach(async ({ page: testPage, login }) => {
      page = testPage;
      // Set up the route mock BEFORE login so SWR uses it on the first fetch
      await page.route("**/inbox/read", async route => {
        await route.fulfill({
          json: {
            messages: [
              {
                id: 1,
                sender: "test123",
                content: {
                  data: "2023-03-20T12:18:53Z",
                  message: {
                    originalResourceID: "TESTS",
                    originalResourceName: "Test Project",
                    proposalID: "TEST",
                    proposerName: "pippo",
                  },
                  subject: "Project cited",
                },
                read: false,
              },
            ],
            request_id: 50,
            success: true,
          },
        });
      });
      await page.route("**/inbox/count-unread", async route => {
        await route.fulfill({ json: { count: 1 } });
      });
      await page.goto("");
      await login(page);
    });

    test("should see incoming notifications on /notification", async () => {
      await page.goto("/notification");
      // Wait for SWR to fetch and render (auth restore is async)
      await page.waitForSelector(`text="pippo"`, { timeout: 15000 });
      expect(true).toBeTruthy(); // Page rendered notification content with proposerName
    });
  });

  test.describe("empty state", () => {
    test.beforeEach(async ({ page: testPage, login }) => {
      page = testPage;
      await page.route("**/inbox/read", async route => {
        await route.fulfill({ json: { messages: [], request_id: 50, success: true } });
      });
      await page.route("**/inbox/count-unread", async route => {
        await route.fulfill({ json: { count: 0 } });
      });
      await page.goto("");
      await login(page);
    });

    test("should show empty state when no notifications exist", async () => {
      await page.goto("/notification");
      await expect(page.getByText("No notifications at the moment")).toBeVisible();
    });
  });

  test.describe("all read", () => {
    test.beforeEach(async ({ page: testPage, login }) => {
      page = testPage;
      await page.route("**/inbox/read", async route => {
        await route.fulfill({
          json: {
            messages: [
              {
                id: 1,
                sender: "test",
                content: {
                  data: "2023-03-20T12:18:53Z",
                  message: { proposerName: "test" },
                  subject: "Project cited",
                },
                read: true,
              },
            ],
            request_id: 50,
            success: true,
          },
        });
      });
      await page.route("**/inbox/count-unread", async route => {
        await route.fulfill({ json: { count: 0 } });
      });
      await page.goto("");
      await login(page);
    });

    test("should hide mark all as read button when all messages are read", async () => {
      await page.goto("/notification");
      await expect(page.getByRole("button", { name: /Mark all as read/ })).not.toBeVisible();
    });
  });
});
