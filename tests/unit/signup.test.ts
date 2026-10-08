// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import assert from "node:assert/strict";
import { test } from "node:test";
import type { NextApiRequest, NextApiResponse } from "next";
import { createSignupHandler } from "../../lib/server/signup";
import { registerViaSignupApi, SignupInput } from "../../lib/signup";
import { config } from "../../pages/api/signup";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const input: SignupInput = {
  name: "Local fixture",
  user: "local-fixture",
  email: "fixture@example.invalid",
  eddsaPublicKey: "fake-eddsa-public-key",
  reflowPublicKey: "fake-reflow-public-key",
  ethereumAddress: "fake-ethereum-address",
  ecdhPublicKey: "fake-ecdh-public-key",
  bitcoinPublicKey: "fake-bitcoin-public-key",
};
const agent = { id: "fixture-id", name: input.name, user: input.user, email: input.email };
const env = () => ({
  ZENFLOWS_ADMIN: "TEST-ONLY-ADMIN-SENTINEL",
  ZENFLOWS_URL: "https://upstream.example.invalid/api",
});

function request(body: unknown = input, overrides: Partial<NextApiRequest> = {}): NextApiRequest {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  } as NextApiRequest;
}

function response() {
  const result = { status: 200, headers: {} as Record<string, string>, body: undefined as unknown };
  const res = {
    setHeader(key: string, value: string) {
      result.headers[key] = value;
      return res;
    },
    status(status: number) {
      result.status = status;
      return res;
    },
    json(body: unknown) {
      result.body = body;
      return res;
    },
  } as unknown as NextApiResponse;
  return { res, result };
}

const successfulFetch: typeof fetch = async () => Response.json({ data: { createPerson: { agent } } });

test("server uses a fixed operation, configured endpoint and server-only credential", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async (url, options) => {
    calls++;
    assert.equal(url, env().ZENFLOWS_URL);
    assert.equal(options?.method, "POST");
    assert.equal(options?.redirect, "error");
    assert.ok(options?.signal instanceof AbortSignal);
    assert.deepEqual(options?.headers, {
      "Content-Type": "application/json",
      "zenflows-admin": env().ZENFLOWS_ADMIN,
    });
    const body = JSON.parse(options?.body as string);
    assert.equal(body.operationName, "SignUp");
    assert.match(body.query, /createPerson/);
    assert.doesNotMatch(body.query, /deletePerson|importRepos/);
    assert.deepEqual(body.variables, input);
    return Response.json({ data: { createPerson: { agent: { ...agent, secret: env().ZENFLOWS_ADMIN } } } });
  };
  const { res, result } = response();
  await createSignupHandler({ env, fetcher })(
    request(input, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "zenflows-admin": "caller-controlled",
        authorization: "must-not-forward",
      },
    }),
    res
  );
  assert.equal(calls, 1);
  assert.equal(result.status, 201);
  assert.equal(result.headers["Cache-Control"], "no-store");
  assert.deepEqual(result.body, { agent });
  assert.ok(!JSON.stringify(result.body).includes(env().ZENFLOWS_ADMIN));
});

for (const method of ["GET", "PUT", "DELETE", "OPTIONS"]) {
  test(`rejects ${method} without contacting the upstream`, async () => {
    const { res, result } = response();
    await createSignupHandler({
      env,
      fetcher: async () => {
        assert.fail("unexpected upstream call");
      },
    })(request(input, { method }), res);
    assert.equal(result.status, 405);
    assert.equal(result.headers.Allow, "POST");
  });
}

test("rejects non-JSON content types", async () => {
  const { res, result } = response();
  await createSignupHandler({ env, fetcher: successfulFetch })(
    request(input, { headers: { "content-type": "text/plain" } }),
    res
  );
  assert.equal(result.status, 415);
});

const invalidInputs: [string, unknown][] = [
  ["null", null],
  ["array", [input]],
  ["raw JSON string", JSON.stringify(input)],
  ["empty name", { ...input, name: " " }],
  ["oversized name", { ...input, name: "a".repeat(201) }],
  ["invalid email", { ...input, email: "not-an-email" }],
  ["control characters", { ...input, user: "bad\nuser" }],
  ["invalid key encoding", { ...input, eddsaPublicKey: "spaces not allowed" }],
  ["missing key", { ...input, eddsaPublicKey: undefined }],
  ["extra operation", { ...input, query: "mutation { deletePerson }" }],
  ["extra URL", { ...input, url: "https://other.example.invalid" }],
  ["extra role", { ...input, isVerified: true }],
  ["private key", { ...input, eddsaPrivateKey: "must-never-be-sent" }],
  ["seed", { ...input, seed: "must-never-be-sent" }],
  ["HMAC", { ...input, HMAC: "must-never-be-sent" }],
];
for (const [label, body] of invalidInputs) {
  test(`rejects invalid or non-allowlisted input: ${label}`, async () => {
    const { res, result } = response();
    await createSignupHandler({
      env,
      fetcher: async () => {
        assert.fail("unexpected upstream call");
      },
    })(request(body), res);
    assert.equal(result.status, 400);
  });
}

test("missing server settings fail closed; there is no public-env fallback", async () => {
  for (const settings of [
    {},
    { ZENFLOWS_URL: env().ZENFLOWS_URL },
    { ZENFLOWS_ADMIN: env().ZENFLOWS_ADMIN },
    { ...env(), ZENFLOWS_URL: "file:///etc/passwd" },
    { ...env(), ZENFLOWS_URL: "https://user:password@example.invalid" },
  ]) {
    const { res, result } = response();
    await createSignupHandler({
      env: () => settings,
      fetcher: async () => {
        assert.fail("unexpected upstream call");
      },
    })(request(), res);
    assert.equal(result.status, 503);
  }
});

test("rate limit counts invalid attempts, ignores spoofed forwarded headers, and expires", async () => {
  let time = 1000;
  let calls = 0;
  const handler = createSignupHandler({
    env,
    now: () => time,
    fetcher: async () => {
      calls++;
      return successfulFetch("");
    },
  });
  for (let i = 0; i < 5; i++) {
    const { res, result } = response();
    await handler(request(null), res);
    assert.equal(result.status, 400);
  }
  const blocked = response();
  await handler(
    request(input, { headers: { "content-type": "application/json", "x-forwarded-for": "different-address" } }),
    blocked.res
  );
  assert.equal(blocked.result.status, 429);
  assert.equal(blocked.result.headers["Retry-After"], "600");
  assert.equal(calls, 0);
  time += 600000;
  const allowed = response();
  await handler(request(), allowed.res);
  assert.equal(allowed.result.status, 201);
  assert.equal(calls, 1);
});

for (const [label, fetcher, status] of [
  ["HTTP failure", async () => new Response(env().ZENFLOWS_ADMIN, { status: 500 }), 502],
  ["GraphQL failure", async () => Response.json({ errors: [{ message: env().ZENFLOWS_ADMIN }] }), 400],
  ["invalid JSON", async () => new Response(env().ZENFLOWS_ADMIN), 502],
  ["missing agent", async () => Response.json({ data: null }), 502],
  ["invalid agent", async () => Response.json({ data: { createPerson: { agent: { ...agent, id: null } } } }), 502],
  [
    "network failure",
    async () => {
      throw new Error(env().ZENFLOWS_ADMIN);
    },
    502,
  ],
] as const) {
  test(`sanitizes ${label}`, async () => {
    const { res, result } = response();
    await createSignupHandler({ env, fetcher })(request(), res);
    assert.equal(result.status, status);
    assert.ok(!JSON.stringify(result.body).includes(env().ZENFLOWS_ADMIN));
  });
}

test("aborts a stalled upstream request", { timeout: 20000 }, async () => {
  const fetcher: typeof fetch = async (_url, options) =>
    new Promise((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(new Error("abort")), { once: true });
    });
  const { res, result } = response();
  await createSignupHandler({ env, fetcher })(request(), res);
  assert.equal(result.status, 502);
});

test("browser sends only public registration fields and preserves SDK auth storage", async () => {
  const stored = new Map<string, string>();
  const store = {
    setItem: (key: string, value: string) => {
      stored.set(key, value);
    },
  };
  const fetcher: typeof fetch = async (url, options) => {
    assert.equal(url, "/api/signup");
    assert.deepEqual(options?.headers, { "Content-Type": "application/json" });
    assert.equal(options?.credentials, "same-origin");
    assert.deepEqual(JSON.parse(options?.body as string), input);
    return Response.json({ agent }, { status: 201 });
  };
  await registerViaSignupApi({ ...input, seed: "PRIVATE", HMAC: "PRIVATE" } as SignupInput, store, fetcher);
  assert.deepEqual(Object.fromEntries(stored), {
    authId: agent.id,
    authName: agent.name,
    authUsername: agent.user,
    authEmail: agent.email,
  });
});

test("browser failures never persist partial authentication or display upstream messages", async () => {
  for (const failure of [
    Response.json({ error: "SECRET" }, { status: 400 }),
    Response.json({ agent: { id: "partial" } }),
  ]) {
    const store = { setItem: () => assert.fail("unexpected storage mutation") };
    await assert.rejects(
      registerViaSignupApi(input, store, async () => failure),
      error => {
        assert.ok(error instanceof Error);
        assert.ok(!error.message.includes("SECRET"));
        return true;
      }
    );
  }
});

test("body parser is bounded and browser modules contain no admin configuration", () => {
  assert.equal(config.api.bodyParser.sizeLimit, "16kb");
  for (const file of ["contexts/AuthContext.tsx", "lib/signup.ts"]) {
    const source = readFileSync(resolve(__dirname, "../..", file), "utf8");
    assert.doesNotMatch(source, /NEXT_PUBLIC_ZENFLOWS_ADMIN|zenflowsAdmin|process\.env\.ZENFLOWS_ADMIN/);
    assert.doesNotMatch(source, /lib\/server/);
  }
});
