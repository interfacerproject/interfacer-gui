// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
// LIVE marketplace with real actors only (Medusa started with INTERFACER_ZENFLOWS_URL).
// Creates disposable registered People and their own Zenflows resources:
// - on Start selling a designer publishes a Design's requirements, a maker
//   registers a Service and lists that design at their own price, a seller puts
//   a Product on sale;
// - a buyer buys the unit from the product page and orders the build from the
//   design page, through checkout;
// - each seller signs their own milestone on Selling; the buyer's order page
//   shows the Interfacer record.
// Zenflows is then queried for who did what. No fixture key is involved.
// With Zenflows GQL_AUTH_CALLS/AUTHZ_ENFORCE on, setup calls are signed like the SDK
// (zenflows-user + zenflows-sign over the body without spaces); createPerson uses
// MARKET_TEST_ZENFLOWS_ADMIN, and every economic write is signed by its own provider.
// MARKET_LIVE_E2E=1 TEST_BASE_URL=http://localhost:3002 playwright test tests/market-sellers.spec.ts
import { expect, test, type Browser, type Page } from "@playwright/test";
import { generateKeyPairSync, sign, type KeyObject } from "node:crypto";

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

type Person = { id: string; seed: string; publicKey: string; email: string; user: string; key: KeyObject };
let observer: Person | null = null; // signs verification reads once people exist

async function gql(request: any, query: string, variables: unknown = {}, opts: { as?: Person; admin?: boolean } = {}) {
  const body = JSON.stringify({ query: query.replace(/\s+/g, " ").trim(), variables });
  const as = opts.as ?? observer;
  const headers: Record<string, string> = { "content-type": "application/json" };
  // Zenflows ignores zenflows-user/-sign when zenflows-admin is present: never both.
  if (opts.admin) headers["zenflows-admin"] = process.env.MARKET_TEST_ZENFLOWS_ADMIN || "";
  else if (as)
    Object.assign(headers, {
      "zenflows-user": as.user,
      "zenflows-sign": sign(null, Buffer.from(body.replace(/ /g, ""), "utf8"), as.key).toString("base64"),
    });
  const res = await request.post(zenflows, { data: body, headers });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.errors).toBeUndefined();
  return json.data;
}

async function newPerson(request: any, role: string): Promise<Person> {
  const { privateKey } = generateKeyPairSync("ed25519");
  const key = privateKey.export({ format: "jwk" }) as { d: string; x: string };
  const user = `market${role}${Date.now()}`;
  const publicKey = base58(Uint8Array.from(Buffer.from(key.x, "base64url")));
  const data = await gql(
    request,
    `mutation($p: PersonCreateParams!) { createPerson(person: $p) { agent { id } } }`,
    { p: { name: `Marketplace ${role}`, user, email: `${user}@market.invalid`, eddsaPublicKey: publicKey } },
    { admin: true }
  );
  return {
    id: data.createPerson.agent.id,
    seed: base58(Uint8Array.from(Buffer.from(key.d, "base64url"))),
    publicKey,
    email: `${user}@market.invalid`,
    user,
    key: privateKey,
  };
}

async function ownResource(request: any, owner: Person, spec: "Design" | "Service" | "Product", name: string) {
  const v = (
    await gql(
      request,
      `{ instanceVariables { specs { specProjectDesign { id } specProjectService { id }
    specProjectProduct { id } } units { unitOne { id } } } }`,
      {},
      { as: owner }
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
    },
    { as: owner }
  );
  return data.createEconomicEvent.economicEvent.resourceInventoriedAs.id as string;
}

async function as(browser: Browser, person: Person): Promise<Page> {
  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  const page = await context.newPage();
  await page.addInitScript(
    (p: { seed: string; publicKey: string; email: string; user: string }) => {
      localStorage.setItem("eddsaPrivateKey", p.seed);
      localStorage.setItem("eddsaPublicKey", p.publicKey);
      localStorage.setItem("authEmail", p.email);
      localStorage.setItem("authUsername", p.user);
    },
    { seed: person.seed, publicKey: person.publicKey, email: person.email, user: person.user }
  );
  return page;
}

type Track = "design" | "service" | "product";

// Start selling, focused on one of the person's own resources: fill what the
// form needs (no prefilled sizes or places) and sign it.
async function offer(page: Page, track: Track, resource: string, fields: Record<string, string>, expected: string) {
  await page.goto(`/market/start-selling?${track}=${resource}`);
  const card = page.locator(`[data-resource="${resource}"]`);
  await expect(card).toBeVisible({ timeout: 30000 });
  for (const [field, value] of Object.entries(fields))
    await card.getByTestId(`market-offer-field-${field}`).fill(value);
  await card.getByTestId("market-offer-submit").click();
  await expect(card.getByTestId("market-offer-message")).toHaveText(expected, { timeout: 30000 });
}

// The maker ticks a registered design their machines fit, at their own price.
async function listBuild(page: Page, service: string, design: string) {
  await page.goto(`/market/start-selling?service=${service}`);
  const row = page.locator(`[data-testid="market-build-listing"][data-design="${design}"]`);
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.getByTestId("market-build-field-base").fill("8");
  await row.getByTestId("market-build-field-unit").fill("3.5");
  await row.getByTestId("market-build-field-days").fill("4");
  await row.getByTestId("market-build-list-btn").click();
  await expect(row.getByTestId("market-build-message")).toHaveText("Listed. Buyers see you on this design.", {
    timeout: 30000,
  });
}

async function checkout(page: Page) {
  const form = page.getByTestId("market-checkout");
  await expect(form).toBeVisible({ timeout: 30000 });
  await form.getByLabel("Street and number").fill("Via Po 18");
  await form.getByLabel("Postal code").fill("10123");
  await form.getByLabel("City").fill("Torino");
  await form.getByTestId("market-place-order").click();
  await page.waitForURL(/\/market\/orders\/[^/?]+\?placed=1/, { timeout: 90000 });
  await expect(page.getByTestId("market-order-placed")).toBeVisible({ timeout: 30000 });
  return new URL(page.url()).pathname.split("/").pop()!;
}

async function signMilestone(page: Page, kind: "stock" | "build", order: string) {
  await page.goto("/market/selling");
  const sale = page.locator(`[data-testid="market-sale"][data-order="${order}"]`);
  await expect(sale).toBeVisible({ timeout: 30000 });
  await expect(sale).toHaveAttribute("data-kind", kind);
  await sale.getByTestId(`market-sale-milestone-${kind}`).click();
  await expect(sale.getByTestId("market-zenflows-event")).toContainText("Recorded on Interfacer", { timeout: 60000 });
}

test.describe("live marketplace with real sellers", () => {
  test.skip(!enabled, "set MARKET_LIVE_E2E=1 with GUI, live Medusa and local Zenflows running");
  test.setTimeout(300000);
  test("owners bring their resources; a maker lists a design; the buyer buys and orders a build; each seller signs", async ({
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
    observer = buyer;
    const design = await ownResource(request, designer, "Design", `Live lamp shade ${stamp}`);
    const service = await ownResource(request, maker, "Service", `Live Torino FDM ${stamp}`);
    const product = await ownResource(request, seller, "Product", `Live recycled lamp ${stamp}`);

    const designerPage = await as(browser, designer);
    await offer(designerPage, "design", design, { x: "120", y: "80", z: "60", quantity: "2" }, "Registered.");
    const makerPage = await as(browser, maker);
    await offer(makerPage, "service", service, { x: "220", y: "220", z: "250", city: "Torino" }, "Registered.");
    await listBuild(makerPage, service, design);
    const sellerPage = await as(browser, seller);
    await offer(sellerPage, "product", product, { price: "24.50" }, "Listed for sale.");
    // The seller does not see the designer's resource (accountable-only listing).
    await sellerPage.getByTestId("market-track-design").click();
    await expect(sellerPage.locator(`[data-resource="${design}"]`)).toHaveCount(0);

    // Anyone can browse: the catalogue shows the unit and the buildable design.
    const buyerPage = await as(browser, buyer);
    await buyerPage.goto("/market");
    await expect(buyerPage.locator(`[data-testid="market-product"][data-resource="${product}"]`)).toBeVisible({
      timeout: 30000,
    });
    await buyerPage.getByTestId("market-view-build").click();
    const designCard = buyerPage.locator(`[data-testid="market-design"][data-resource="${design}"]`);
    await expect(designCard.getByTestId("market-design-makers")).toHaveText("1 maker", { timeout: 30000 });

    // Ready-made: the product page's Buy block → checkout, signed by the buyer.
    const login = buyerPage.waitForResponse(
      res => res.url().endsWith("/dev/store/session") && res.request().method() === "POST"
    );
    await buyerPage.goto(`/project/${product}`);
    await buyerPage.getByTestId("market-buy-stock").filter({ visible: true }).click();
    const stockOrder = await checkout(buyerPage);
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
    await expect(buyerPage.getByTestId("market-order-status")).toHaveText("Awaiting delivery");

    // Built on demand: the design page lists the maker at the LISTED price.
    await buyerPage.goto(`/project/${design}`);
    const panel = buyerPage.getByTestId("market-get-it-built").filter({ visible: true });
    const makerOption = panel.locator(`[data-testid="market-match-service"][data-service="${service}"]`);
    await expect(makerOption).toContainText("€15.00", { timeout: 30000 }); // 8 + 3.5 × 2
    await expect(makerOption).toContainText("ready in 4 days");
    await makerOption.click();
    await panel.getByTestId("market-order-build").click();
    const buildOrder = await checkout(buyerPage);
    await expect(buyerPage.getByTestId("market-order-status")).toHaveText("In production");

    // Another person sees none of these sales and cannot prepare their milestone.
    const outsiderPage = await as(browser, outsider);
    await outsiderPage.goto("/market/selling");
    await expect(outsiderPage.getByTestId("market-sales")).toBeVisible({ timeout: 30000 });
    await expect(outsiderPage.getByTestId("market-sale")).toHaveCount(0);

    await signMilestone(sellerPage, "stock", stockOrder);
    await expect(sellerPage.getByTestId("market-stat-earned")).toHaveText("€24.50");
    await signMilestone(makerPage, "build", buildOrder);
    await expect(makerPage.getByTestId("market-stat-earned")).toHaveText("€15.00");
    await expect(makerPage.getByTestId("market-stat-designs")).toHaveText("1");
    const forbidden = await request.post("/api/market/dev/store/prepare", {
      headers: { authorization: `Bearer ${session.token}` },
      data: { action: "deliver", orderId: stockOrder },
    });
    expect((await forbidden.json()).message).toBe("seller_order_required");

    // The buyer's order page shows the handover with its Interfacer ids.
    await buyerPage.goto(`/market/orders/${buildOrder}`);
    await expect(buyerPage.getByTestId("market-order-status")).toHaveText("Built and handed over", { timeout: 30000 });
    await expect(buyerPage.getByTestId("market-zenflows-id").first()).toBeVisible();

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
    for (const [page, path, name] of [
      [sellerPage, "/market/selling", "selling"],
      [buyerPage, "/market", "catalogue"],
      [buyerPage, `/market/orders/${buildOrder}`, "order"],
    ] as const) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `test-results/market-live-${name}-mobile.png`, fullPage: true });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });
});
