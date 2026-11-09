// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
// Local integration only: creates disposable registered People and real orders.
// MARKET_LIVE_E2E=1 TEST_BASE_URL=http://localhost:3002 playwright test tests/market-identity.spec.ts
import { expect, test } from "@playwright/test";
import { generateKeyPairSync } from "node:crypto";

const enabled = process.env.MARKET_LIVE_E2E === "1";
const zenflows = process.env.MARKET_TEST_ZENFLOWS_URL || "http://localhost:8000/api";

function base58(bytes: Uint8Array): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const digits: number[] = [];
  for (const byte of Array.from(bytes)) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] * 256;
      digits[i] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let leading = "";
  for (const byte of Array.from(bytes)) {
    if (byte !== 0) break;
    leading += "1";
  }
  return (
    leading +
    digits
      .reverse()
      .map(d => alphabet[d])
      .join("")
  );
}

async function gql(request: any, query: string, variables: unknown = {}) {
  const res = await request.post(zenflows, { data: { query, variables } });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.errors).toBeUndefined();
  return body.data;
}

async function newBuyer(request: any, suffix: string) {
  const { privateKey } = generateKeyPairSync("ed25519");
  const key = privateKey.export({ format: "jwk" }) as { d: string; x: string };
  const seed = base58(Uint8Array.from(Buffer.from(key.d, "base64url")));
  const publicKey = base58(Uint8Array.from(Buffer.from(key.x, "base64url")));
  const user = `markettest${Date.now()}${suffix}`;
  const email = `${user}@market.invalid`;
  const data = await gql(
    request,
    `mutation($p: PersonCreateParams!) {
    createPerson(person: $p) { agent { id } }
  }`,
    { p: { name: `Marketplace test ${suffix}`, user, email, eddsaPublicKey: publicKey } }
  );
  return { id: data.createPerson.agent.id as string, seed, publicKey, email, user };
}

async function installBuyer(page: any, buyer: Awaited<ReturnType<typeof newBuyer>>) {
  await page.addInitScript((b: any) => {
    localStorage.setItem("eddsaPrivateKey", b.seed);
    localStorage.setItem("eddsaPublicKey", b.publicKey);
    localStorage.setItem("authEmail", b.email);
    localStorage.setItem("authUsername", b.user);
  }, buyer);
}

test.describe("verified marketplace identity + live production", () => {
  test.skip(!enabled, "set MARKET_LIVE_E2E=1 with GUI, Medusa and local Zenflows running");
  test.setTimeout(120000);
  // Fixture journeys (disposable demo buyer/supplier keys) exist only when Medusa
  // runs standalone; live mode refuses them. See tests/market-sellers.spec.ts.
  test.beforeEach(async ({ request }) => {
    const scene = await (await request.get("/api/market/dev/store/config")).json().catch(() => ({}));
    test.skip(Boolean(scene.live), "standalone fixture journeys: run dev:up without INTERFACER_ZENFLOWS_URL");
  });

  test("browser wallet binds the real buyer; build has a Process; proof replay and impersonation are refused", async ({
    page,
    request,
    browser,
  }) => {
    const first = await newBuyer(request, "a");
    const second = await newBuyer(request, "b");
    await installBuyer(page, first);
    const requests: any[] = [];
    page.on("request", req => {
      if (req.url().includes("/api/market/")) requests.push(req);
    });
    const loginResponse = page.waitForResponse(
      res => res.url().endsWith("/dev/store/session") && res.request().method() === "POST"
    );
    await page.goto("/market/build");
    await expect(page.getByTestId("market-designs")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("market-buyer")).toContainText(first.id);
    const sessionResponse = await loginResponse;
    const login = await sessionResponse.json();
    expect(login.buyer_person_id).toBe(first.id);
    expect(requests.some(req => req.url().includes("emailpass"))).toBe(false);
    const proof = sessionResponse.request().headers()["x-interfacer-auth"];
    const replay = await page.request.post("/api/market/dev/store/session", {
      headers: { "x-interfacer-auth": proof },
      data: {},
    });
    expect(replay.status()).toBeGreaterThanOrEqual(400);
    expect((await replay.json()).message).toBe("buyer_challenge_invalid");

    const design = page.getByTestId("market-design").filter({ hasText: "PETG organizer" });
    await design.getByTestId("market-match-btn").click();
    const buy = design.getByTestId("market-buy-build").first();
    await expect(buy).toBeEnabled({ timeout: 15000 });
    await buy.click();
    const produce = design.getByTestId("market-milestone-build").first();
    await expect(produce).toBeVisible({ timeout: 30000 });
    const receiptResponse = page.waitForResponse(
      res => /\/build-orders\/[^/]+\/produce$/.test(res.url()) && res.request().method() === "POST"
    );
    await produce.click();
    const receipt = (await (await receiptResponse).json()).receipt;
    expect(receipt.receiver_id).toBe(first.id);
    expect(receipt.zenflows_event_id).toBeTruthy();
    await expect(design.getByTestId("market-receipt").first()).toContainText("LIVE");

    const event = (
      await gql(
        request,
        `query($id: ID!) { economicEvent(id: $id) {
      id action { id } receiver { id } note
    } }`,
        { id: receipt.zenflows_event_id }
      )
    ).economicEvent;
    expect(event.action.id).toBe("transfer");
    expect(event.receiver.id).toBe(first.id);
    const events = (
      await gql(
        request,
        `{ economicEvents(first:100) { edges { node {
      id action { id } note provider { id } receiver { id } outputOf { id finished }
    } } } }`
      )
    ).economicEvents.edges.map((e: any) => e.node);
    const produced = events.find((e: any) => e.action.id === "produce" && e.note?.includes(receipt.order_id));
    expect(produced).toBeTruthy();
    expect(produced.provider.id).toBe(produced.receiver.id);
    expect(produced.outputOf.id).toBeTruthy();
    expect(produced.outputOf.finished).toBe(true);

    const authHeaders = { authorization: `Bearer ${login.token}` };
    const forbiddenSigner = await request.post("/api/market/dev/store/sign", {
      headers: authHeaders,
      data: { action: "capture", orderId: receipt.order_id },
    });
    expect(forbiddenSigner.status()).toBe(403);
    expect((await forbiddenSigner.json()).reason).toBe("buyer_wallet_signature_required");

    const secondContext = await browser.newContext({ baseURL: test.info().project.use.baseURL });
    try {
      const other = await secondContext.newPage();
      await installBuyer(other, second);
      const nextLogin = other.waitForResponse(
        res => res.url().endsWith("/dev/store/session") && res.request().method() === "POST"
      );
      await other.goto("/market/build");
      await expect(other.getByTestId("market-designs")).toBeVisible({ timeout: 30000 });
      const nextSession = await (await nextLogin).json();
      expect(nextSession.buyer_person_id).toBe(second.id);
      expect(nextSession.customer_id).not.toBe(login.customer_id);
      const forbidden = await other.request.post("/api/market/dev/store/prepare", {
        headers: { authorization: `Bearer ${nextSession.token}` },
        data: { action: "capture", orderId: receipt.order_id },
      });
      expect(forbidden.status()).toBeGreaterThanOrEqual(400);
      expect((await forbidden.json()).message).toBe("demo_order_required");
      // Copying first buyer's saved journey into this browser does not restore it
      // for another customer: keys include run + native customer id.
      const saved = await page.evaluate(() => Object.entries(localStorage).filter(([k]) => k.startsWith("market:")));
      await other.evaluate(entries => {
        for (const [k, v] of entries) localStorage.setItem(k, v);
      }, saved);
      await other.reload();
      await expect(other.getByTestId("market-designs")).toBeVisible({ timeout: 30000 });
      await other
        .getByTestId("market-design")
        .filter({ hasText: "PETG organizer" })
        .getByTestId("market-match-btn")
        .click();
      await expect(other.getByTestId("market-buy-build").first()).toBeEnabled({ timeout: 15000 });
      await expect(other.getByTestId("market-receipt")).toHaveCount(0);
    } finally {
      await secondContext.close();
    }

    console.log(
      JSON.stringify({
        buyer: first.id,
        order: receipt.order_id,
        handover: event.id,
        produce: produced.id,
        process: produced.outputOf.id,
      })
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: "test-results/market-identity-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: "test-results/market-identity-mobile.png", fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("stock handover targets the signed-in buyer and a milestone retry reuses the receipt", async ({
    page,
    request,
  }) => {
    const buyer = await newBuyer(request, "stock");
    await installBuyer(page, buyer);
    const sessionResponse = page.waitForResponse(
      res => res.url().endsWith("/dev/store/session") && res.request().method() === "POST"
    );
    await page.goto("/market");
    await expect(page.getByTestId("market-catalog")).toBeVisible({ timeout: 30000 });
    const available = page.locator('[data-testid="market-buy-stock"]:not([disabled])').first();
    if ((await available.count()) === 0) {
      test.skip(true, "finite demo stock sold out; restart dev:up explicitly to seed another run");
      return;
    }
    const session = await (await sessionResponse).json();
    await available.click();
    const deliver = page.getByTestId("market-milestone-stock").first();
    await expect(deliver).toBeVisible({ timeout: 30000 });
    const delivered = page.waitForResponse(
      res => /\/orders\/[^/]+\/deliver$/.test(res.url()) && res.request().method() === "POST"
    );
    await deliver.click();
    const response = await delivered;
    const receipt = (await response.json()).receipt;
    expect(receipt.receiver_id).toBe(buyer.id);
    expect(receipt.zenflows_event_id).toBeTruthy();
    const event = (
      await gql(request, `query($id: ID!) { economicEvent(id: $id) { receiver { id } } }`, {
        id: receipt.zenflows_event_id,
      })
    ).economicEvent;
    expect(event.receiver.id).toBe(buyer.id);
    // Re-use the same valid assertion to exercise the persisted receipt guard.
    const signature = response.request().headers()["x-interfacer-auth"];
    const retry = await request.post(response.url(), {
      headers: { authorization: `Bearer ${session.token}`, "x-interfacer-auth": signature },
      data: {},
    });
    expect(retry.ok()).toBeTruthy();
    const repeated = await retry.json();
    expect(repeated.created).toBe(false);
    expect(repeated.receipt.id).toBe(receipt.id);
    expect(repeated.receipt.zenflows_event_id).toBe(receipt.zenflows_event_id);
    await page.reload();
    await expect(page.getByTestId("market-receipt").first()).toContainText(buyer.id);
    console.log(
      JSON.stringify({
        stockBuyer: buyer.id,
        order: receipt.order_id,
        handover: receipt.zenflows_event_id,
        retry: "same receipt",
      })
    );
  });
});
