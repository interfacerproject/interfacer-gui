// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// LOCAL DEV marketplace — Catalog (stock journey). Browse resource-backed
// products with their passport reference, buy one, mark it delivered, and see
// the ValueFlows receipt. Logged-in buyers sign in their browser wallet;
// suppliers and anonymous demo buyers use disposable Medusa fixture keys.
// Public dev page (no auth chrome), mirroring /dev/commerce.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React, { useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "../_app";
import { useMarketClient } from "../../hooks/useMarketClient";
import { StoreProduct } from "../../lib/market/types";
import DevBanner from "../../components/market/DevBanner";
import MarketNav from "../../components/market/MarketNav";
import ProductCard from "../../components/market/ProductCard";
import MarketJourney from "../../components/market/MarketJourney";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const MarketCatalog: NextPageWithLayout = () => {
  const client = useMarketClient();
  const [products, setProducts] = useState<StoreProduct[] | null>(null);
  const [status, setStatus] = useState("Connecting and loading the current demo run…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    setProducts(null);
    setStatus("Connecting the buyer session…");
    (async () => {
      const c = await client.connect();
      if (!alive) return;
      if (!c.ok) {
        setError(c.reason);
        setStatus("");
        return;
      }
      const cat = await client.catalog();
      if (!alive) return;
      if (!cat.ok) {
        setError(cat.reason);
        setStatus("");
        return;
      }
      setProducts(cat.data);
      setStatus("");
    })();
    return () => {
      alive = false;
    };
  }, [client]);

  return (
    <main className="max-w-4xl p-6 mx-auto">
      <MarketNav title="Catalog" current="/market" />
      <DevBanner live={client.scene?.live} />
      {client.scene ? (
        <p className="mb-4 text-sm break-words" data-testid="market-buyer">
          Buyer: <code>{client.scene.buyer_person_id}</code>
          {client.scene.password ? " · disposable demo account" : " · verified Interfacer account"}
        </p>
      ) : null}

      {error ? (
        <div className="p-4 border-l-4 rounded bg-red-50 border-red-500 text-red-900" data-testid="market-page-error">
          {error === "market_upstream_unreachable" ? (
            <p>
              Marketplace server not reachable. Start it with <code>npm run dev:up</code> in interfacer-medusa, then
              reload.
            </p>
          ) : error === "login_required" ? (
            <p data-testid="market-login-required">
              This marketplace runs against live Zenflows: sign in to Interfacer to buy with your own wallet.
            </p>
          ) : (
            <p>Could not load the marketplace: {error}</p>
          )}
        </div>
      ) : status ? (
        <p className="text-gray-500">{status}</p>
      ) : (
        <div className="space-y-4" data-testid="market-catalog">
          {products && products.length === 0 ? (
            <p>
              {client.scene?.live
                ? "Nothing listed yet. Sellers list their own Zenflows products from the Offer page."
                : "No published resource-backed products in this demo run. Restart dev:up to seed fresh units."}
            </p>
          ) : null}
          {products?.map(product => {
            const variant = product.variants?.[0];
            const amount = variant?.calculated_price?.calculated_amount;
            const purchasable = amount != null && (variant?.inventory_quantity ?? 0) > 0;
            return (
              <ProductCard key={product.id} product={product}>
                {variant ? (
                  <MarketJourney
                    client={client}
                    kind="stock"
                    target={variant.id}
                    purchasable={purchasable}
                    unavailableReason="Sold out — this resource is not replenished."
                  />
                ) : null}
              </ProductCard>
            );
          })}
        </div>
      )}
    </main>
  );
};

// Public dev page: render standalone, bypassing the auth-gated Layout chrome
// (same approach as /dev/commerce). Ruling logged in the plan ledger.
(MarketCatalog as any).publicPage = true;
MarketCatalog.getLayout = page => page;

export default MarketCatalog;
