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

import DppIssuedCard from "components/previewCommerce/DppIssuedCard";
import { CheckGlyph } from "components/previewCommerce/glyphs";
import { placeholderBlock } from "components/previewCommerce/placeholder";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { PreviewHeading } from "components/previewCommerce/ui";
import { useCommercePreview } from "lib/previewCommerce/cart";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { formatEur, MOCK_ORDER_ID } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const CommercePreviewOrder: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const { lines, totals } = useCommercePreview();

  return (
    <main
      style={{
        maxWidth: "820px",
        margin: "0 auto",
        padding: "40px 24px 120px",
        fontFamily: "var(--ifr-font-body)",
        animation: "ifr-preview-fade-up 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          textAlign: "center",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "9999px",
            background: "#f1f8f5",
            border: "1px solid rgba(3,106,83,0.2)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CheckGlyph size={26} stroke="#036a53" />
        </div>
        <PreviewHeading>{t("Order {{id}} confirmed", { id: MOCK_ORDER_ID })}</PreviewHeading>
        <p style={{ margin: 0, fontSize: "15px", color: "var(--ifr-text-secondary)", maxWidth: "56ch" }}>
          {t(
            "Sample confirmation. In the intended flow, {{total}} is paid by card, two orders are created — one per seller — and receipts land in your inbox.",
            { total: formatEur(totals.total) }
          )}
        </p>
      </div>

      <div
        style={{
          border: "1px solid #c9cccf",
          borderRadius: "6px",
          background: "#fff",
          overflowX: "auto",
          marginBottom: "20px",
        }}
      >
        {lines.map(l => (
          <div
            key={l.productSlug}
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "center",
              padding: "16px",
              borderBottom: "1px solid #c9cccf",
            }}
          >
            <div style={placeholderBlock(56)} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>{t(l.name)}</p>
              <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
                {t("{{seller}} · {{variant}}", { seller: l.seller, variant: l.variantLabel })}
              </p>
            </div>
            <span
              style={{
                padding: "3px 9px",
                borderRadius: "4px",
                background: "#fff5ea",
                color: "#916a00",
                fontSize: "11px",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {t(l.status)}
            </span>
            <span style={{ fontSize: "15px", fontWeight: 600, width: "88px", textAlign: "right" }}>
              {formatEur(l.unitPrice * l.quantity)}
            </span>
          </div>
        ))}
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            justifyContent: "space-between",
            background: "rgba(200,212,229,0.15)",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--ifr-text-secondary)" }}>
            {t("Shipping {{s}} · VAT {{v}}", { s: formatEur(totals.shipping), v: formatEur(totals.vat) })}
          </span>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>{formatEur(totals.total)}</span>
        </div>
      </div>

      <DppIssuedCard />
    </main>
  );
};

CommercePreviewOrder.publicPage = true;
CommercePreviewOrder.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewOrder;
