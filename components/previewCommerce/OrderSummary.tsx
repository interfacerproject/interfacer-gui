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
import { placeholderBlock } from "./placeholder";

interface Props {
  lines: MockLine[];
  totals: CartTotals;
}

/** The compact order summary shown in the checkout right rail. */
export default function OrderSummary({ lines, totals }: Props) {
  const { t } = useTranslation("commercePreviewProps");
  return (
    <div
      style={{
        border: "1px solid #c9cccf",
        borderRadius: "6px",
        background: "#fff",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h2
        style={{
          margin: "0 0 4px",
          fontFamily: "var(--ifr-font-heading)",
          fontSize: "16px",
          fontWeight: 700,
        }}
      >
        {t("Order summary")}
      </h2>

      {lines.map(l => (
        <div key={l.productSlug} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={placeholderBlock(44)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 500 }}>{t(l.name)}</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--ifr-text-secondary)" }}>{t(l.seller)}</p>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{formatEur(l.unitPrice * l.quantity)}</span>
        </div>
      ))}

      <hr style={{ border: "none", borderTop: "1px solid #c9cccf", margin: "4px 0" }} />
      <Row label={t("Shipping")} value={formatEur(totals.shipping)} />
      <Row label={t("VAT 19%")} value={formatEur(totals.vat)} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600 }}>{t("Total")}</span>
        <span style={{ fontFamily: "var(--ifr-font-heading)", fontSize: "20px", fontWeight: 700 }}>
          {formatEur(totals.total)}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
      <span style={{ color: "var(--ifr-text-secondary)" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
