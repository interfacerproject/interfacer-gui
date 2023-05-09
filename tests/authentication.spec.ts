import { test } from "./fixtures/test";

test.describe("Authentication process", () => {
  // Change the base URL to your local development server URL
  const baseURL = "http://localhost:3000";

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.clearPermissions();
    await context.storageState({ path: baseURL });
  });

  test("Sign in", async ({ page, authVariables }) => {
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
    await page.getByRole("button", { name: "Logout", exact: true }).click();
  });

  test("Sign up", async ({ page, random, authVariables }) => {
    await page.goto("/sign_up");

    //Enter invitation key
    await page.fill("#invitationKey", authVariables.invitationKey!);
    await page.getByRole("button", { name: "Next step" }).click();

    // Enter email and submit
    await page.fill("#email", random.randomEmail());
    await page.getByLabel("Your name").fill(random.randomString(10));
    await page.getByLabel("Choose a username").fill(random.randomString(10));
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
    await page.getByRole("button", { name: "Logout", exact: true }).click();
  });
});
