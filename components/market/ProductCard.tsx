// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import React from "react";
import { StoreProduct } from "../../lib/market/types";

const euro = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(n)
    : "Price unavailable";

// Presentational card for one resource-backed product + its passport reference.
// The purchase journey is passed as children.
const ProductCard = ({ product, children }: { product: StoreProduct; children?: React.ReactNode }) => {
  const variant = product.variants?.[0];
  const amount = variant?.calculated_price?.calculated_amount;
  const available = Math.max(0, variant?.inventory_quantity ?? 0);
  return (
    <article className="p-4 border rounded-lg bg-white" data-testid="market-product">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{product.title}</h3>
          <p className="text-sm">
            <span className="text-gray-500">Resource: </span>
            <code className="break-all">{product.metadata?.interfacer_resource_id || "—"}</code>
          </p>
          <p className="text-sm">
            <span className="text-gray-500">DPP reference: </span>
            <code className="break-all">{product.metadata?.interfacer_dpp_id || "—"}</code>
          </p>
          <p className="mt-1 text-xs text-gray-400">Available: {available} unit · synthetic local allocation</p>
        </div>
        <p className="font-bold whitespace-nowrap">{euro(amount)}</p>
      </div>
      {children}
    </article>
  );
};

export default ProductCard;
