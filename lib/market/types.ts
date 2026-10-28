// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Types for the local Interfacer × Medusa marketplace client. LOCAL DEV ONLY:
// catalog is seeded. A zenflows_event_id confirms a live handover on the local
// ledger; otherwise the receipt is local-only. See docs/marketplace-gui-STATUS.md

export interface SceneProduct {
  product_id: string;
  variant_id: string;
  listing_id: string;
  resource_id: string;
  dpp_id: string;
  seller_person_id?: string; // live listings only
}

// Standalone: a disposable fixture buyer login. Live (Medusa configured with a
// Zenflows URL): no login is disclosed; every person signs with their wallet.
export interface Scene {
  label: string;
  run: string;
  live?: boolean;
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
  // Id of the final live Zenflows transfer/handover (also after build production).
  zenflows_event_id?: string | null;
  // Durable outbox state; absent = local-only receipt (standalone or pre-outbox).
  zenflows_sync?: ZenflowsSync;
  [k: string]: unknown;
}

export interface ZenflowsSync {
  id: string;
  status: "pending" | "done" | "blocked";
  attempts: number;
  last_error: string | null;
  inflight_step: "process" | "create" | "transfer" | null;
  next_attempt_at: string | null;
  process_id: string | null;
  resource_id: string | null;
  creation_event_id: string | null;
  transfer_event_id: string | null;
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

// --- live sellers (Zenflows-registered owners) ---

export type CatalogKind = "design" | "service";

export interface Requirements {
  process: string[];
  materials: string[];
  max_dimensions_mm: { x: number; y: number; z: number };
  tolerance_mm: number;
  quantity: number;
}
export interface Capabilities {
  processes: string[];
  materials: string[];
  build_volume_mm: { x: number; y: number; z: number };
  min_tolerance_mm: number;
}
export type CatalogDocument =
  | { schema_version: "interfacer-build-requirements-v1"; requirements: Requirements }
  | {
      schema_version: "interfacer-fabrication-capabilities-v1";
      capabilities: Capabilities;
      base_price_eur: number;
      per_unit_price_eur: number;
      location: { country_code: string; city: string };
    };

export interface CatalogEntry {
  id: string;
  kind: CatalogKind;
  zenflows_resource_id: string;
  revision: number;
  resource_name: string;
  document: CatalogDocument;
  created_at?: string;
}

export interface ListingBinding {
  id: string;
  catalog_resource_id: string;
  source_dpp_id: string;
  seller_agent_id: string;
  medusa_product_id: string;
  medusa_variant_id: string;
  policy_version: string;
}

export interface SellerOrder {
  id: string;
  status: string;
  created_at?: string;
  captured: boolean;
  kind: "stock" | "build";
  listing_id?: string;
  resource_id?: string;
  quote_id?: string;
  design_id?: string;
  service_id?: string;
  quantity?: number;
  total_eur?: number;
  receipt: Receipt | null;
}

export interface SellerDashboard {
  person: string;
  listings: ListingBinding[];
  catalog: CatalogEntry[];
  orders: SellerOrder[];
}

// A Zenflows resource the signed-in person is accountable for (from the SDK).
export interface OwnedResource {
  id: string;
  name: string;
  conformsTo: { id: string; name: string };
  onhandQuantity?: { hasNumericalValue: number | string };
}
