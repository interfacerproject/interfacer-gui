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

import { MOCK_DPP } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { ClipboardGlyph } from "./glyphs";
import { usePreviewDialog } from "./PreviewDialog";

/**
 * The point of the demo: the order event issues a unit-level Digital Product
 * Passport and writes the buyer into its custody chain.
 */
export default function DppIssuedCard() {
  const { t } = useTranslation("commercePreviewProps");
  const dialog = usePreviewDialog();

  const rows: Array<[string, string, boolean]> = [
    [t("Passport"), MOCK_DPP.passport, false],
    [t("Serial"), MOCK_DPP.serial, true],
    [t("Product"), MOCK_DPP.product, false],
    [t("Based on"), MOCK_DPP.basedOn, false],
  ];

  return (
    <div style={{ border: "1px solid #9e3c00", borderRadius: "8px", background: "#fff", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 16px",
          background: "rgba(235,123,53,0.1)",
          borderBottom: "1px solid rgba(235,123,53,0.3)",
        }}
      >
        <ClipboardGlyph size={18} stroke="#eb7b35" />
        <span style={{ fontFamily: "var(--ifr-font-heading)", fontSize: "16px", fontWeight: 700 }}>
          {t("Digital Product Passport issued")}
        </span>
        <span
          style={{
            marginLeft: "auto",
            padding: "2px 8px",
            borderRadius: "4px",
            background: "rgba(3,106,83,0.1)",
            color: "#036a53",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {t("UNIT")}
        </span>
      </div>

      <div style={{ display: "flex", gap: "20px", padding: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          style={{
            width: "112px",
            height: "112px",
            border: "1px solid #c9cccf",
            borderRadius: "4px",
            background: "#fff",
            display: "grid",
            placeItems: "center",
            flex: "none",
            fontSize: "11px",
            color: "var(--ifr-text-secondary)",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {t("QR placeholder")}
        </div>

        <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "6px 12px", fontSize: "14px" }}>
            {rows.flatMap(([label, value, mono]) => [
              <span key={label + "-l"} style={{ color: "var(--ifr-text-secondary)" }}>
                {label}
              </span>,
              <span
                key={label + "-v"}
                style={{ fontWeight: 600, fontFamily: mono ? "ui-monospace,Menlo,monospace" : undefined }}
              >
                {value}
              </span>,
            ])}
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: 1.55,
              color: "var(--ifr-text-secondary)",
              maxWidth: "62ch",
            }}
          >
            {t(MOCK_DPP.note)}
          </p>

          <div style={{ display: "flex", gap: "10px", marginTop: "2px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => dialog.open(t("View DPP"))}
              style={{
                height: "40px",
                padding: "0 18px",
                borderRadius: "6px",
                border: "none",
                background: "#036a53",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("View DPP")}
            </button>
            <button
              type="button"
              onClick={() => dialog.open(t("Track order"))}
              style={{
                height: "40px",
                padding: "0 18px",
                borderRadius: "6px",
                border: "1px solid #c9cccf",
                background: "#fff",
                color: "var(--ifr-text-primary)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {t("Track order")}
            </button>
          </div>
        </div>
      </div>
      {dialog.element}
    </div>
  );
}
