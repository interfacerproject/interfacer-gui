// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CartTotals, computeTotals, DeliveryMethodId, MockLine, seedCartLines, VariantId } from "./mockData";

/**
 * Client-only state for the commerce preview. No server, no network. The cart
 * always reflects the current variant + quantity selection (the printer plus a
 * fixed spare-parts line).
 *
 * `variant` and `qty` survive a reload via `sessionStorage` under the single
 * key `ifr:commercePreview`; the checkout step, delivery choice and the
 * "placing" spinner are deliberately ephemeral.
 */

export const COMMERCE_PREVIEW_STORAGE_KEY = "ifr:commercePreview";
const STORAGE_KEY = COMMERCE_PREVIEW_STORAGE_KEY;
export const QTY_MIN = 1;
export const QTY_MAX = 9;

export const clampCommerceQty = (n: number) => Math.max(QTY_MIN, Math.min(QTY_MAX, Math.round(n)));

const isVariant = (v: unknown): v is VariantId => v === "assembled" || v === "kit" || v === "bom";

/**
 * Write the product-page selection so a page mounting the provider afterwards
 * (client-side nav from the real product page into the preview) picks it up.
 */
export function persistSelection(variant: VariantId, qty: number) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ variant, qty: clampCommerceQty(qty) }));
  } catch {
    /* storage unavailable */
  }
}

/** 0 = Address, 1 = Delivery, 2 = Payment. */
export type CheckoutStep = 0 | 1 | 2;

interface CommercePreviewValue {
  variant: VariantId;
  qty: number;
  setVariant: (v: VariantId) => void;
  setQty: (n: number) => void;
  incQty: () => void;
  decQty: () => void;

  lines: MockLine[];
  totals: CartTotals;

  deliveryMethod: DeliveryMethodId;
  setDeliveryMethod: (m: DeliveryMethodId) => void;

  checkoutStep: CheckoutStep;
  setCheckoutStep: (s: CheckoutStep) => void;
  placing: boolean;
  setPlacing: (p: boolean) => void;
  resetCheckout: () => void;
}

const CommercePreviewContext = createContext<CommercePreviewValue | null>(null);

const clampQty = clampCommerceQty;

export function CommercePreviewProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<VariantId>("assembled");
  const [qty, setQtyState] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodId>("standard");
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(0);
  const [placing, setPlacing] = useState(false);

  // Restore the last selection on mount (demo convenience only).
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { variant?: unknown; qty?: unknown };
      if (isVariant(saved.variant)) setVariantState(saved.variant);
      if (typeof saved.qty === "number") setQtyState(clampQty(saved.qty));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  // Persist the selection.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ variant, qty }));
    } catch {
      /* storage unavailable — the demo still works, it just won't survive a reload */
    }
  }, [variant, qty]);

  const setVariant = useCallback((v: VariantId) => setVariantState(v), []);
  const setQty = useCallback((n: number) => setQtyState(clampQty(n)), []);
  const incQty = useCallback(() => setQtyState(n => clampQty(n + 1)), []);
  const decQty = useCallback(() => setQtyState(n => clampQty(n - 1)), []);
  const resetCheckout = useCallback(() => {
    setCheckoutStep(0);
    setPlacing(false);
  }, []);

  const lines = useMemo(() => seedCartLines(variant, qty), [variant, qty]);
  const totals = useMemo(() => computeTotals(lines, deliveryMethod), [lines, deliveryMethod]);

  const value = useMemo<CommercePreviewValue>(
    () => ({
      variant,
      qty,
      setVariant,
      setQty,
      incQty,
      decQty,
      lines,
      totals,
      deliveryMethod,
      setDeliveryMethod,
      checkoutStep,
      setCheckoutStep,
      placing,
      setPlacing,
      resetCheckout,
    }),
    [
      variant,
      qty,
      setVariant,
      setQty,
      incQty,
      decQty,
      lines,
      totals,
      deliveryMethod,
      checkoutStep,
      placing,
      resetCheckout,
    ]
  );

  return <CommercePreviewContext.Provider value={value}>{children}</CommercePreviewContext.Provider>;
}

export function useCommercePreview(): CommercePreviewValue {
  const ctx = useContext(CommercePreviewContext);
  if (!ctx) {
    throw new Error("useCommercePreview must be used inside <CommercePreviewProvider>");
  }
  return ctx;
}

/**
 * Non-throwing accessor. Returns `null` outside the provider — used by
 * `BuyBlock`, which also renders on the real product page where there is no
 * provider and it falls back to local state + `persistSelection`.
 */
export function useCommercePreviewOptional(): CommercePreviewValue | null {
  return useContext(CommercePreviewContext);
}
