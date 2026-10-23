// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import assert from "node:assert/strict";
import { test } from "node:test";
import { proxy } from "../../pages/api/market/[...path]";

type Captured = {
  status?: number;
  body?: unknown;
  headers: Record<string, string>;
};

function mockRes() {
  const cap: Captured = { headers: {} };
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

function mockReq(opts: {
  method?: string;
  path: string[];
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
}) {
  return {
    method: opts.method ?? "GET",
    url: opts.url ?? "/api/market/" + opts.path.join("/"),
    query: { path: opts.path },
    headers: { host: "localhost:3002", ...opts.headers },
    socket: { remoteAddress: "127.0.0.1" },
    body: opts.body,
  } as any;
}

function mockUpstream(status: number, bodyObj: unknown, headers: Record<string, string> = {}) {
  const calls: any[] = [];
  const fetchImpl = async (url: string, init: any) => {
    calls.push({ url, init });
    return {
      status,
      ok: status < 400,
      headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
      text: async () => JSON.stringify(bodyObj),
    } as any;
  };
  return { fetchImpl: fetchImpl as unknown as typeof fetch, calls };
}

test("rejects a path outside the allowlist without calling upstream", async () => {
  const { res, cap } = mockRes();
  const { fetchImpl, calls } = mockUpstream(200, {});
  await proxy(mockReq({ path: ["admin", "users"] }), res, fetchImpl, "http://up");
  assert.equal(cap.status, 400);
  assert.deepEqual(cap.body, { reason: "market_path_forbidden" });
  assert.equal(calls.length, 0, "forbidden path must not reach upstream");
});

test("rejects a traversal segment (dots) without calling upstream", async () => {
  const { res, cap } = mockRes();
  const { fetchImpl, calls } = mockUpstream(200, {});
  await proxy(mockReq({ path: ["store", "..", "secret"] }), res, fetchImpl, "http://up");
  assert.equal(cap.status, 400);
  assert.equal(calls.length, 0);
});

test("forwards method, body, query, and the three headers to the right upstream URL", async () => {
  const { res } = mockRes();
  const { fetchImpl, calls } = mockUpstream(200, { ok: true });
  await proxy(
    mockReq({
      method: "POST",
      path: ["store", "carts"],
      url: "/api/market/store/carts?region_id=reg_1",
      headers: {
        "x-interfacer-auth": "SIGVALUE",
        "x-publishable-api-key": "pk_123",
        authorization: "Bearer tok_9",
      },
      body: { region_id: "reg_1" },
    }),
    res,
    fetchImpl,
    "http://up:9000"
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "http://up:9000/store/carts?region_id=reg_1");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.body, JSON.stringify({ region_id: "reg_1" }));
  assert.equal(calls[0].init.headers["x-interfacer-auth"], "SIGVALUE");
  assert.equal(calls[0].init.headers["x-publishable-api-key"], "pk_123");
  assert.equal(calls[0].init.headers["authorization"], "Bearer tok_9");
});

test("relays upstream status and body unchanged on refusal", async () => {
  const { res, cap } = mockRes();
  const { fetchImpl } = mockUpstream(400, { reason: "demo_cart_required" });
  await proxy(
    mockReq({ path: ["dev", "interfacer", "orders", "order_01X", "deliver"], method: "POST" }),
    res,
    fetchImpl,
    "http://up"
  );
  assert.equal(cap.status, 400);
  assert.deepEqual(JSON.parse(cap.body as string), { reason: "demo_cart_required" });
});

test("relays the upstream x-interfacer-auth response header", async () => {
  const { res, cap } = mockRes();
  const { fetchImpl } = mockUpstream(200, {}, { "x-interfacer-auth": "RESP_SIG" });
  await proxy(mockReq({ path: ["dev", "store", "sign"], method: "POST", body: {} }), res, fetchImpl, "http://up");
  assert.equal(cap.headers["x-interfacer-auth"], "RESP_SIG");
});

test("returns 502 with a reason when the upstream is unreachable", async () => {
  const { res, cap } = mockRes();
  const fetchImpl = async () => {
    throw new Error("ECONNREFUSED");
  };
  await proxy(mockReq({ path: ["dev", "store", "config"] }), res, fetchImpl as any, "http://up");
  assert.equal(cap.status, 502);
  assert.deepEqual(cap.body, { reason: "market_upstream_unreachable" });
});

test("keeps the local-only boundary at the proxy, including host rebinding, cross-site and production", async () => {
  const { fetchImpl, calls } = mockUpstream(200, {});
  const remote = mockReq({ path: ["dev", "store", "config"] });
  remote.socket.remoteAddress = "10.0.0.2";
  for (const req of [remote,
    mockReq({ path: ["dev", "store", "config"], headers: { host: "evil.test:3002" } }),
    mockReq({ path: ["dev", "store", "session"], method: "POST", headers: { origin: "http://evil.test" } }),
    mockReq({ path: ["dev", "store", "config"], headers: { "sec-fetch-site": "cross-site" } })]) {
    const { res, cap } = mockRes();
    await proxy(req, res, fetchImpl, "http://up");
    assert.equal(cap.status, 403);
  }
  const env: Record<string, string | undefined> = process.env;
  const previous = env.NODE_ENV;
  env.NODE_ENV = "production";
  try {
    const { res, cap } = mockRes();
    await proxy(mockReq({ path: ["dev", "store", "config"] }), res, fetchImpl, "http://up");
    assert.equal(cap.status, 403);
  } finally { if (previous === undefined) delete env.NODE_ENV; else env.NODE_ENV = previous; }
  assert.equal(calls.length, 0);
});

test("allows session and prepare but refuses unsupported methods", async () => {
  const { fetchImpl, calls } = mockUpstream(200, {});
  for (const path of ["session", "prepare"]) {
    const { res, cap } = mockRes();
    await proxy(mockReq({ path: ["dev", "store", path], method: "POST", headers: { origin: "http://localhost:3002" } }), res, fetchImpl, "http://up");
    assert.equal(cap.status, 200);
    assert.equal(cap.headers["cache-control"], "no-store");
  }
  const { res, cap } = mockRes();
  await proxy(mockReq({ path: ["store", "carts"], method: "DELETE" }), res, fetchImpl, "http://up");
  assert.equal(cap.status, 405);
  assert.equal(calls.length, 2);
});

test("allows an uppercase Medusa id in the path (real order/variant ids)", async () => {
  const { res, cap } = mockRes();
  const { fetchImpl, calls } = mockUpstream(200, { order: {} });
  await proxy(
    mockReq({
      path: ["store", "orders", "order_01M5GW32D4SKX2J24SJWMCM4KH"],
      url: "/api/market/store/orders/order_01M5GW32D4SKX2J24SJWMCM4KH?fields=id",
    }),
    res,
    fetchImpl,
    "http://up"
  );
  assert.equal(cap.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "http://up/store/orders/order_01M5GW32D4SKX2J24SJWMCM4KH?fields=id");
});
