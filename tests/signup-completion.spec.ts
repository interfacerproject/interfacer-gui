// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import { test, expect } from "@playwright/test";

for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
] as const) {
  test(`signup redirects home even when verification email fails (${name})`, async ({ page, baseURL }) => {
    await page.setViewportSize(viewport);
    const appOrigin = new URL(baseURL!).origin;
    let creations = 0;
    let emailCalls = 0;
    let didCalls = 0;
    let releaseSignup!: () => void;
    const signupGate = new Promise<void>(resolve => {
      releaseSignup = resolve;
    });

    // Synthetic identities only. Block all non-app requests unless explicitly mocked below.
    await page.route("**/*", async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === appOrigin && url.pathname === "/api/signup") {
        creations++;
        await signupGate;
        return route.fulfill({
          status: 201,
          json: { agent: { id: "fixture-id", name: "Fixture", user: "fixture", email: "fixture@example.invalid" } },
        });
      }
      if (request.method() === "POST") {
        let body;
        try {
          body = request.postDataJSON();
        } catch {}
        if (typeof body?.query === "string") {
          let data = {};
          if (body.query.includes("personExists")) data = { personExists: false };
          else if (body.query.includes("keypairoomServer")) {
            data = { keypairoomServer: Buffer.alloc(32, 7).toString("base64") };
          } else if (body.query.includes("personCheck")) {
            data = {
              personCheck: {
                id: "fixture-id",
                name: "Fixture",
                user: "fixture",
                email: "fixture@example.invalid",
                isVerified: false,
                images: [],
              },
            };
          } else if (body.query.includes("personRequestEmailVerification")) {
            emailCalls++;
            return route.fulfill({
              headers: { "Access-Control-Allow-Origin": "*" },
              json: { errors: [{ message: "Mock email service unavailable" }] },
            });
          } else if (body.query.includes("claimPerson")) {
            didCalls++;
            data = { claimPerson: { did: { result: { didDocument: { id: "did:example:fixture" } } } } };
          }
          return route.fulfill({ headers: { "Access-Control-Allow-Origin": "*" }, json: { data } });
        }
      }
      if (url.origin === appOrigin) return route.continue();
      if (request.method() === "OPTIONS") {
        return route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
          },
        });
      }
      return route.abort();
    });

    await page.goto("/sign_up");
    await page.locator("#email").fill("fixture@example.invalid");
    await page.locator("#name").fill("Fixture");
    await page.locator("#user").fill("fixture");
    await page.locator("#submit").click();
    for (let i = 1; i <= 5; i++) await page.locator(`#question${i}`).fill(`synthetic answer ${i}`);
    await page.locator("#submit").click();

    const submit = page.locator('[data-test="signUpBtn"]');
    await expect(submit).toBeVisible({ timeout: 30000 });
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveAttribute("aria-busy", "true");
    await expect(page.locator('[data-test="signUpError"]')).toHaveCount(0);
    // A second programmatic click must not create another account either.
    await submit.evaluate(button => (button as HTMLButtonElement).click());
    releaseSignup();

    await expect(page).toHaveURL(`${appOrigin}/`);
    await expect.poll(() => emailCalls).toBe(1);
    await expect.poll(() => didCalls).toBe(1);
    expect(creations).toBe(1);
    // Next.js has its own role="alert" route announcer; it is not a signup error.
    await expect(page.locator('[data-test="signUpError"]')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("authId"))).toBe("fixture-id");
  });
}
