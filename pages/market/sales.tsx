// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// LOCAL DEV marketplace — My sales (live mode). The signed-in seller sees the
// orders placed on their own listings and services, signs the physical
// milestone themselves (delivered / produced) and follows the durable Zenflows
// sync of each receipt. No other person's orders are returned by Medusa.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React, { useCallback, useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "../_app";
import { useAuth } from "../../hooks/useAuth";
import { useMarketClient } from "../../hooks/useMarketClient";
import { SellerDashboard, SellerOrder } from "../../lib/market/types";
import DevBanner from "../../components/market/DevBanner";
import MarketNav from "../../components/market/MarketNav";
import ReceiptView from "../../components/market/ReceiptView";

export async function getStaticProps({ locale }: { locale: string }) {
  return { props: { publicPage: true, ...(await serverSideTranslations(locale, ["common"])) } };
}

const SaleRow = ({
  order,
  onMilestone,
  onRetry,
  busy,
}: {
  order: SellerOrder;
  onMilestone: () => void;
  onRetry: () => void;
  busy: boolean;
}) => (
  <article
    className="p-4 bg-white border rounded-lg"
    data-testid="market-sale"
    data-kind={order.kind}
    data-order={order.id}
  >
    <h3 className="font-semibold">
      {order.kind === "stock" ? "Stock sale" : `Build · ${order.quantity} piece(s) · EUR ${order.total_eur}`}
    </h3>
    <p className="text-xs text-gray-500">
      Order <code className="break-all">{order.id}</code> · {order.captured ? "payment captured" : "payment pending"}
    </p>
    {order.receipt ? (
      <ReceiptView receipt={order.receipt} onRetry={onRetry} retrying={busy} />
    ) : (
      <button
        type="button"
        className="mt-2 btn btn-accent btn-sm"
        disabled={busy || !order.captured}
        onClick={onMilestone}
        data-testid={`market-sale-milestone-${order.kind}`}
      >
        {busy ? "Signing…" : order.kind === "stock" ? "Mark delivered (sign)" : "Mark produced (sign)"}
      </button>
    )}
  </article>
);

const MarketSales: NextPageWithLayout = () => {
  const { user } = useAuth();
  const market = useMarketClient();
  const [dash, setDash] = useState<SellerDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const d = await market.sellerDashboard();
    if (d.ok) setDash(d.data);
    else setError(d.reason);
  }, [market]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const c = await market.connect();
      if (!alive) return;
      if (!c.ok) return setError(c.reason);
      await refresh();
    })();
    return () => {
      alive = false;
    };
  }, [user, market, refresh]);

  const act = async (order: SellerOrder, retry: boolean) => {
    setBusy(order.id);
    setError(null);
    const syncId = order.receipt?.zenflows_sync?.id;
    const res =
      retry && syncId ? await market.retrySync(order.id, syncId) : await market.markSold(order.kind, order.id);
    setBusy(null);
    if (!res.ok) setError(res.reason);
    await refresh();
  };

  return (
    <main className="max-w-4xl p-6 mx-auto">
      <MarketNav title="My sales" current="/market/sales" />
      <DevBanner live />
      {!user ? (
        <p data-testid="market-login-required">
          Sign in to Interfacer to see the orders on your listings and services.
        </p>
      ) : (
        <>
          {error ? (
            <p role="alert" className="mb-2 text-red-700" data-testid="market-error">
              {error}
            </p>
          ) : null}
          {!dash ? (
            <p className="text-gray-500">Loading your sales…</p>
          ) : (
            <div className="space-y-4" data-testid="market-sales">
              <p className="text-sm text-gray-600">
                {dash.listings.length} live listing(s) · {dash.catalog.length} catalog registration(s). You sign each
                milestone with your own wallet; the Zenflows events name you as the provider.
              </p>
              {dash.orders.length === 0 ? <p>No orders yet.</p> : null}
              {dash.orders.map(order => (
                <SaleRow
                  key={order.id}
                  order={order}
                  busy={busy === order.id}
                  onMilestone={() => act(order, false)}
                  onRetry={() => act(order, true)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};

(MarketSales as any).publicPage = true;
MarketSales.getLayout = page => page;

export default MarketSales;
