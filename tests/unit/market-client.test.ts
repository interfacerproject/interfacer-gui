// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createMarketClient } from "../../lib/market/client";
import { MarketError } from "../../lib/market/types";

const SCENE = {
  label: "demo",
  run: "run1",
  email: "buyer@demo.local",
  password: "demo-pass",
  buyer_person_id: "person_buyer",
  customer_id: "cus_1",
  context: { publishable_key: "pk_test", region_id: "reg_1", sales_channel_id: "sc_1" },
  products: [{ product_id: "prod_1", variant_id: "var_1", listing_id: "lst_1", resource_id: "res_1", dpp_id: "dpp_1" }],
};

// Records every request and replies from a scripted map keyed by "METHOD path"
// (path without query string). Missing routes throw, so a wrong call fails loudly.
function scriptedFetch(routes: Record<string, { status?: number; body: unknown; headers?: Record<string, string> }>) {
  const calls: Array<{ url: string; method: string; headers: Record<string, string>; body?: unknown }> = [];
  const fetchImpl = async (url: string, init: any = {}) => {
    const method = (init.method ?? "GET").toUpperCase();
    const path = url.split("?")[0];
    calls.push({ url, method, headers: init.headers ?? {}, body: init.body ? JSON.parse(init.body) : undefined });
    const key = `${method} ${path}`;
    const r = routes[key];
    if (!r) throw new Error(`unscripted request: ${key}`);
    const status = r.status ?? 200;
    return {
      status,
      ok: status < 400,
      headers: { get: (k: string) => (r.headers ?? {})[k.toLowerCase()] ?? null },
      json: async () => r.body,
      text: async () => JSON.stringify(r.body),
    } as any;
  };
  return { fetchImpl: fetchImpl as unknown as typeof fetch, calls };
}

test("connect loads the scene then logs the demo customer in for a bearer token", async () => {
  const { fetchImpl, calls } = scriptedFetch({
    "GET /api/market/dev/store/config": { body: SCENE },
    "POST /api/market/auth/customer/emailpass": { body: { token: "tok_abc" } },
  });
  const client = createMarketClient({ fetchImpl });
  const res = await client.connect();
  assert.equal(res.ok, true);
  assert.equal(calls[0].url, "/api/market/dev/store/config");
  assert.equal(calls[1].url, "/api/market/auth/customer/emailpass");
  assert.deepEqual(calls[1].body, { email: SCENE.email, password: SCENE.password });
});

test("after connect, store calls carry the publishable key and bearer token", async () => {
  const { fetchImpl, calls } = scriptedFetch({
    "GET /api/market/dev/store/config": { body: SCENE },
    "POST /api/market/auth/customer/emailpass": { body: { token: "tok_abc" } },
    "GET /api/market/store/products": { body: { products: [] } },
  });
  const client = createMarketClient({ fetchImpl });
  await client.connect();
  await client.catalog();
  const products = calls.find(c => c.url.startsWith("/api/market/store/products"))!;
  assert.equal(products.headers["x-publishable-api-key"], "pk_test");
  assert.equal(products.headers["Authorization"] ?? products.headers["authorization"], "Bearer tok_abc");
});

test("signed() fetches a fresh envelope then calls the write with the X-Interfacer-Auth header", async () => {
  const { fetchImpl, calls } = scriptedFetch({
    "GET /api/market/dev/store/config": { body: SCENE },
    "POST /api/market/auth/customer/emailpass": { body: { token: "tok_abc" } },
    "POST /api/market/dev/store/sign": { body: { header: "ENVELOPE_B64", auth: {} } },
    "POST /api/market/dev/interfacer/orders/order_1/deliver": {
      body: { receipt: { id: "rcpt_1", action: "transfer" } },
    },
  });
  const client = createMarketClient({ fetchImpl });
  await client.connect();
  const out = await client.markMilestone("stock", "order_1");
  assert.equal(out.ok, true);
  const sign = calls.find(c => c.url === "/api/market/dev/store/sign")!;
  assert.deepEqual(sign.body, { action: "deliver", orderId: "order_1" });
  const write = calls.find(c => c.url === "/api/market/dev/interfacer/orders/order_1/deliver")!;
  assert.equal(write.headers["X-Interfacer-Auth"] ?? write.headers["x-interfacer-auth"], "ENVELOPE_B64");
});

test("a produce milestone routes to build-orders/:id/produce", async () => {
  const { fetchImpl, calls } = scriptedFetch({
    "GET /api/market/dev/store/config": { body: SCENE },
    "POST /api/market/auth/customer/emailpass": { body: { token: "t" } },
    "POST /api/market/dev/store/sign": { body: { header: "E" } },
    "POST /api/market/dev/interfacer/build-orders/bo_1/produce": { body: { receipt: { id: "r", action: "produce" } } },
  });
  const client = createMarketClient({ fetchImpl });
  await client.connect();
  const out = await client.markMilestone("build", "bo_1");
  assert.equal(out.ok, true);
  assert.ok(calls.some(c => c.url === "/api/market/dev/interfacer/build-orders/bo_1/produce"));
});

test("retrySync advances the sync with an empty body, unsigned, then returns this order's refreshed receipt", async () => {
  const live = { id: "r", action: "transfer", order_id: "order_1", receiver_id: SCENE.buyer_person_id,
    zenflows_event_id: "06GEVENT", zenflows_sync: { id: "ifzs_1", status: "done" } };
  const { fetchImpl, calls } = scriptedFetch({
    "GET /api/market/dev/store/config": { body: SCENE },
    "POST /api/market/auth/customer/emailpass": { body: { token: "t" } },
    "POST /api/market/dev/interfacer/zenflows-sync/ifzs_1/retry": { body: { sync: { status: "done" } } },
    "GET /api/market/dev/interfacer/receipts": { body: { receipts: [
      { ...live, id: "other", order_id: "order_2" }, live] } },
  });
  const client = createMarketClient({ fetchImpl });
  await client.connect();
  const out = await client.retrySync("order_1", "ifzs_1");
  assert.equal(out.ok, true);
  assert.equal((out as { ok: true; data: { id: string } }).data.id, "r");
  const retry = calls.find(c => c.url.endsWith("/retry"))!;
  assert.deepEqual(retry.body, {});
  assert.equal(retry.headers["X-Interfacer-Auth"], undefined);
  assert.ok(!calls.some(c => c.url.includes("dev/store/sign")));
});

const LIVE = { label: "live", run: "r", live: true, context: SCENE.context, products: [] };
function liveWallet(personId = "06GSELLER0000000000000000A") {
  const signedOps: Array<{ op: string; params: unknown; person: string }> = [];
  return { signedOps, wallet: { personId, sign: async (o: any) => { signedOps.push(o); return "H:" + o.op; } } };
}
function liveRoutes(extra: Record<string, any> = {}) {
  return {
    "GET /api/market/dev/store/config": { body: LIVE },
    "GET /api/market/dev/store/session": { body: { challenge: "c" } },
    "POST /api/market/dev/store/session": { body: { token: "t", customer_id: "cus", buyer_person_id: "06GSELLER0000000000000000A", email: "x@market.invalid" } },
    ...extra,
  };
}

test("live mode discloses no demo login: connecting without a wallet asks for login", async () => {
  const { fetchImpl, calls } = scriptedFetch({ "GET /api/market/dev/store/config": { body: LIVE } });
  const out = await createMarketClient({ fetchImpl }).connect();
  assert.equal(out.ok, false);
  assert.equal((out as { ok: false; reason: string }).reason, "login_required");
  assert.ok(!calls.some(c => c.url.includes("emailpass")));
});

test("the wallet signs only the operation pinned to the clicked action, never a swapped one", async () => {
  const { wallet, signedOps } = liveWallet();
  const { fetchImpl, calls } = scriptedFetch(liveRoutes({
    "POST /api/market/dev/store/prepare": { body: { op: "commerce.order.authorize", params: {}, person: wallet.personId } },
  }));
  const client = createMarketClient({ fetchImpl, wallet });
  await client.connect();
  const out = await client.markMilestone("stock", "order_1");
  assert.equal(out.ok, false);
  assert.equal(signedOps.filter(o => o.op !== "commerce.session.create").length, 0);
  assert.ok(!calls.some(c => c.url.includes("dev/store/sign")));
});

test("live seller milestone: wallet signs its own deliver; another person's op is refused with no dev signer", async () => {
  const { wallet, signedOps } = liveWallet();
  const ok = scriptedFetch(liveRoutes({
    "POST /api/market/dev/store/prepare": { body: { op: "commerce.order.deliver", params: { order_id: "o" }, person: wallet.personId } },
    "POST /api/market/dev/interfacer/orders/o/deliver": { body: { receipt: { id: "r", action: "transfer" } } },
  }));
  const seller = createMarketClient({ fetchImpl: ok.fetchImpl, wallet });
  await seller.connect();
  assert.equal((await seller.markSold("stock", "o")).ok, true);
  assert.equal(ok.calls.find(c => c.url.endsWith("/deliver"))!.headers["X-Interfacer-Auth"], "H:commerce.order.deliver");
  const other = scriptedFetch(liveRoutes({
    "POST /api/market/dev/store/prepare": { body: { op: "commerce.order.deliver", params: { order_id: "o" }, person: "06GSOMEONEELSE00000000000A" } },
  }));
  const client = createMarketClient({ fetchImpl: other.fetchImpl, wallet });
  await client.connect();
  assert.equal((await client.markSold("stock", "o")).ok, false);
  assert.ok(!other.calls.some(c => c.url.includes("dev/store/sign")));
  assert.equal(signedOps.filter(o => o.op === "commerce.order.deliver").length, 1);
});

test("listProduct owner-signs create, publish and stock allocation for the person's own resource", async () => {
  const { wallet, signedOps } = liveWallet();
  const { fetchImpl, calls } = scriptedFetch(liveRoutes({
    "POST /api/market/dev/interfacer/listings/live": { status: 201, body: { binding: { id: "iflb_1" } } },
    "POST /api/market/dev/interfacer/listings/iflb_1/publish": { body: {} },
    "POST /api/market/dev/interfacer/listings/iflb_1/checkout": { body: {} },
  }));
  const client = createMarketClient({ fetchImpl, wallet });
  await client.connect();
  const out = await client.listProduct("06GRESOURCE00000000000000A", 24.5);
  assert.equal(out.ok, true);
  assert.deepEqual(signedOps.filter(o => o.op !== "commerce.session.create").map(o => [o.op, o.params]), [
    ["commerce.listing.live.create", { resource_id: "06GRESOURCE00000000000000A" }],
    ["commerce.listing.publish", { listing_id: "iflb_1", priceEUR: 24.5 }],
    ["commerce.listing.checkout.setup", { listing_id: "iflb_1" }],
  ]);
  assert.deepEqual(calls.find(c => c.url.endsWith("/publish"))!.body, { priceEUR: 24.5 });
});

test("an upstream refusal surfaces as ok:false with the reason", async () => {
  const { fetchImpl } = scriptedFetch({
    "GET /api/market/dev/store/config": { body: SCENE },
    "POST /api/market/auth/customer/emailpass": { body: { token: "t" } },
    "POST /api/market/dev/interfacer/match": { status: 400, body: { reason: "demo_product_required" } },
  });
  const client = createMarketClient({ fetchImpl });
  await client.connect();
  const out = await client.match("design_1");
  assert.equal(out.ok, false);
  assert.equal((out as { ok: false; reason: string }).reason, "demo_product_required");
});

test("logged-in buyers authenticate with a signed challenge, not the disclosed fixture login", async () => {
  const { fetchImpl, calls } = scriptedFetch({
    "GET /api/market/dev/store/config": { body: SCENE },
    "GET /api/market/dev/store/session": { body: { challenge: "one-use" } },
    "POST /api/market/dev/store/session": { body: { token: "real-token", customer_id: "cus_real", buyer_person_id: "real-person", email: "real@market.invalid" } },
    "POST /api/market/dev/store/prepare": { body: { op: "commerce.order.dev.capture", params: { order_id: "order_1" }, person: "real-person" } },
    "POST /api/market/dev/store/capture": { body: { captured: true } },
  });
  const signed: unknown[] = [];
  const client = createMarketClient({ fetchImpl, wallet: { personId: "real-person", sign: async op => { signed.push(op); return "REAL_PROOF"; } } });
  assert.equal((await client.connect()).ok, true);
  assert.equal(client.scene?.buyer_person_id, "real-person");
  assert.equal(client.scene?.customer_id, "cus_real");
  assert.ok(!calls.some(c => c.url.includes("emailpass")));
  assert.deepEqual(signed[0], { op: "commerce.session.create", params: { challenge: "one-use" }, person: "real-person" });
  await client.signed("/api/market/dev/store/capture", { orderId: "order_1" }, { action: "capture", orderId: "order_1" });
  assert.equal(calls[calls.length - 1].headers["X-Interfacer-Auth"], "REAL_PROOF");
  assert.ok(!calls.some(c => c.url.endsWith("/sign")));
});

test("a failed real-buyer session never falls back to the demo account", async () => {
  const { fetchImpl, calls } = scriptedFetch({
    "GET /api/market/dev/store/config": { body: SCENE },
    "GET /api/market/dev/store/session": { body: { challenge: "one-use" } },
    "POST /api/market/dev/store/session": { status: 403, body: { reason: "authorization_denied" } },
  });
  const client = createMarketClient({ fetchImpl, wallet: { personId: "real-person", sign: async () => "PROOF" } });
  assert.deepEqual(await client.connect(), { ok: false, reason: "authorization_denied" });
  assert.ok(!calls.some(c => c.url.includes("emailpass")));
  await assert.rejects(client.signed("/api/market/dev/store/capture", {}, {}));
});

test("the low-level api throws a MarketError carrying the reason on a non-ok response", async () => {
  const { fetchImpl } = scriptedFetch({
    "GET /api/market/dev/store/config": { body: SCENE },
    "POST /api/market/auth/customer/emailpass": { body: { token: "t" } },
    "GET /api/market/dev/interfacer/designs": { status: 403, body: { reason: "local_storefront_only" } },
  });
  const client = createMarketClient({ fetchImpl });
  await client.connect();
  await assert.rejects(
    () => client.api("/api/market/dev/interfacer/designs"),
    (e: unknown) => e instanceof MarketError && (e as MarketError).reason === "local_storefront_only"
  );
});
