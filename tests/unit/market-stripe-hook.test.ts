// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import assert from "node:assert/strict";
import { test } from "node:test";
import { Readable } from "node:stream";
import { relayStripeWebhook } from "../../pages/api/market-hooks/stripe";

const PILOT = {
  MARKET_PROXY_MODE: "pilot",
  MEDUSA_INTERNAL_URL: "http://medusa:9000",
  MEDUSA_PROXY_KEY: "k".repeat(40),
};

function mockRes() {
  const cap: { status?: number; body?: unknown; headers: Record<string, string> } = { headers: {} };
  const res = {
    status(code: number) {
      cap.status = code;
      return res;
    },
    json(obj: unknown) {
      cap.body = obj;
      return res;
    },
    send(text: unknown) {
      cap.body = text;
      return res;
    },
    setHeader(k: string, v: string) {
      cap.headers[k.toLowerCase()] = v;
    },
  };
  return { res: res as any, cap };
}

function mockReq(body: string, headers: Record<string, string> = {}, method = "POST") {
  const req = Readable.from([Buffer.from(body)]) as any;
  req.method = method;
  req.headers = { "content-type": "application/json", ...headers };
  return req;
}

test("forwards Stripe's exact bytes and signature to Medusa's payment webhook, with the proxy key", async () => {
  const raw = '{"id":"evt_1",  "type":"payment_intent.succeeded"}'; // spacing kept: it is what Stripe signed
  let seen: { url: string; init: any } | undefined;
  const fetchImpl = (async (url: string, init: any) => {
    seen = { url, init };
    return new Response("OK", { status: 200 });
  }) as any;
  const { res, cap } = mockRes();
  await relayStripeWebhook(mockReq(raw, { "stripe-signature": "t=1,v1=abc" }), res, fetchImpl, PILOT);
  assert.equal(cap.status, 200);
  assert.equal(seen?.url, "http://medusa:9000/hooks/payment/stripe_stripe");
  assert.equal(Buffer.from(seen?.init.body).toString(), raw);
  assert.equal(seen?.init.headers["stripe-signature"], "t=1,v1=abc");
  assert.equal(seen?.init.headers["x-interfacer-proxy-key"], "k".repeat(40));
});

test("refuses unsigned, oversized or non-POST calls without contacting Medusa", async () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls++;
    return new Response("OK");
  }) as any;
  for (const [req, status] of [
    [mockReq("{}"), 400],
    [mockReq("{}", { "stripe-signature": "x" }, "GET"), 405],
    [mockReq("x".repeat(600 * 1024), { "stripe-signature": "x" }), 413],
  ] as const) {
    const { res, cap } = mockRes();
    await relayStripeWebhook(req, res, fetchImpl, PILOT);
    assert.equal(cap.status, status);
  }
  assert.equal(calls, 0);
});

test("Medusa's verdict is passed on, so Stripe retries a rejected or failed delivery", async () => {
  const { res, cap } = mockRes();
  await relayStripeWebhook(
    mockReq("{}", { "stripe-signature": "bad" }),
    res,
    (async () => new Response("Webhook Error", { status: 400 })) as any,
    PILOT
  );
  assert.equal(cap.status, 400);
  const down = mockRes();
  await relayStripeWebhook(
    mockReq("{}", { "stripe-signature": "x" }),
    down.res,
    (async () => {
      throw new Error("ECONNREFUSED");
    }) as any,
    PILOT
  );
  assert.equal(down.cap.status, 502);
});

test("a production GUI without the pilot proxy configured relays nothing", async () => {
  const { res, cap } = mockRes();
  await relayStripeWebhook(mockReq("{}", { "stripe-signature": "x" }), res, fetch, { NODE_ENV: "production" });
  assert.equal(cap.status, 503);
});
