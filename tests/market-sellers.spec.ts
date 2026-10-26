// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
// LIVE marketplace with real actors only (Medusa started with INTERFACER_ZENFLOWS_URL).
// Creates disposable registered People and their own Zenflows resources:
// - a designer registers a Design and a maker a Service on /market/offer;
// - a seller lists a Product;
// - a buyer buys stock and a build;
// - each seller signs their own milestone on /market/sales.
// Zenflows is then queried for who did what. No fixture key is involved.
// MARKET_LIVE_E2E=1 TEST_BASE_URL=http://localhost:3002 playwright test tests/market-sellers.spec.ts
import { expect, test, type Browser, type Page } from "@playwright/test";
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

type Person = { id: string; seed: string; publicKey: string; email: string; user: string };
async function newPerson(request: any, role: string): Promise<Person> {
  const { privateKey } = generateKeyPairSync("ed25519");
  const key = privateKey.export({ format: "jwk" }) as { d: string; x: string };
  const user = `market${role}${Date.now()}`;
  const publicKey = base58(Uint8Array.from(Buffer.from(key.x, "base64url")));
  const data = await gql(request, `mutation($p: PersonCreateParams!) { createPerson(person: $p) { agent { id } } }`, {
    p: { name: `Marketplace ${role}`, user, email: `${user}@market.invalid`, eddsaPublicKey: publicKey },
  });
  return {
    id: data.createPerson.agent.id,
    seed: base58(Uint8Array.from(Buffer.from(key.d, "base64url"))),
    publicKey,
    email: `${user}@market.invalid`,
    user,
  };
}

async function ownResource(request: any, owner: Person, spec: "Design" | "Service" | "Product", name: string) {
  const v = (
    await gql(
      request,
      `{ instanceVariables { specs { specProjectDesign { id } specProjectService { id }
    specProjectProduct { id } } units { unitOne { id } } } }`
    )
  ).instanceVariables;
  const conformsTo = {
    Design: v.specs.specProjectDesign.id,
    Service: v.specs.specProjectService.id,
    Product: v.specs.specProjectProduct.id,
  }[spec];
  const data = await gql(
    request,
    `mutation($e: EconomicEventCreateParams!, $r: EconomicResourceCreateParams!) {
    createEconomicEvent(event: $e, newInventoriedResource: $r) { economicEvent { resourceInventoriedAs { id } } } }`,
    {
      e: {
        action: "raise",
        provider: owner.id,
        receiver: owner.id,
        resourceConformsTo: conformsTo,
        resourceQuantity: { hasNumericalValue: 1, hasUnit: v.units.unitOne.id },
        hasPointInTime: new Date().toISOString(),
      },
      r: { name },
    }
  );
  return data.createEconomicEvent.economicEvent.resourceInventoriedAs.id as string;
}

async function as(browser: Browser, person: Person): Promise<Page> {
  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  const page = await context.newPage();
  await page.addInitScript((p: Person) => {
    localStorage.setItem("eddsaPrivateKey", p.seed);
    localStorage.setItem("eddsaPublicKey", p.publicKey);
    localStorage.setItem("authEmail", p.email);
    localStorage.setItem("authUsername", p.user);
  }, person);
  return page;
}

async function offer(page: Page, resource: string, expected: string) {
  await page.goto("/market/offer");
  const card = page.locator(`[data-resource="${resource}"]`);
  await expect(card).toBeVisible({ timeout: 30000 });
  await card.getByTestId("market-offer-submit").click();
  await expect(card.getByTestId("market-offer-message")).toHaveText(expected, { timeout: 30000 });
}

async function signMilestone(page: Page, kind: "stock" | "build") {
  await page.goto("/market/sales");
  const sale = page.locator(`[data-testid="market-sale"][data-kind="${kind}"]`).first();
  await expect(sale).toBeVisible({ timeout: 30000 });
  await sale.getByTestId(`market-sale-milestone-${kind}`).click();
  await expect(sale.getByTestId("market-zenflows-event")).toContainText("LIVE", { timeout: 30000 });
  return (await sale.getAttribute("data-order"))!;
}

test.describe("live marketplace with real sellers", () => {
  test.skip(!enabled, "set MARKET_LIVE_E2E=1 with GUI, live Medusa and local Zenflows running");
  test.setTimeout(240000);

  test("owners register and list their own resources; buyer pays; each seller signs their own milestone", async ({
    browser,
    request,
  }) => {
    const config = await (await request.get("/api/market/dev/store/config")).json();
    test.skip(!config.live, "Medusa is in standalone fixture mode");
    expect(config.password).toBeUndefined();
    const stamp = Date.now();
    const [designer, maker, seller, buyer, outsider] = await Promise.all(
      ["designer", "maker", "seller", "buyer", "outsider"].map(r => newPerson(request, r))
    );
    const design = await ownResource(request, designer, "Design", `Live lamp shade ${stamp}`);
    const service = await ownResource(request, maker, "Service", `Live Torino FDM ${stamp}`);
    const product = await ownResource(request, seller, "Product", `Live recycled lamp ${stamp}`);

    const designerPage = await as(browser, designer);
    await offer(designerPage, design, "Registered.");
    const makerPage = await as(browser, maker);
    await offer(makerPage, service, "Registered.");
    const sellerPage = await as(browser, seller);
    await offer(sellerPage, product, "Listed for sale.");
    // The seller does not see the designer's resource (accountable-only listing).
    await expect(sellerPage.locator(`[data-resource="${design}"]`)).toHaveCount(0);

    const buyerPage = await as(browser, buyer);
    const login = buyerPage.waitForResponse(
      res => res.url().endsWith("/dev/store/session") && res.request().method() === "POST"
    );
    await buyerPage.goto("/market");
    await expect(buyerPage.getByTestId("market-catalog")).toBeVisible({ timeout: 30000 });
    const sessionResponse = await login;
    const session = await sessionResponse.json();
    expect(session.buyer_person_id).toBe(buyer.id);
    const replay = await buyerPage.request.post("/api/market/dev/store/session", {
      headers: { "x-interfacer-auth": sessionResponse.request().headers()["x-interfacer-auth"] },
      data: {},
    });
    expect((await replay.json()).message).toBe("buyer_challenge_invalid");
    const devSigner = await request.post("/api/market/dev/store/sign", {
      headers: { authorization: `Bearer ${session.token}` },
      data: { action: "capture", orderId: "x" },
    });
    expect(devSigner.status()).toBe(403);
    expect((await devSigner.json()).reason).toBe("dev_signer_disabled_live");

    const card = buyerPage.getByTestId("market-product").filter({ hasText: `Live recycled lamp ${stamp}` });
    await card.getByTestId("market-buy-stock").click();
    await expect(card.getByTestId("market-awaiting-seller")).toBeVisible({ timeout: 60000 });

    await buyerPage.goto("/market/build");
    const row = buyerPage.getByTestId("market-design").filter({ hasText: `Live lamp shade ${stamp}` });
    await row.getByTestId("market-match-btn").click();
    const offerRow = row.getByTestId("market-match-service").filter({ hasText: `Live Torino FDM ${stamp}` });
    await offerRow.getByTestId("market-buy-build").click();
    await expect(offerRow.getByTestId("market-awaiting-seller")).toBeVisible({ timeout: 60000 });

    // Another person sees none of these sales and cannot prepare their milestone.
    const outsiderPage = await as(browser, outsider);
    await outsiderPage.goto("/market/sales");
    await expect(outsiderPage.getByTestId("market-sales")).toBeVisible({ timeout: 30000 });
    await expect(outsiderPage.getByTestId("market-sale")).toHaveCount(0);

    const stockOrder = await signMilestone(sellerPage, "stock");
    const buildOrder = await signMilestone(makerPage, "build");
    const forbidden = await request.post("/api/market/dev/store/prepare", {
      headers: { authorization: `Bearer ${session.token}` },
      data: { action: "deliver", orderId: stockOrder },
    });
    expect((await forbidden.json()).message).toBe("seller_order_required");

    await buyerPage.goto("/market");
    const bought = buyerPage.getByTestId("market-product").filter({ hasText: `Live recycled lamp ${stamp}` });
    await bought.getByTestId("market-check-stock").click();
    await expect(bought.getByTestId("market-zenflows-event")).toContainText("LIVE", { timeout: 30000 });

    const receipts = (await (await request.get("/api/market/dev/interfacer/receipts")).json()).receipts;
    const stockReceipt = receipts.find((r: any) => r.order_id === stockOrder);
    const buildReceipt = receipts.find((r: any) => r.order_id === buildOrder);
    const transfer = (
      await gql(
        request,
        `query($id: ID!) { economicEvent(id: $id) { action { id } provider { id }
      receiver { id } resourceInventoriedAs { id } toResourceInventoriedAs { primaryAccountable { id } } } }`,
        { id: stockReceipt.zenflows_event_id }
      )
    ).economicEvent;
    expect(transfer).toMatchObject({
      action: { id: "transfer" },
      provider: { id: seller.id },
      receiver: { id: buyer.id },
      resourceInventoriedAs: { id: product },
      toResourceInventoriedAs: { primaryAccountable: { id: buyer.id } },
    });
    const produced = (
      await gql(
        request,
        `query($id: ID!) { economicResource(id: $id) { previous {
      action { id } provider { id } outputOf { id finished } } } }`,
        { id: buildReceipt.zenflows_sync.resource_id }
      )
    ).economicResource;
    const produce = produced.previous.find((e: any) => e.action.id === "produce");
    expect(produce.provider.id).toBe(maker.id);
    expect(produce.outputOf).toMatchObject({ id: buildReceipt.zenflows_sync.process_id, finished: true });
    const handover = (
      await gql(request, `query($id: ID!) { economicEvent(id: $id) { provider { id } receiver { id } } }`, {
        id: buildReceipt.zenflows_event_id,
      })
    ).economicEvent;
    expect(handover).toMatchObject({ provider: { id: maker.id }, receiver: { id: buyer.id } });

    console.log(
      JSON.stringify({
        seller: seller.id,
        maker: maker.id,
        buyer: buyer.id,
        stockOrder,
        buildOrder,
        stockHandover: stockReceipt.zenflows_event_id,
        buildHandover: buildReceipt.zenflows_event_id,
        process: buildReceipt.zenflows_sync.process_id,
      })
    );
    for (const [page, name] of [
      [sellerPage, "sales"],
      [buyerPage, "catalog"],
    ] as const) {
      await page.setViewportSize({ width: 390, height: 844 });
      if (name === "sales") await page.goto("/market/sales");
      await expect(page.getByTestId(name === "sales" ? "market-sale" : "market-receipt").first()).toBeVisible({
        timeout: 30000,
      });
      await page.screenshot({ path: `test-results/market-live-${name}-mobile.png`, fullPage: true });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });
});
