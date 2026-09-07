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

import { MockLine } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import CartLine from "./CartLine";

/** One card per seller on the cart screen: a header row + that seller's lines. */
export default function SellerGroup({ lines }: { lines: MockLine[] }) {
  const { t } = useTranslation("commercePreviewProps");
  if (lines.length === 0) return null;
  const head = lines[0];
  return (
    <div style={{ border: "1px solid #c9cccf", borderRadius: "6px", background: "#fff", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderBottom: "1px solid #c9cccf",
          background: "rgba(200,212,229,0.15)",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "9999px",
            background: "rgba(3,106,83,0.2)",
            display: "grid",
            placeItems: "center",
            fontSize: "11px",
            fontWeight: 600,
            color: "#036a53",
          }}
        >
          {head.sellerInitials}
        </div>
        <span style={{ fontSize: "14px", fontWeight: 600 }}>{t(head.seller)}</span>
        <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
          {"· "}
          {t(head.fulfilment)}
        </span>
      </div>
      {lines.map(l => (
        <CartLine key={l.productSlug} line={l} />
      ))}
    </div>
  );
}
