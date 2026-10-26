// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
import assert from "node:assert/strict";
import { test } from "node:test";
import { checkRelayBody, RELAY_QUERIES } from "../../lib/market/relay";

const me = "06GSELLER0000000000000000A";
const buyer = "06GBUYER00000000000000000A";
const body = (query: string, variables: unknown) => JSON.stringify({ query, variables });
const transfer = (e: Record<string, unknown>) =>
  body(RELAY_QUERIES.transfer, { e: { action: "transfer", provider: me, receiver: buyer, ...e } });

test("the three marketplace write shapes are signable by their provider", () => {
  assert.doesNotThrow(() =>
    checkRelayBody("process", body(RELAY_QUERIES.process, { p: { name: "x", finished: true } }), me, buyer)
  );
  assert.doesNotThrow(() =>
    checkRelayBody(
      "create",
      body(RELAY_QUERIES.create, { e: { action: "produce", provider: me, receiver: me }, r: { note: "n" } }),
      me,
      buyer
    )
  );
  assert.doesNotThrow(() => checkRelayBody("transfer", transfer({}), me, buyer));
  assert.doesNotThrow(() =>
    checkRelayBody(
      "transfer",
      body(RELAY_QUERIES.transferMarked, {
        e: { action: "transfer", provider: me, receiver: buyer },
        r: { note: "n" },
      }),
      me,
      buyer
    )
  );
});

test("anything else is refused: other provider, other receiver, other mutation, extra variables", () => {
  for (const [step, b] of [
    ["transfer", transfer({ provider: "06GSOMEONE0000000000000000" })],
    ["transfer", transfer({ receiver: "06GATTACKER000000000000000" })],
    ["transfer", body(RELAY_QUERIES.transfer, { e: { action: "transfer", provider: me, receiver: buyer }, extra: 1 })],
    [
      "transfer",
      body('mutation { deletePerson(id: "x") }', { e: { action: "transfer", provider: me, receiver: buyer } }),
    ],
    ["create", body(RELAY_QUERIES.create, { e: { action: "produce", provider: me, receiver: buyer }, r: {} })],
    ["create", body(RELAY_QUERIES.create, { e: { action: "lower", provider: me, receiver: me }, r: {} })],
    ["process", body(RELAY_QUERIES.process, { p: { name: "x", finished: false } })],
    [
      "transfer",
      body(RELAY_QUERIES.transferMarked, {
        e: { action: "transfer", provider: me, receiver: buyer },
        r: { note: "n", name: "x" },
      }),
    ],
    ["transfer", "not json"],
  ] as const)
    assert.throws(() => checkRelayBody(step, b, me, buyer), /relay_body_refused/, b);
});
