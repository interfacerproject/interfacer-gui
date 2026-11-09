// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

// Same canonical bytes as Medusa's envelope-canonical.ts, including Unicode,
// whitespace INSIDE strings and nested key ordering. Do not use signGraphQLRequest:
// that contract removes spaces from the signed message.
export function canonicalOperation(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalOperation).join(",") + "]";
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const obj = value as Record<string, unknown>;
    return (
      "{" +
      Object.keys(obj)
        .sort()
        .map(k => JSON.stringify(k) + ":" + canonicalOperation(obj[k]))
        .join(",") +
      "}"
    );
  }
  throw new Error("invalid_canonical_operation");
}

export interface PreparedOperation {
  op: string;
  params: unknown;
  person: string;
}
export interface BuyerWallet {
  personId: string;
  sign: (operation: PreparedOperation) => Promise<string>;
}

// Zenroom stores Ed25519 seeds as base58. This is the same decoder as the
// server's registry adapter, tested against real Zenroom/Node/WebCrypto keys.
export function decodeBase58(value: string): Uint8Array {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  if (!value || value.length > 100) throw new Error("invalid_base58_key");
  const bytes: number[] = [];
  for (const ch of value) {
    let carry = alphabet.indexOf(ch);
    if (carry < 0) throw new Error("invalid_base58_key");
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58;
      bytes[i] = carry & 255;
      carry >>= 8;
    }
    while (carry) {
      bytes.push(carry & 255);
      carry >>= 8;
    }
  }
  for (const ch of value) {
    if (ch !== "1") break;
    bytes.push(0);
  }
  return Uint8Array.from(bytes.reverse());
}

export const BUYER_OPS = [
  "commerce.session.create",
  "commerce.order.authorize",
  "commerce.order.build.purchase",
  "commerce.order.dev.capture",
];
// Seller/owner operations a person signs for THEIR OWN resources, listings and
// sold orders. Medusa still verifies the signer is the registered owner/seller.
export const SELLER_OPS = [
  "catalog.design.register",
  "catalog.service.register",
  "commerce.listing.live.create",
  "commerce.listing.publish",
  "commerce.listing.checkout.setup",
  "commerce.order.deliver",
  "commerce.order.produce",
];

export function createBuyerWallet(personId: string, getSeed: () => string): BuyerWallet {
  return createMarketWallet(personId, getSeed, BUYER_OPS);
}

// Signs only allowlisted operations, only as `personId`. Callers must also pin
// the expected operation for the action the user took (see client.sign).
export function createMarketWallet(
  personId: string,
  getSeed: () => string,
  allowed: string[] = [...BUYER_OPS, ...SELLER_OPS]
): BuyerWallet {
  return {
    personId,
    async sign(operation) {
      if (operation.person !== personId || !allowed.includes(operation.op))
        throw new Error("buyer_wallet_operation_forbidden");
      if (!globalThis.crypto?.subtle) throw new Error("buyer_wallet_browser_unsupported");
      const seed = decodeBase58(getSeed());
      if (seed.length !== 32) throw new Error("buyer_wallet_key_invalid");
      const pkcs8 = new Uint8Array(48);
      pkcs8.set([0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20]);
      pkcs8.set(seed, 16);
      let key: CryptoKey;
      try {
        key = await crypto.subtle.importKey("pkcs8", pkcs8, "Ed25519", false, ["sign"]);
      } finally {
        seed.fill(0);
        pkcs8.fill(0);
      }
      const nonce = crypto.getRandomValues(new Uint8Array(16));
      const envelope = {
        op: operation.op,
        params: operation.params,
        person_id: personId,
        nonce: Array.from(nonce, b => b.toString(16).padStart(2, "0")).join(""),
        issued_at: new Date().toISOString(),
      };
      const signature = await crypto.subtle.sign(
        "Ed25519",
        key,
        new TextEncoder().encode(canonicalOperation(envelope))
      );
      const auth = { envelope, signature: btoa(String.fromCharCode(...Array.from(new Uint8Array(signature)))) };
      return btoa(String.fromCharCode(...Array.from(new TextEncoder().encode(JSON.stringify(auth)))))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    },
  };
}
