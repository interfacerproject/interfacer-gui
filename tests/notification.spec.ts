import { expect, Page } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("Notification", () => {
  let page: Page;
  test.beforeEach(async ({ context, login }) => {
    page = await context.newPage();
    await page.goto("");
    await login(page);
  });

  test("should show grouped notifications on /notification", async () => {
    // Set up route mock BEFORE navigation to avoid race with SWR
    await page.route("https://gateway0.interfacer.dyne.org/inbox/read", async route => {
      await route.fulfill({
        json: {
          messages: [
            {
              id: 1,
              sender: "user1",
              content: {
                data: "2023-03-20T12:18:53Z",
                message: {
                  proposerName: "pippo",
                  originalResourceName: "Test Project",
                  proposalID: "P1",
                  originalResourceID: "R1",
                },
                subject: "Project cited",
              },
              read: false,
            },
            {
              id: 2,
              sender: "user1",
              content: {
                data: "2023-03-20T12:18:53Z",
                message: {
                  originalResourceName: "Design",
                  ownerName: "bob",
                  proposalID: "P2",
                  originalResourceID: "R2",
                  proposerName: "bob",
                  text: "test",
                },
                subject: "contributionAccepted",
              },
              read: false,
            },
          ],
          request_id: 50,
          success: true,
        },
      });
    });
    await page.route("https://gateway0.interfacer.dyne.org/inbox/count-unread", async route => {
      await route.fulfill({ json: { count: 2 } });
    });

    // Navigate AFTER routes are set up
    await page.goto("/notification");
    await expect(page.getByRole("heading", { name: /Included/ })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("heading", { name: /Contribution Responses/ })).toBeVisible();
  });

  test("should show empty state when no notifications", async () => {
    await page.route("https://gateway0.interfacer.dyne.org/inbox/read", async route => {
      await route.fulfill({ json: { messages: [], request_id: 50, success: true } });
    });
    await page.route("https://gateway0.interfacer.dyne.org/inbox/count-unread", async route => {
      await route.fulfill({ json: { count: 0 } });
    });
    await page.goto("/notification");
    await expect(page.getByText("No notifications at the moment")).toBeVisible({ timeout: 10000 });
  });

  test("should hide mark all as read when all read", async () => {
    await page.route("https://gateway0.interfacer.dyne.org/inbox/read", async route => {
      await route.fulfill({
        json: {
          messages: [
            {
              id: 1,
              sender: "user1",
              content: {
                data: "2023-03-20T12:18:53Z",
                message: { proposerName: "test" },
                subject: "contributionAccepted",
              },
              read: true,
            },
          ],
          request_id: 50,
          success: true,
        },
      });
    });
    await page.route("https://gateway0.interfacer.dyne.org/inbox/count-unread", async route => {
      await route.fulfill({ json: { count: 0 } });
    });
    await page.goto("/notification");
    await expect(page.getByRole("button", { name: /Mark all as read/ })).not.toBeVisible({ timeout: 10000 });
  });
});
