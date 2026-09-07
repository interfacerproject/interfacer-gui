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

import { formatEur, MockLine } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { placeholderBlock } from "./placeholder";

/** One line inside a seller group on the cart screen. */
export default function CartLine({ line }: { line: MockLine }) {
  const { t } = useTranslation("commercePreviewProps");
  return (
    <div style={{ display: "flex", gap: "16px", padding: "16px", alignItems: "center" }}>
      <div style={placeholderBlock(80)} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "16px", fontWeight: 600 }}>{t(line.name)}</span>
        <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{t(line.variantLabel)}</span>
        <span style={{ fontSize: "12px", color: "#036a53" }}>{t(line.note)}</span>
      </div>
      {/* Display-only stepper, matching the prototype. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #c9cccf",
          borderRadius: "6px",
          overflow: "hidden",
          flex: "none",
        }}
      >
        <span
          style={{
            width: "32px",
            height: "36px",
            display: "grid",
            placeItems: "center",
            fontSize: "16px",
            color: "#6c707c",
          }}
        >
          {"−"}
        </span>
        <span style={{ minWidth: "32px", textAlign: "center", fontSize: "14px", fontWeight: 600 }}>
          {line.quantity}
        </span>
        <span
          style={{
            width: "32px",
            height: "36px",
            display: "grid",
            placeItems: "center",
            fontSize: "16px",
            color: "#6c707c",
          }}
        >
          {"+"}
        </span>
      </div>
      <span style={{ width: "96px", textAlign: "right", fontSize: "16px", fontWeight: 600, flex: "none" }}>
        {formatEur(line.unitPrice * line.quantity)}
      </span>
    </div>
  );
}
