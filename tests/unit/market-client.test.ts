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
