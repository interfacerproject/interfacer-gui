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

import { CartTotals, formatEur, MockLine } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { PreviewClipboardGlyphSm } from "./glyphs";

const muted = "var(--ifr-text-secondary)";

/** The order summary shown in the checkout right rail. */
export default function OrderSummary({
  lines,
  totals,
  shippingLabel,
}: {
  lines: MockLine[];
  totals: CartTotals;
  shippingLabel?: string;
}) {
  const { t } = useTranslation("commercePreviewProps");
  return (
    <div
      style={{
        border: "1px solid #c9cccf",
        borderRadius: "6px",
        background: "#fff",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <span style={{ fontSize: "16px", fontWeight: 500 }}>{t("Order summary")}</span>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {lines.map(l => (
          <div key={l.productSlug} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: "13px", fontWeight: 500 }}>{t(l.name)}</span>
              <span style={{ display: "block", fontSize: "11px", color: "var(--ifr-text-muted)" }}>
                {t(l.variantLabel)}
              </span>
            </span>
            <span style={{ fontSize: "13px", color: "var(--ifr-text-muted)" }}>
              {formatEur(l.unitPrice * l.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ height: "1px", background: "#c9cccf" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
        <Row label={t("Subtotal")} value={formatEur(totals.subtotal)} strong />
        <Row
          label={shippingLabel ? t("Shipping ({{method}})", { method: shippingLabel }) : t("Shipping")}
          value={formatEur(totals.shipping)}
          strong
        />
        <Row label={t("VAT")} value={t("Included where applicable")} muted />
      </div>

      <div style={{ height: "1px", background: "#c9cccf" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "16px", fontWeight: 500 }}>{t("Total")}</span>
        <span style={{ fontFamily: "var(--ifr-font-heading)", fontSize: "20px", fontWeight: 700 }}>
          {formatEur(totals.total)}
        </span>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        <PreviewClipboardGlyphSm />
        <span style={{ fontSize: "12px", color: "var(--ifr-text-muted)", lineHeight: 1.5 }}>
          {t("Eligible products receive a Digital Product Passport after fulfilment.")}
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted: isMuted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
      <span style={{ color: muted }}>{label}</span>
      <span
        style={{
          fontWeight: strong ? 500 : 400,
          color: isMuted ? "var(--ifr-text-muted)" : "var(--ifr-text-primary)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
