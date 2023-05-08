import { test } from "@playwright/test";
import { randomString } from "./utils";

test.describe("Authentication process", () => {
  //   let email = randomEmail();
  let question1 = randomString(2);
  let question2 = randomString(2);
  let question3 = randomString(2);

  // Change the base URL to your local development server URL
  const baseURL = "http://localhost:3000";

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.clearPermissions();
    await context.storageState({ path: baseURL });
  });

  test("Sign in", async ({ page }) => {
    const {
      NEXT_PUBLIC_ZENFLOWS_URL = "",
      authEmail = "",
      answer1 = "",
      answer2 = "",
      answer3 = "",
      answer4 = "",
      answer5 = "",
      reflowPrivateKey = "",
      reflowPublicKey = "",
      eddsaPublicKey = "",
      eddsaPrivateKey = "",
      seed = "",
      ethereumAddress = "",
      ethereumPrivateKey = "",
      ecdhPublicKey = "",
      ecdhPrivateKey = "",
      bitcoinPrivateKey = "",
      bitcoinPublicKey = "",
    } = process.env;

    await page.goto("/sign_in");

    // Enter email and submit
    await page.fill("#email", "pippo@dyne.org");
    await page.click("#submit");

    // Sign in via questions
    await page.click("#viaQuestions");

    // Type questions
    await page.fill("#question1", "p");
    await page.fill("#question2", "p");
    await page.fill("#question3", "p");
    await page.fill("#question4", "p");
    await page.fill("#question5", "p");

    // Submit
    await page.click("#submit");
    await page.click("#loginBtn");

    // Log out
    // await page.goto("");
    await page.locator("#user-menu").click();
    await page.getByRole("button", { name: "Logout", exact: true }).click();
  });

  test("Sign up", async ({ page }) => {
    await page.goto("/sign_up");

    //Enter invitation key
    await page.fill("#invitationKey", "123");
    await page.getByRole("button", { name: "Next step" }).click();

    // Enter email and submit
    await page.fill("#email", randomString(10) + "@dyne.org");
    await page.getByLabel("Your name").fill(randomString(10));
    await page.getByLabel("Choose a username").fill(randomString(10));
    await page.getByRole("button", { name: "Next step" }).click();

    // Sign up via questions
    await page.fill("#question1", question1);
    await page.fill("#question2", question2);
    await page.fill("#question3", question3);

    // Submit
    await page.click("#submit");
    await page.getByRole("button", { name: "Register and login" }).click();
    // Log out
    // await page.goto("");
    await page.locator("#user-menu").click();
    await page.getByRole("button", { name: "Logout", exact: true }).click();
  });
});
