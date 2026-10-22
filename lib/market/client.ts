// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Browser-side client for the local Interfacer × Medusa marketplace. It talks
// ONLY to the GUI's own /api/market/* proxy (never to Medusa directly, never
// holding a key). Every protected write gets a fresh real Ed25519 envelope from
// the Medusa dev signer via the proxy; no private key is ever present here.
//
// This is a faithful port of the reference storefront client
// (interfacer-medusa/medusa/src/storefront/app.js): same call sequences, same
// shapes. LOCAL DEV ONLY — seeded data, labeled stand-in receipts.

import { Design, JourneyState, MarketError, MatchResult, Order, Receipt, Result, Scene, StoreProduct } from "./types";

export interface MarketClientOptions {
  baseUrl?: string; // default "" (relative; the browser same-origin proxy)
  fetchImpl?: typeof fetch;
}

const ORDER_FIELDS =
  "+customer_id,+metadata,+items.metadata,+payment_collections.payments.*,+payment_collections.payment_sessions.*,+fulfillments.*,+items.detail.*";

export function createMarketClient(opts: MarketClientOptions = {}) {
  const base = opts.baseUrl ?? "";
  const f = opts.fetchImpl ?? fetch;
  let scene: Scene | null = null;
  let token: string | null = null;

  const url = (medusaPath: string) => `${base}/api/market/${medusaPath}`;

  // Low-level call. Throws MarketError(reason,status) on a non-ok response, so
  // callers either catch it or let a page-facing wrapper turn it into Result.
  async function api<T = any>(path: string, body?: unknown, signature?: string): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (scene) headers["x-publishable-api-key"] = scene.context.publishable_key;
    if (token) headers["Authorization"] = "Bearer " + token;
    if (signature) headers["X-Interfacer-Auth"] = signature;
    const res = await f(path, {
      method: body === undefined ? "GET" : "POST",
      headers,
      credentials: "same-origin",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result: any = await res.json();
    if (!res.ok) {
      throw new MarketError(result?.reason || "market_error", res.status, result?.message || result?.reason);
    }
    return result as T;
  }

  async function sign(action: Record<string, unknown>): Promise<{ header: string }> {
    return api(url("dev/store/sign"), action);
  }

  async function signed<T = any>(path: string, body: unknown, action: Record<string, unknown>): Promise<T> {
    const proof = await sign(action);
    return api<T>(path, body, proof.header);
  }

  function ok<T>(data: T): Result<T> {
    return { ok: true, data };
  }
  function fail(e: unknown): Result<never> {
    const reason = e instanceof MarketError ? e.reason : "market_upstream_unreachable";
    return { ok: false, reason };
  }

  // --- page-facing API (each returns a Result) ---

  async function connect(): Promise<Result<Scene>> {
    try {
      scene = await api<Scene>(url("dev/store/config"));
      const login = await api<{ token: string }>(url("auth/customer/emailpass"), {
        email: scene.email,
        password: scene.password,
      });
      token = login.token;
      return ok(scene);
    } catch (e) {
      return fail(e);
    }
  }

  async function catalog(): Promise<Result<StoreProduct[]>> {
    try {
      if (!scene) throw new MarketError("not_connected", 0);
      const query = new URLSearchParams({
        region_id: scene.context.region_id,
        limit: "100",
        fields:
          "id,title,metadata,variants.id,variants.manage_inventory,variants.inventory_quantity,variants.calculated_price.*",
      });
      for (const p of scene.products) query.append("id[]", p.product_id);
      const { products } = await api<{ products: StoreProduct[] }>(url("store/products") + "?" + query.toString());
      return ok(products);
    } catch (e) {
      return fail(e);
    }
  }

  async function listDesigns(): Promise<Result<Design[]>> {
    try {
      const { designs } = await api<{ designs: Design[] }>(url("dev/interfacer/designs"));
      return ok(designs);
    } catch (e) {
      return fail(e);
    }
  }

  async function match(designId: string): Promise<Result<MatchResult>> {
    try {
      const result = await api<MatchResult>(url("dev/interfacer/match"), { designId });
      return ok(result);
    } catch (e) {
      return fail(e);
    }
  }

  async function readOrder(id: string): Promise<Result<Order>> {
    try {
      const q = new URLSearchParams({ fields: ORDER_FIELDS });
      const { order } = await api<{ order: Order }>(url(`store/orders/${encodeURIComponent(id)}`) + "?" + q.toString());
      return ok(order);
    } catch (e) {
      return fail(e);
    }
  }

  async function newCart(): Promise<string> {
    if (!scene) throw new MarketError("not_connected", 0);
    const { cart } = await api<{ cart: { id: string } }>(url("store/carts"), {
      region_id: scene.context.region_id,
      sales_channel_id: scene.context.sales_channel_id,
      email: scene.email,
      shipping_address: {
        first_name: "Local",
        last_name: "Demo",
        address_1: "Teststrasse 1",
        city: "Berlin",
        postal_code: "10115",
        country_code: "de",
      },
    });
    const bound = await api<{ cart: { id: string } }>(url(`store/carts/${cart.id}/customer`), {});
    return bound.cart.id;
  }

  // Drives the full purchase for one journey. `state` is owned and persisted by
  // the caller; it is mutated and returned so a retry resumes the same cart/order.
  async function purchase(kind: "stock" | "build", target: string, state: JourneyState): Promise<Result<JourneyState>> {
    try {
      if (!state.cartId) state.cartId = await newCart();
      if (!state.orderId) {
        const { cart } = await api<{ cart: { completed_at?: string | null; items?: unknown[] } }>(
          url(`store/carts/${state.cartId}`)
        );
        if (!cart.completed_at) {
          if (kind === "build") {
            await signed(
              url("dev/interfacer/build-orders"),
              { cartId: state.cartId, quoteId: target },
              { action: "build", cartId: state.cartId, quoteId: target }
            );
          } else if (!cart.items?.length) {
            await api(url(`store/carts/${state.cartId}/line-items`), { variant_id: target, quantity: 1 });
          }
          const { payment_collection } = await api<{ payment_collection: { id: string } }>(
            url("store/payment-collections"),
            { cart_id: state.cartId }
          );
          await api(url(`store/payment-collections/${payment_collection.id}/payment-sessions`), {
            provider_id: "pp_system_default",
          });
        }
        const result = await signed<{ type: string; order?: { id: string }; error?: { message?: string } }>(
          url(`store/carts/${state.cartId}/complete`),
          {},
          { action: "checkout", cartId: state.cartId }
        );
        if (result.type !== "order" || !result.order)
          throw new MarketError(result.error?.message || "order_refused", 400);
        state.orderId = result.order.id;
      }
      await signed(url("dev/store/capture"), { orderId: state.orderId }, { action: "capture", orderId: state.orderId });
      state.captured = true;
      return ok(state);
    } catch (e) {
      return fail(e);
    }
  }

  async function markMilestone(kind: "stock" | "build", orderId: string): Promise<Result<Receipt>> {
    try {
      const action = kind === "stock" ? "deliver" : "produce";
      const route = kind === "stock" ? "orders" : "build-orders";
      const result = await signed<{ receipt: Receipt }>(
        url(`dev/interfacer/${route}/${orderId}/${action}`),
        {},
        { action, orderId }
      );
      return ok(result.receipt);
    } catch (e) {
      return fail(e);
    }
  }

  async function receipts(): Promise<Result<Receipt[]>> {
    try {
      const { receipts } = await api<{ receipts: Receipt[] }>(url("dev/interfacer/receipts"));
      const mine = scene ? receipts.filter(r => r.receiver_id === scene!.buyer_person_id) : receipts;
      return ok(mine);
    } catch (e) {
      return fail(e);
    }
  }

  return {
    api,
    signed,
    connect,
    catalog,
    listDesigns,
    match,
    readOrder,
    purchase,
    markMilestone,
    receipts,
    get scene() {
      return scene;
    },
  };
}

export type MarketClient = ReturnType<typeof createMarketClient>;
