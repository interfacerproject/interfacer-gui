// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// One purchase journey (stock or build), reused by both marketplace pages.
// Buy -> order placed + test payment captured (no VF event on payment) ->
// Mark delivered/produced -> the ValueFlows receipt. State is persisted per
// journey so a reload resumes the same cart/order, mirroring the reference
// storefront client.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React, { useCallback, useEffect, useState } from "react";
import { JourneyState, Order, Receipt } from "../../lib/market/types";
import { MarketClient } from "../../lib/market/client";
import ReceiptView from "./ReceiptView";

type Props = {
  client: MarketClient;
  kind: "stock" | "build";
  target: string; // variant id (stock) or quote id (build)
  purchasable: boolean;
  unavailableReason?: string;
};

function loadState(key: string): JourneyState {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as JourneyState) : {};
  } catch {
    return {};
  }
}
function saveState(key: string, state: JourneyState) {
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* private mode / blocked storage — the journey still works in-memory */
  }
}

const MarketJourney = ({ client, kind, target, purchasable, unavailableReason }: Props) => {
  const storageKey = `market:${kind}:${target}`;
  const [state, setState] = useState<JourneyState>({});
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(
    (next: JourneyState) => {
      saveState(storageKey, next);
      setState({ ...next });
    },
    [storageKey]
  );

  const refreshOrder = useCallback(
    async (orderId: string) => {
      const res = await client.readOrder(orderId);
      if (res.ok) setOrder(res.data);
    },
    [client]
  );

  useEffect(() => {
    const restored = loadState(storageKey);
    setState(restored);
    if (restored.orderId) void refreshOrder(restored.orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const buy = useCallback(async () => {
    setBusy(true);
    setError(null);
    const next: JourneyState = { ...state };
    const res = await client.purchase(kind, target, next);
    setBusy(false);
    if (!res.ok) {
      setError(res.reason);
      persist(next); // keep any cart/order id already saved for a retry
      return;
    }
    persist(res.data);
    if (res.data.orderId) await refreshOrder(res.data.orderId);
  }, [client, kind, target, state, persist, refreshOrder]);

  const milestone = useCallback(async () => {
    if (!state.orderId) return;
    setBusy(true);
    setError(null);
    const res = await client.markMilestone(kind, state.orderId);
    setBusy(false);
    if (!res.ok) {
      setError(res.reason);
      return;
    }
    persist({ ...state, receipt: res.data });
  }, [client, kind, state, persist]);

  const receipt: Receipt | undefined = state.receipt;
  const captured = order?.payment_collections?.some(c => c.payments?.some(p => p.captured_at));

  return (
    <div className="mt-3">
      {error ? (
        <p role="alert" className="mb-2 text-sm text-red-600" data-testid="market-error">
          Could not finish: {error}. Retry — saved cart/order IDs are reused.
        </p>
      ) : null}

      {!state.orderId ? (
        <>
          {!purchasable ? (
            <p className="text-sm text-gray-500">{unavailableReason || "Not available."}</p>
          ) : state.cartId ? (
            <p className="text-sm text-gray-500">Saved cart — Buy resumes this checkout.</p>
          ) : null}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!purchasable || busy}
            onClick={buy}
            data-testid={`market-buy-${kind}`}
          >
            {busy ? "Working…" : kind === "stock" ? "Buy" : "Buy build"}
          </button>
        </>
      ) : (
        <div>
          <h4 className="font-semibold">Order placed</h4>
          <p className="text-sm">
            <span className="text-gray-500">Native Medusa order: </span>
            <code className="break-all">{state.orderId}</code>
          </p>
          {order ? (
            <p className="text-sm">
              {typeof order.total === "number"
                ? new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(order.total)
                : ""}{" "}
              · {captured ? "Manual/test payment captured" : "Payment authorized; capture pending"}
            </p>
          ) : null}

          {receipt ? (
            <ReceiptView receipt={receipt} />
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-500">
                No VF event on payment. The next action asserts the physical milestone with a disposable seller/provider
                dev key.
              </p>
              <button
                type="button"
                className="btn btn-accent btn-sm"
                disabled={busy}
                onClick={milestone}
                data-testid={`market-milestone-${kind}`}
              >
                {busy ? "Working…" : kind === "stock" ? "Mark delivered" : "Mark produced"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketJourney;
