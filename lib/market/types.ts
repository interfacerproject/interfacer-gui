// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Types for the local Interfacer × Medusa marketplace client. LOCAL DEV ONLY:
// the data is seeded and the receipts are a labeled local stand-in, not a live
// Zenflows ledger. See docs/superpowers/specs/2026-10-22-marketplace-gui-integration-design.md

export interface SceneProduct {
  product_id: string;
  variant_id: string;
  listing_id: string;
  resource_id: string;
  dpp_id: string;
}

export interface Scene {
  label: string;
  run: string;
  email: string;
  password: string;
  buyer_person_id: string;
  customer_id: string;
  context: {
    publishable_key: string;
    region_id: string;
    sales_channel_id: string;
  };
  products: SceneProduct[];
}

export interface StoreVariant {
  id: string;
  inventory_quantity?: number;
  manage_inventory?: boolean;
  calculated_price?: { calculated_amount?: number };
}

export interface StoreProduct {
  id: string;
  title: string;
  metadata: { interfacer_resource_id?: string; interfacer_dpp_id?: string };
  variants: StoreVariant[];
}

export interface Design {
  id: string;
  name: string;
  origin_dpp_id?: string | null;
  requirements: unknown;
}

export interface Quote {
  id: string;
  total_price_cents: number;
  quantity: number;
  provider_person_id: string;
  [k: string]: unknown;
}

export interface MatchEntry {
  service: { id: string; name: string; [k: string]: unknown };
  quote: Quote;
}

export interface RejectedEntry {
  service: { id: string; name: string; [k: string]: unknown };
  reason: string;
}

export interface MatchResult {
  matches: MatchEntry[];
  rejected: RejectedEntry[];
}

export interface Order {
  id: string;
  total?: number;
  payment_collections?: Array<{ payments?: Array<{ captured_at?: string | null }> }>;
  [k: string]: unknown;
}

export interface Receipt {
  id: string;
  action: string;
  provider_id: string;
  receiver_id: string;
  resource_id: string;
  dpp_id: string;
  quantity: number;
  has_point_in_time: string;
  service_id?: string;
  // Bridge C: id of the live Zenflows EconomicEvent this receipt mirrors.
  zenflows_event_id?: string | null;
  [k: string]: unknown;
}

// Per-journey purchase state, persisted by the page (localStorage or React state).
export interface JourneyState {
  cartId?: string;
  orderId?: string;
  captured?: boolean;
  receipt?: Receipt;
}

export type Result<T> = { ok: true; data: T } | { ok: false; reason: string };

// A refusal carrying the upstream `reason` (e.g. demo_cart_required,
// passport_binding_mismatch, local_storefront_only) so the UI can show it.
export class MarketError extends Error {
  reason: string;
  status: number;
  constructor(reason: string, status: number, message?: string) {
    super(message || reason);
    // Preserve the prototype chain under the repo's ES5 target, where
    // `extends Error` otherwise breaks `instanceof MarketError`.
    Object.setPrototypeOf(this, MarketError.prototype);
    this.name = "MarketError";
    this.reason = reason;
    this.status = status;
  }
}
