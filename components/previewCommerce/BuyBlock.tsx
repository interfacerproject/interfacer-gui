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

import { clampCommerceQty, persistSelection, useCommercePreviewOptional } from "lib/previewCommerce/cart";
import { formatEur, MOCK_PRODUCT, VariantId, variantById } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";
import PreviewNotice from "./PreviewNotice";
import { CartGlyph, ClipboardGlyph } from "./glyphs";

/**
 * The buy block. Self-contained: works both on the preview product route (where
 * the CommercePreviewProvider is mounted and drives it live) and on the real
 * product page (no provider — it keeps local state and writes the selection to
 * sessionStorage so the preview cart picks it up).
 */
export default function BuyBlock() {
  const { t } = useTranslation("commercePreviewProps");
  const router = useRouter();
  const ctx = useCommercePreviewOptional();

  const [localVariant, setLocalVariant] = useState<VariantId>("assembled");
  const [localQty, setLocalQty] = useState(1);

  const variant = ctx ? ctx.variant : localVariant;
  const qty = ctx ? ctx.qty : localQty;
  const setVariant = ctx ? ctx.setVariant : setLocalVariant;
  const incQty = ctx ? ctx.incQty : () => setLocalQty(n => clampCommerceQty(n + 1));
  const decQty = ctx ? ctx.decQty : () => setLocalQty(n => clampCommerceQty(n - 1));

  const active = variantById(variant);

  const go = (path: string) => {
    if (!ctx) persistSelection(variant, qty);
    router.push(path);
  };

  return (
    <div
      style={{
        border: "1px solid #c9cccf",
        borderRadius: "4px",
        background: "#fff",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        fontFamily: "var(--ifr-font-body)",
      }}
    >
      <PreviewNotice />

      {/* Price */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--ifr-font-heading)",
              fontSize: "30px",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "var(--ifr-text-primary)",
            }}
          >
            {formatEur(active.price)}
          </p>
          <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{t("incl. VAT")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#036a53" }} />
          <span style={{ fontSize: "14px", fontWeight: 500 }}>{t(active.stockLine)}</span>
        </div>
      </div>

      {/* Variants */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{t("Variant")}</span>
        {MOCK_PRODUCT.variants.map(v => {
          const selected = v.id === variant;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(v.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: "6px",
                border: selected ? "2px solid #036a53" : "1px solid #c9cccf",
                background: selected ? "#f1f8f5" : "#fff",
              }}
            >
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{t(v.label)}</span>
                <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{t(v.blurb)}</span>
              </span>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>{formatEur(v.price)}</span>
            </button>
          );
        })}
      </div>

      {/* Quantity + lead time */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #c9cccf",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={decQty}
            aria-label={t("Decrease quantity")}
            style={{
              width: "36px",
              height: "40px",
              border: "none",
              background: "#fff",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            {"−"}
          </button>
          <span style={{ minWidth: "36px", textAlign: "center", fontSize: "14px", fontWeight: 600 }}>{qty}</span>
          <button
            type="button"
            onClick={incQty}
            aria-label={t("Increase quantity")}
            style={{
              width: "36px",
              height: "40px",
              border: "none",
              background: "#fff",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            {"+"}
          </button>
        </div>
        <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{t(active.leadTime)}</span>
      </div>

      {/* CTAs */}
      <button
        type="button"
        onClick={() => go("/preview/commerce/cart")}
        style={{
          height: "48px",
          border: "none",
          borderRadius: "8px",
          background: "#036a53",
          color: "#fff",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <CartGlyph stroke="#fff" />
        {t("Add to cart")}
      </button>
      <button
        type="button"
        onClick={() => go("/preview/commerce/checkout")}
        style={{
          height: "48px",
          border: "1px solid #c9cccf",
          borderRadius: "8px",
          background: "#fff",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {t("Buy now")}
      </button>

      {/* Footnotes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
          {t("Sold by Fab City Hamburg · payments handled by Stripe")}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: 500,
            color: "#eb7b35",
          }}
        >
          <ClipboardGlyph stroke="#eb7b35" />
          {t("Each unit ships with its Digital Product Passport")}
        </span>
      </div>
    </div>
  );
}
