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

import { CheckGlyph, DppGlyph } from "components/previewCommerce/glyphs";
import PreviewCommerceHeader from "components/previewCommerce/PreviewCommerceHeader";
import { usePreviewDialog } from "components/previewCommerce/PreviewDialog";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { OutlineButton, PreviewPage, PrimaryButton } from "components/previewCommerce/ui";
import { useCommercePreview } from "lib/previewCommerce/cart";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { deliveryMethodById, formatEur, MOCK_ORDER_ID, MOCK_PRODUCT } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const CommercePreviewOrder: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const router = useRouter();
  const dialog = usePreviewDialog();
  const { lines, totals, deliveryMethod } = useCommercePreview();
  const method = deliveryMethodById(deliveryMethod);

  return (
    <PreviewPage
      header={
        <PreviewCommerceHeader
          eyebrow={t("ORDER CONFIRMED")}
          title={t("Your purchase is complete")}
          description={t("{{seller}} has received your order.", { seller: MOCK_PRODUCT.seller })}
        />
      }
    >
      <div style={{ maxWidth: "760px", margin: "0 auto", animation: "ifr-preview-fade-up 0.3s ease" }}>
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "24px" }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "9999px",
              background: "#036a53",
              display: "grid",
              placeItems: "center",
            }}
          >
            <CheckGlyph size={22} stroke="#fff" />
          </div>
          <span style={{ fontSize: "12px", color: "var(--ifr-text-muted)" }}>
            {t("Order ID: {{id}}", { id: MOCK_ORDER_ID })}
          </span>
        </div>

        <div
          style={{
            border: "1px solid #c9cccf",
            borderRadius: "8px",
            background: "#fff",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {lines.map(l => (
              <div key={l.productSlug} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "15px", fontWeight: 600 }}>{t(l.name)}</span>
                  <span style={{ display: "block", fontSize: "12px", color: "var(--ifr-text-muted)" }}>
                    {t(l.variantLabel)}
                  </span>
                </span>
                <span style={{ fontSize: "14px", color: "var(--ifr-text-muted)" }}>
                  {formatEur(l.unitPrice * l.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div style={{ height: "1px", background: "#c9cccf" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span style={{ color: "var(--ifr-text-secondary)" }}>{t("Shipping")}</span>
            <span>{formatEur(totals.shipping)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 600 }}>
            <span>{t("Total")}</span>
            <span>{formatEur(totals.total)}</span>
          </div>
          <div style={{ height: "1px", background: "#c9cccf" }} />
          <span style={{ fontSize: "13px", color: "var(--ifr-text-muted)" }}>
            {t("{{title}} · {{detail}}", { title: t(method.title), detail: t(method.detail) })}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            border: "1px solid #c9cccf",
            borderRadius: "8px",
            background: "#fff",
            padding: "16px",
            marginTop: "20px",
          }}
        >
          <DppGlyph size={18} stroke="var(--ifr-text-muted)" />
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>{t("Digital Product Passports")}</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--ifr-text-muted)", lineHeight: 1.5 }}>
              {t("Eligible products will receive a Digital Product Passport after fulfilment.")}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
          <PrimaryButton onClick={() => dialog.open(t("View order"))}>{t("View order")}</PrimaryButton>
          <OutlineButton onClick={() => router.push("/products")}>{t("Continue exploring products")}</OutlineButton>
        </div>
      </div>

      {dialog.element}
    </PreviewPage>
  );
};

CommercePreviewOrder.publicPage = true;
CommercePreviewOrder.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewOrder;
