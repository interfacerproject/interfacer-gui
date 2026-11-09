// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Browser-side client for the local Interfacer × Medusa marketplace. It talks
// ONLY to the GUI's own /api/market/* proxy (never to Medusa directly, never
// receiving a private key). Logged-in buyers sign with their browser wallet;
// only disposable demo buyers/suppliers use the Medusa dev signer.
//
// This is a faithful port of the reference storefront client
// (interfacer-medusa/medusa/src/storefront/app.js): same call sequences, same
// shapes. LOCAL DEV ONLY — seeded data, labeled stand-in receipts.

import {
  CatalogDocument,
  CatalogKind,
  Design,
  JourneyState,
  MarketError,
  MatchResult,
  Order,
  Receipt,
  Result,
  Scene,
  SellerDashboard,
  StoreProduct,
} from "./types";

import type { BuyerWallet, PreparedOperation } from "./wallet";
import { checkRelayBody, type RelayStep } from "./relay";

export interface MarketClientOptions {
  wallet?: BuyerWallet;
  // Enforced Zenflows authz: signs an exact GraphQL body as the signed-in person
  // (the SDK's signGraphQLRequest), returning the zenflows-sign value.
  zenflowsSigner?: (body: string) => Promise<string>;
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
      throw new MarketError(
        result?.reason || result?.message || "market_error",
        res.status,
        result?.message || result?.reason
      );
    }
    return result as T;
  }

  // The one operation each user action may sign: a server-prepared operation
  // for any other op (or another person) is refused before the wallet sees it.
  const EXPECTED_OP: Record<string, string> = {
    checkout: "commerce.order.authorize",
    build: "commerce.order.build.purchase",
    capture: "commerce.order.dev.capture",
    deliver: "commerce.order.deliver",
    produce: "commerce.order.produce",
  };

  async function sign(action: Record<string, unknown>): Promise<{ header: string }> {
    if (!token) throw new MarketError("not_connected", 401);
    if (opts.wallet) {
      const operation = await api<PreparedOperation>(url("dev/store/prepare"), action);
      if (operation.op !== EXPECTED_OP[String(action.action)])
        throw new MarketError("buyer_wallet_operation_forbidden", 403);
      if (operation.person === opts.wallet.personId) return { header: await opts.wallet.sign(operation) };
      // Live: there is no dev signer; only standalone fixture suppliers remain.
      if (scene?.live || !["deliver", "produce"].includes(String(action.action)))
        throw new MarketError("buyer_wallet_operation_forbidden", 403);
    }
    return api(url("dev/store/sign"), action);
  }

  // Owner/seller operations whose params the user chose (catalog documents,
  // listings): signed directly by the wallet as the signed-in person.
  async function ownerSigned<T = any>(path: string, op: string, params: Record<string, unknown>, body: unknown) {
    if (!opts.wallet) throw new MarketError("login_required", 401);
    const header = await opts.wallet.sign({ op, params, person: opts.wallet.personId });
    return api<T>(path, body, header);
  }

  async function signed<T = any>(path: string, body: unknown, action: Record<string, unknown>): Promise<T> {
    const proof = await sign(action);
    return api<T>(path, body, proof.header);
  }

  function ok<T>(data: T): Result<T> {
    return { ok: true, data };
  }
  function fail(e: unknown): Result<never> {
    const reason =
      e instanceof MarketError
        ? e.reason
        : e instanceof Error && /^(buyer_wallet_|invalid_base58_key)/.test(e.message)
        ? e.message
        : "market_upstream_unreachable";
    return { ok: false, reason };
  }

  // --- page-facing API (each returns a Result) ---

  async function connect(): Promise<Result<Scene>> {
    try {
      scene = await api<Scene>(url("dev/store/config"));
      token = null;
      if (opts.wallet) {
        const { challenge } = await api<{ challenge: string }>(
          url("dev/store/session") + "?" + new URLSearchParams({ person: opts.wallet.personId })
        );
        const signature = await opts.wallet.sign({
          op: "commerce.session.create",
          params: { challenge },
          person: opts.wallet.personId,
        });
        const login = await api<{ token: string; customer_id: string; buyer_person_id: string; email: string }>(
          url("dev/store/session"),
          {},
          signature
        );
        if (login.buyer_person_id !== opts.wallet.personId) throw new MarketError("buyer_identity_mismatch", 403);
        token = login.token;
        scene = {
          ...scene,
          customer_id: login.customer_id,
          buyer_person_id: login.buyer_person_id,
          email: login.email,
          password: "",
        };
      } else if (scene.live) {
        // Live mode discloses no demo login: buying and selling need a wallet.
        throw new MarketError("login_required", 401);
      } else {
        const login = await api<{ token: string }>(url("auth/customer/emailpass"), {
          email: scene.email,
          password: scene.password,
        });
        token = login.token;
      }
      return ok(scene);
    } catch (e) {
      scene = null;
      token = null;
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

  // Advances a pending Zenflows sync now (the server still reconciles first and
  // never re-sends a step it cannot prove absent), then re-reads that receipt.
  async function retrySync(orderId: string, syncId: string): Promise<Result<Receipt>> {
    try {
      await api(url(`dev/interfacer/zenflows-sync/${encodeURIComponent(syncId)}/retry`), {});
      // By order, not by buyer: a seller retries the sync of an order they sold.
      const all = await api<{ receipts: Receipt[] }>(url("dev/interfacer/receipts"));
      const receipt = all.receipts.find(r => r.order_id === orderId);
      if (!receipt) throw new MarketError("receipt_not_found", 404);
      return ok(receipt);
    } catch (e) {
      return fail(e);
    }
  }

  // --- seller / owner (live mode) ---

  async function sellerDashboard(): Promise<Result<SellerDashboard>> {
    try {
      return ok(await api<SellerDashboard>(url("dev/store/seller")));
    } catch (e) {
      return fail(e);
    }
  }

  async function registerCatalog(kind: CatalogKind, resourceId: string, document: CatalogDocument) {
    try {
      const params = { resource_id: resourceId, document };
      const path = url(`dev/interfacer/catalog/${kind === "design" ? "designs" : "services"}`);
      return ok(await ownerSigned<{ created: boolean }>(path, `catalog.${kind}.register`, params, params));
    } catch (e) {
      return fail(e);
    }
  }

  // List one unit of the person's own Zenflows product: create the live listing,
  // publish its EUR price and allocate its single unit (all owner-signed).
  async function listProduct(resourceId: string, priceEUR: number): Promise<Result<{ listing_id: string }>> {
    try {
      const body = { resource_id: resourceId };
      const created = await ownerSigned<{ binding: { id: string } }>(
        url("dev/interfacer/listings/live"),
        "commerce.listing.live.create",
        body,
        body
      );
      const id = created.binding.id;
      await ownerSigned(
        url(`dev/interfacer/listings/${id}/publish`),
        "commerce.listing.publish",
        { listing_id: id, priceEUR },
        { priceEUR }
      );
      await ownerSigned(
        url(`dev/interfacer/listings/${id}/checkout`),
        "commerce.listing.checkout.setup",
        { listing_id: id },
        {}
      );
      return ok({ listing_id: id });
    } catch (e) {
      return fail(e);
    }
  }

  // Enforced authz: sign each pending Zenflows write of my own sale. Medusa
  // hands over the exact body; it is checked (my mutation shapes, me as
  // provider, the order's buyer as receiver) before the wallet signs it.
  async function signSync(orderId: string, syncId: string, buyer: string): Promise<Result<Receipt>> {
    try {
      if (!opts.wallet || !opts.zenflowsSigner) throw new MarketError("login_required", 401);
      const path = url(`dev/store/zenflows-sync/${encodeURIComponent(syncId)}`);
      for (let i = 0; i < 4; i++) {
        const next = await api<{ step?: RelayStep; body?: string }>(path + "/next");
        if (!next.step || !next.body) break;
        checkRelayBody(next.step, next.body, opts.wallet.personId, buyer);
        const signature = await opts.zenflowsSigner(next.body);
        await api(path + "/sign", { step: next.step, body: next.body, signature });
      }
      const all = await api<{ receipts: Receipt[] }>(url("dev/interfacer/receipts"));
      const receipt = all.receipts.find(r => r.order_id === orderId);
      if (!receipt) throw new MarketError("receipt_not_found", 404);
      return ok(receipt);
    } catch (e) {
      return fail(
        e instanceof Error && e.message.startsWith("relay_body_refused") ? new MarketError(e.message, 400) : e
      );
    }
  }

  // Sellers sign their own milestone; the order need not be theirs as a buyer.
  async function markSold(kind: "stock" | "build", orderId: string) {
    return markMilestone(kind, orderId);
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
    retrySync,
    sellerDashboard,
    registerCatalog,
    listProduct,
    markSold,
    signSync,
    get scene() {
      return scene;
    },
  };
}

export type MarketClient = ReturnType<typeof createMarketClient>;
