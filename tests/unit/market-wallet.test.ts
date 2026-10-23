// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createPrivateKey, createPublicKey, verify } from "node:crypto";
import { canonicalOperation, createBuyerWallet, decodeBase58 } from "../../lib/market/wallet";

// Public deterministic test seed (32 bytes of 0x07), NOT an account credential.
const seed = "US517G5965aydkZ46HS38QLi7UQiSojurfbQfKCELFx";
const person = "06GP97B63276AAAAAAAAAAAAAA";

test("base58 decoder matches Zenroom's keyring representation and preserves leading zeroes", () => {
  assert.deepEqual(Buffer.from(decodeBase58(seed)), Buffer.alloc(32, 7));
  assert.deepEqual(Array.from(decodeBase58("1112")), [0, 0, 0, 1]);
  for (const s of ["", "0OIl", "a".repeat(101)]) assert.throws(() => decodeBase58(s));
});

test("browser wallet signs exact canonical UTF8 bytes with the existing Zenroom seed; key is never in the proof", async () => {
  const params = { z: [1, false, null], name: "Unicode — café with spaces" };
  const header = await createBuyerWallet(person, () => seed).sign({ person, op: "commerce.order.authorize", params });
  const auth = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
  const privateKey = createPrivateKey({ key: Buffer.from("302e020100300506032b657004220420" + "07".repeat(32), "hex"), type: "pkcs8", format: "der" });
  assert.ok(verify(null, new TextEncoder().encode(canonicalOperation(auth.envelope)), createPublicKey(privateKey), Uint8Array.from(Buffer.from(auth.signature, "base64"))));
  assert.deepEqual(auth.envelope.params, params);
  assert.equal(auth.envelope.person_id, person);
  assert.match(auth.envelope.nonce, /^[0-9a-f]{32}$/);
  assert.ok(!JSON.stringify(auth).includes(seed));
  assert.deepEqual(Object.keys(auth).sort(), ["envelope", "signature"]);
  // Pin compatibility to the actual Zenroom EdDSA implementation, not only a
  // second implementation with the same guessed key encoding.
  const { zencode_exec } = await import("zenroom");
  const { result } = await zencode_exec(
    "Scenario eddsa\nGiven I have the 'keyring'\nGiven I have a 'string' named 'payload'\n" +
    "When I create the eddsa signature of 'payload'\nThen print the 'eddsa signature' as 'base64'",
    { keys: JSON.stringify({ keyring: { eddsa: seed } }), data: JSON.stringify({ payload: canonicalOperation(auth.envelope) }) }
  );
  assert.equal(JSON.parse(result).eddsa_signature, auth.signature);
});

test("wallet refuses supplier actions and another person; canonicalizer rejects non-JSON", async () => {
  const wallet = createBuyerWallet(person, () => seed);
  await assert.rejects(wallet.sign({ person: "other", op: "commerce.order.authorize", params: {} }));
  await assert.rejects(wallet.sign({ person, op: "commerce.order.deliver", params: {} }));
  for (const v of [undefined, NaN, Infinity, { a: undefined }]) assert.throws(() => canonicalOperation(v));
  assert.equal(canonicalOperation({ z: 1, a: [2, 1] }), '{"a":[2,1],"z":1}');
});
