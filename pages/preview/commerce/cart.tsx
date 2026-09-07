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

import { ClipboardGlyph } from "components/previewCommerce/glyphs";
import PreviewCommerceHeader from "components/previewCommerce/PreviewCommerceHeader";
import { placeholderBlock } from "components/previewCommerce/placeholder";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { PreviewPage } from "components/previewCommerce/ui";
import { useCommercePreview } from "lib/previewCommerce/cart";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { formatEur, MOCK_PRODUCT, MockLine } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const muted = "var(--ifr-text-secondary)";

const CommercePreviewCart: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const router = useRouter();
  const { lines, totals } = useCommercePreview();
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <PreviewPage
      header={
        <PreviewCommerceHeader
          eyebrow={t("BUY ON INTERFACER")}
          title={t("Your cart")}
          description={t("{{count}} items · 1 manufacturer", { count: itemCount })}
        />
      }
    >
      <div
        className="ifr-pc-collapse"
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: "32px", alignItems: "start" }}
      >
        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "16px", color: muted }}>{MOCK_PRODUCT.seller}</span>
            <span style={{ fontSize: "12px", color: "var(--ifr-text-muted)" }}>
              {t("Ships from")} <span style={{ fontWeight: 500, color: "#036a53" }}>{MOCK_PRODUCT.shipsFrom}</span>
            </span>
          </div>
          <div style={{ height: "1px", background: "#c9cccf" }} />
          {lines.map((l, i) => (
            <div key={l.productSlug}>
              <CartRow line={l} />
              <div style={{ height: "1px", background: "#c9cccf", marginTop: i === lines.length - 1 ? 0 : 0 }} />
            </div>
          ))}
        </div>

        {/* Summary */}
        <div
          style={{
            border: "1px solid #c9cccf",
            borderRadius: "4px",
            background: "#fff",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "16px", color: muted }}>{t("Summary")}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <Row label={t("Subtotal")} value={formatEur(totals.subtotal)} strong />
            <Row label={t("Shipping")} value={t("Calculated at checkout")} muted />
            <Row label={t("VAT")} value={t("Included where applicable")} muted />
          </div>
          <div style={{ height: "1px", background: "#c9cccf" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            <span>{t("Total")}</span>
            <span>{formatEur(totals.subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/preview/commerce/checkout")}
            style={{
              height: "48px",
              border: "none",
              borderRadius: "4px",
              background: "#036a53",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t("Checkout")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/preview/commerce")}
            style={{
              height: "48px",
              border: "1px solid #c9cccf",
              borderRadius: "4px",
              background: "#fff",
              color: "var(--ifr-text-primary)",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t("Keep browsing")}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "16px" }}>
        <ClipboardGlyph size={16} stroke="var(--ifr-text-muted)" />
        <span style={{ fontSize: "14px", color: "var(--ifr-text-muted)" }}>
          {t("Digital Product Passports are issued for eligible products after fulfilment.")}
        </span>
      </div>
    </PreviewPage>
  );
};

function CartRow({ line }: { line: MockLine }) {
  const { t } = useTranslation("commercePreviewProps");
  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "16px 0" }}>
      <div style={placeholderBlock(80)} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "14px", fontWeight: 500 }}>{t(line.name)}</span>
        <span style={{ fontSize: "12px", color: "var(--ifr-text-muted)" }}>{t(line.variantLabel)}</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
          <span style={qtyBtn}>{"−"}</span>
          <span style={{ fontSize: "14px", fontWeight: 500 }}>{line.quantity}</span>
          <span style={qtyBtn}>{"+"}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
        <span style={{ fontSize: "14px", fontWeight: 500 }}>{formatEur(line.unitPrice * line.quantity)}</span>
        <span style={{ fontSize: "12px", color: "var(--ifr-text-muted)" }}>{t("Remove")}</span>
      </div>
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  width: "28px",
  height: "28px",
  border: "1px solid #c9cccf",
  borderRadius: "4px",
  display: "grid",
  placeItems: "center",
  fontSize: "16px",
  fontWeight: 500,
  color: "var(--ifr-text-primary)",
};

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
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: muted }}>{label}</span>
      <span
        style={{ fontWeight: strong ? 500 : 400, color: isMuted ? "var(--ifr-text-muted)" : "var(--ifr-text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}

CommercePreviewCart.publicPage = true;
CommercePreviewCart.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewCart;
