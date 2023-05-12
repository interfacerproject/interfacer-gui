import { url } from "lib/regex";
import { expect, Page } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("Notification", () => {
  let page: Page;
  test.beforeEach(async ({ context, login }) => {
    page = await context.newPage();
    await page.goto("");
    await login(page);
  });
  test("when go to /notification should see incoming notifications", async () => {
    await page.goto("/notification");
    await page.route("https://gateway0.interfacer.dyne.org/inbox/read", async route => {
      const json = {
        messages: [
          {
            id: 953,
            sender: "0634YMEGWHNGCVVBKETRXJQCWM",
            content: {
              data: "2023-03-20T12:18:53.758Z",
              message: {
                originalResourceID: "063A4ZP46XVX3GN9NAE26AXWTC",
                originalResourceName: "063A4ZP46XVX3GN9NAE26AXWTC",
                proposalID: "063FXXA3MJG2ZTJH3RQHXCY0PR",
                proposerName: "pippo",
              },
              subject: "Project cited",
            },
            read: false,
          },
          {
            id: 965,
            sender: "0634YMEGWHNGCVVBKETRXJQCWM",
            content: {
              data: "2023-03-20T12:21:13.857Z",
              message: {
                originalResourceID: "063A4ZP46XVX3GN9NAE26AXWTC",
                originalResourceName: "063A4ZP46XVX3GN9NAE26AXWTC",
                proposalID: "063FXXV7GDXVJAW8PA2K5GNNK8",
                proposerName: "pippo",
              },
              subject: "Project cited",
            },
            read: true,
          },
          {
            id: 1094,
            sender: "0634YMEGWHNGCVVBKETRXJQCWM",
            content: {
              data: "2023-03-20T15:47:35.660Z",
              message: {
                originalResourceID: "063A4ZP46XVX3GN9NAE26AXWTC",
                originalResourceName: "063A4ZP46XVX3GN9NAE26AXWTC",
                proposalID: "063FZD2C3GDM6GXTPMRJ2HHQQ4",
                proposerName: "pippo",
              },
              subject: "Project cited",
            },
            read: false,
          },

          {
            id: 476,
            sender: "0634YN1WS21RMWRYTS8N2XGNAW",
            content: {
              data: "2023-03-03T08:23:23.562Z",
              message: {
                originalResourceID: "0639SZ77NTFMJ900ACDM3WKMFM",
                originalResourceName: "first activity forked by pippo",
                ownerName: "nenno",
                proposalID: "0639SZ7AKEA9HKBXV30MC7X8YC",
                proposerName: "nenno",
                text: "testDescription",
              },
              subject: "contributionAccepted",
            },
            read: false,
          },
        ],
        request_id: 50,
        success: true,
      };
      await route.fulfill({ json });
    });

    const notification = await page.getByRole("heading", { name: "Contribution Responses (1)" });
    const notification2 = await page.getByRole("heading", { name: "Citations (3)" });

    expect(notification).toBeTruthy();
    expect(notification2).toBeTruthy();
    await page.getByRole("button", { name: "take me there" }).first().click;
    // expect(page.url()).toContain("project")
  });
});
