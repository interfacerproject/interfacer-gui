// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Marketplace notifications through the Interfacer inbox. The person who acts
// sends them, signed with their own key (the inbox binds sender = signer):
// the buyer tells the seller about a new order, the seller tells the buyer the
// order was built or delivered; after the sale, each side tells the other
// about a cancellation/return request, the answer and the refund.
// Best-effort: a notice never blocks a sale.

export enum MarketSubject {
  NEW_ORDER = "marketNewOrder",
  ORDER_FULFILLED = "marketOrderFulfilled",
  AFTERSALE = "marketAfterSale",
}

export type AfterSaleEvent = "requested" | "accepted" | "rejected" | "withdrawn" | "refunded";

export const MARKET_SUBJECTS: readonly string[] = Object.values(MarketSubject);

export function isMarketSubject(subject: string | undefined | null): subject is MarketSubject {
  return !!subject && MARKET_SUBJECTS.includes(subject);
}

export interface MarketNoticeMessage {
  kind: "stock" | "build";
  orderId: string;
  itemId: string;
  itemName: string;
  // NEW_ORDER: who bought and for how much. ORDER_FULFILLED: who sold.
  buyerName?: string;
  totalEur?: number;
  sellerName?: string;
  // AFTERSALE: what happened, on which kind of request, who did it, how much.
  event?: AfterSaleEvent;
  caseKind?: "cancellation" | "return" | "refund";
  actorName?: string;
  amountCents?: number;
}

export interface MarketNotice {
  subject: MarketSubject;
  receivers: string[];
  message: MarketNoticeMessage;
}

export function newOrderNotice(o: {
  kind: "stock" | "build";
  orderId: string;
  itemId: string;
  itemName: string;
  buyerName: string;
  totalEur: number;
  sellerId: string;
}): MarketNotice {
  return {
    subject: MarketSubject.NEW_ORDER,
    receivers: o.sellerId ? [o.sellerId] : [],
    message: {
      kind: o.kind,
      orderId: o.orderId,
      itemId: o.itemId,
      itemName: o.itemName,
      buyerName: o.buyerName,
      totalEur: o.totalEur,
    },
  };
}

export function fulfilledNotice(o: {
  kind: "stock" | "build";
  orderId: string;
  itemId: string;
  itemName: string;
  sellerName: string;
  buyerId: string;
}): MarketNotice {
  return {
    subject: MarketSubject.ORDER_FULFILLED,
    receivers: o.buyerId ? [o.buyerId] : [],
    message: { kind: o.kind, orderId: o.orderId, itemId: o.itemId, itemName: o.itemName, sellerName: o.sellerName },
  };
}

// A request or withdrawal goes to the seller; an answer or a refund to the buyer.
export function aftersaleNotice(o: {
  event: AfterSaleEvent;
  caseKind: "cancellation" | "return" | "refund";
  kind: "stock" | "build";
  orderId: string;
  itemId: string;
  itemName: string;
  actorName: string;
  amountCents?: number;
  receiverId: string;
}): MarketNotice {
  return {
    subject: MarketSubject.AFTERSALE,
    receivers: o.receiverId ? [o.receiverId] : [],
    message: {
      kind: o.kind,
      orderId: o.orderId,
      itemId: o.itemId,
      itemName: o.itemName,
      event: o.event,
      caseKind: o.caseKind,
      actorName: o.actorName,
      ...(typeof o.amountCents === "number" ? { amountCents: o.amountCents } : {}),
    },
  };
}

export function toSeller(subject: MarketSubject, message: MarketNoticeMessage): boolean {
  return (
    subject === MarketSubject.NEW_ORDER ||
    (subject === MarketSubject.AFTERSALE && (message.event === "requested" || message.event === "withdrawn"))
  );
}

export function marketNoticeLink(subject: MarketSubject, message: MarketNoticeMessage): string {
  return toSeller(subject, message) ? "/market/selling" : `/market/orders/${encodeURIComponent(message.orderId)}`;
}

type Send = (message: MarketNoticeMessage, receivers: string[], subject: MarketSubject) => Promise<unknown>;

// Returns whether the notice was handed to the inbox. Skips empty receivers and
// the sender themselves; swallows inbox errors.
export async function sendMarketNotice(
  send: Send,
  notice: MarketNotice,
  senderId: string | undefined
): Promise<boolean> {
  const receivers = notice.receivers.filter(r => !!r && r !== senderId);
  if (receivers.length === 0) return false;
  try {
    await send(notice.message, receivers, notice.subject);
    return true;
  } catch {
    return false;
  }
}
