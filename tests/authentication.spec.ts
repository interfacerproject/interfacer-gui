import { test } from "./fixtures/test";
import { Page } from "@playwright/test";

test.describe("Authentication process", () => {
  test.describe.configure({ retries: 3 });
  let page: Page;

  test.beforeEach(async ({ context, logout }) => {
    page = await context.newPage();
    await page.goto("");
  });
  test.afterEach(async ({ logout }) => {
    await logout(page);
  });

  test("Sign in", async ({ authVariables }) => {
    await page.goto("/sign_in");

    // Enter email and submit
    await page.fill("#email", authVariables.authEmail!);
    await page.click("#submit");

    // Sign in via questions
    await page.click("#viaQuestions");

    // Type questions
    await page.fill("#question1", authVariables.answer1!);
    await page.fill("#question2", authVariables.answer2!);
    await page.fill("#question3", authVariables.answer3!);
    await page.fill("#question4", authVariables.answer3!);
    await page.fill("#question5", authVariables.answer3!);

    // Submit
    await page.click("#submit");
    await page.click("#loginBtn");

    // Log out
    // await page.goto("");
    await page.locator("#user-menu").click();
  });

  test("Sign up", async ({ random, authVariables }) => {
    await page.goto("/sign_up");

    //Enter invitation key
    await page.fill("#invitationKey", authVariables.invitationKey!);
    await page.getByRole("button", { name: "Next step" }).click();

    // Enter email and submit
    await page.fill("#email", random.randomEmail());
    await page.getByLabel("Your name").fill(random.randomString(5));
    await page.getByLabel("Choose a username").fill(random.randomString(5));

    //Fix me
    const p = await page.$("body");
    await p?.click();

    await page.getByRole("button", { name: "Next step" }).click();

    // Sign up via questions
    await page.fill("#question1", authVariables.answer1!);
    await page.fill("#question2", authVariables.answer2!);
    await page.fill("#question3", authVariables.answer3!);

    // Submit
    await page.click("#submit");
    await page.getByRole("button", { name: "Register and login" }).click();
    // Log out
    // await page.goto("");
    await page.locator("#user-menu").click();
  });
});
