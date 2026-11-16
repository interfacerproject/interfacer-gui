// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MARKET_SUBJECTS,
  MarketSubject,
  fulfilledNotice,
  isMarketSubject,
  marketNoticeLink,
  newOrderNotice,
  sendMarketNotice,
} from "../../lib/market/notify";

test("new-order notice goes to the seller and links to their selling dashboard", () => {
  const n = newOrderNotice({
    kind: "build",
    orderId: "order_1",
    itemId: "06DESIGN",
    itemName: "Lamp shade",
    buyerName: "Ada",
    totalEur: 42,
    sellerId: "06SELLER",
  });
  assert.equal(n.subject, MarketSubject.NEW_ORDER);
  assert.deepEqual(n.receivers, ["06SELLER"]);
  assert.equal(n.message.orderId, "order_1");
  assert.equal(n.message.kind, "build");
  assert.equal(marketNoticeLink(n.subject, n.message), "/market/selling");
});

test("fulfilled notice goes to the buyer and links to their order", () => {
  const n = fulfilledNotice({
    kind: "stock",
    orderId: "order_2",
    itemId: "06RES",
    itemName: "Desk lamp",
    sellerName: "Fablab Seven",
    buyerId: "06BUYER",
  });
  assert.equal(n.subject, MarketSubject.ORDER_FULFILLED);
  assert.deepEqual(n.receivers, ["06BUYER"]);
  assert.equal(marketNoticeLink(n.subject, n.message), "/market/orders/order_2");
});

test("market subjects are recognised and distinct from the project ones", () => {
  for (const s of MARKET_SUBJECTS) assert.ok(isMarketSubject(s));
  assert.ok(!isMarketSubject("contributionRequest"));
  assert.ok(!isMarketSubject(undefined));
});

test("no notice to oneself, no notice without a receiver", async () => {
  const sent: unknown[] = [];
  const send = async (...args: unknown[]) => {
    sent.push(args);
  };
  const base = { kind: "stock" as const, orderId: "o", itemId: "r", itemName: "x", buyerName: "b", totalEur: 1 };
  assert.equal(await sendMarketNotice(send, newOrderNotice({ ...base, sellerId: "ME" }), "ME"), false);
  assert.equal(await sendMarketNotice(send, newOrderNotice({ ...base, sellerId: "" }), "ME"), false);
  assert.equal(sent.length, 0);
  assert.equal(await sendMarketNotice(send, newOrderNotice({ ...base, sellerId: "SELLER" }), "ME"), true);
  assert.deepEqual(sent[0], [
    newOrderNotice({ ...base, sellerId: "SELLER" }).message,
    ["SELLER"],
    MarketSubject.NEW_ORDER,
  ]);
});

test("a failing inbox never breaks the marketplace flow", async () => {
  const send = async () => {
    throw new Error("inbox down");
  };
  const n = newOrderNotice({
    kind: "stock",
    orderId: "o",
    itemId: "r",
    itemName: "x",
    buyerName: "b",
    totalEur: 1,
    sellerId: "SELLER",
  });
  assert.equal(await sendMarketNotice(send, n, "ME"), false);
});
