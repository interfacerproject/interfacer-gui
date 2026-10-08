// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import assert from "node:assert/strict";
import { test } from "node:test";
import { completeSignup, signupErrorMessage } from "../../lib/signupCompletion";

function fixture() {
  const calls: string[] = [];
  const failures: string[] = [];
  return {
    calls,
    failures,
    steps: {
      signup: async () => {
        calls.push("signup");
      },
      login: async () => {
        calls.push("login");
      },
      sendEmailVerification: async () => {
        calls.push("email");
      },
      claimDid: async () => {
        calls.push("did");
      },
      navigateHome: async () => {
        calls.push("home");
      },
      onFollowUpFailure: (name: string) => {
        failures.push(name);
      },
    },
  };
}

const flush = () => new Promise<void>(resolve => setImmediate(resolve));

test("creates and logs in before redirecting; both follow-ups are attempted", async () => {
  const { steps, calls, failures } = fixture();
  await completeSignup(steps);
  await flush();
  assert.deepEqual(calls.slice(0, 2), ["signup", "login"]);
  assert.ok(calls.includes("home"));
  assert.ok(calls.includes("email"));
  assert.ok(calls.includes("did"));
  assert.deepEqual(failures, []);
});

test("email verification rejection cannot block an authenticated user's redirect or DID claim", async () => {
  const { steps, calls, failures } = fixture();
  steps.sendEmailVerification = async () => {
    throw new Error("Email service unavailable");
  };
  await completeSignup(steps);
  await flush();
  assert.ok(calls.includes("home"));
  assert.ok(calls.includes("did"));
  assert.deepEqual(failures, ["email-verification"]);
});

test("a failed DID claim cannot block navigation or email verification", async () => {
  const { steps, calls, failures } = fixture();
  steps.claimDid = async () => {
    throw new Error("DID service unavailable");
  };
  await completeSignup(steps);
  await flush();
  assert.ok(calls.includes("home"));
  assert.ok(calls.includes("email"));
  assert.deepEqual(failures, ["did-claim"]);
});

test("synchronous follow-up throws are also contained", async () => {
  const { steps, calls, failures } = fixture();
  steps.sendEmailVerification = () => {
    throw new Error("Synchronous email error");
  };
  steps.claimDid = () => {
    throw new Error("Synchronous DID error");
  };
  await completeSignup(steps);
  await flush();
  assert.ok(calls.includes("home"));
  assert.deepEqual(failures.sort(), ["did-claim", "email-verification"]);
});

test("a stalled email request does not delay navigation or DID setup", async () => {
  const { steps, calls } = fixture();
  steps.sendEmailVerification = () => new Promise(() => {});
  await completeSignup(steps);
  await flush();
  assert.ok(calls.includes("home"));
  assert.ok(calls.includes("did"));
});

test("a stalled DID claim does not delay navigation or email", async () => {
  const { steps, calls } = fixture();
  steps.claimDid = () => new Promise(() => {});
  await completeSignup(steps);
  await flush();
  assert.ok(calls.includes("home"));
  assert.ok(calls.includes("email"));
});

test("creation failures stop login, follow-ups and navigation", async () => {
  const { steps, calls, failures } = fixture();
  const error = new Error("Registration unavailable");
  steps.signup = async () => {
    throw error;
  };
  await assert.rejects(completeSignup(steps), candidate => candidate === error);
  await flush();
  assert.deepEqual(calls, []);
  assert.deepEqual(failures, []);
});

test("login failures stop follow-ups and navigation without hiding the error", async () => {
  const { steps, calls, failures } = fixture();
  const error = new Error("Login unavailable");
  steps.login = async () => {
    throw error;
  };
  await assert.rejects(completeSignup(steps), candidate => candidate === error);
  await flush();
  assert.deepEqual(calls, ["signup"]);
  assert.deepEqual(failures, []);
});

test("Error objects show their message, not JSON.stringify's empty object", () => {
  assert.equal(JSON.stringify(new Error("Readable message")), "{}");
  assert.equal(signupErrorMessage(new Error("Readable message"), "fallback"), "Readable message");
  assert.equal(signupErrorMessage({ message: "GraphQL message" }, "fallback"), "GraphQL message");
  assert.equal(signupErrorMessage("Network unavailable", "fallback"), "Network unavailable");
});

test("missing/unusable messages produce a localized fallback, never an empty object", () => {
  for (const error of [{}, null, undefined, "", " ", { message: 42 }, new Error("")]) {
    assert.equal(signupErrorMessage(error, "Riprova la registrazione."), "Riprova la registrazione.");
  }
});
