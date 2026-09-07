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

import { InfoGlyph } from "components/previewCommerce/glyphs";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import SellerGroup from "components/previewCommerce/SellerGroup";
import { OutlineButton, PreviewHeading, PrimaryButton } from "components/previewCommerce/ui";
import { useCommercePreview } from "lib/previewCommerce/cart";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { formatEur, MockLine } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

function groupBySeller(lines: MockLine[]): MockLine[][] {
  const order: string[] = [];
  const map = new Map<string, MockLine[]>();
  for (const l of lines) {
    if (!map.has(l.seller)) {
      map.set(l.seller, []);
      order.push(l.seller);
    }
    map.get(l.seller)!.push(l);
  }
  return order.map(s => map.get(s)!);
}

const CommercePreviewCart: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const router = useRouter();
  const { lines, totals } = useCommercePreview();
  const groups = groupBySeller(lines);
  const sellerNames = groups.map(g => g[0].seller);

  return (
    <main
      style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 120px", fontFamily: "var(--ifr-font-body)" }}
    >
      <PreviewHeading style={{ marginBottom: "4px" }}>{t("Your cart")}</PreviewHeading>
      <p style={{ margin: "0 0 24px", fontSize: "14px", color: "var(--ifr-text-secondary)" }}>
        {sellerNames.length === 2
          ? t("2 items from 2 sellers — {{a}} and {{b}} · sample data", { a: sellerNames[0], b: sellerNames[1] })
          : t("{{count}} items · sample data", { count: lines.length })}
      </p>

      <div
        className="ifr-pc-collapse"
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: "24px", alignItems: "start" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
          {groups.map(g => (
            <SellerGroup key={g[0].seller} lines={g} />
          ))}

          <div
            style={{
              display: "flex",
              gap: "12px",
              padding: "14px 16px",
              border: "1px solid #c9cccf",
              borderRadius: "6px",
              background: "#fff5ea",
            }}
          >
            <InfoGlyph size={18} stroke="#916a00" />
            <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: "#916a00" }}>
              {t(
                "Two sellers in one cart: Medusa splits this into two orders — separate shipments, separate invoices, separate payouts. The buyer pays once."
              )}
            </p>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #c9cccf",
            borderRadius: "6px",
            background: "#fff",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h2 style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "20px", fontWeight: 700 }}>
            {t("Summary")}
          </h2>
          <SummaryRow label={t("Subtotal")} value={formatEur(totals.subtotal)} />
          <SummaryRow label={t("Shipping (1 of 2 sellers)")} value={formatEur(totals.shipping)} />
          <SummaryRow label={t("VAT 19%")} value={formatEur(totals.vat)} />
          <hr style={{ border: "none", borderTop: "1px solid #c9cccf", margin: "4px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>{t("Total")}</span>
            <span style={{ fontFamily: "var(--ifr-font-heading)", fontSize: "24px", fontWeight: 700 }}>
              {formatEur(totals.total)}
            </span>
          </div>
          <PrimaryButton
            fullWidth
            style={{ marginTop: "4px" }}
            onClick={() => router.push("/preview/commerce/checkout")}
          >
            {t("Checkout")}
          </PrimaryButton>
          <OutlineButton
            fullWidth
            style={{ height: "40px", fontSize: "14px", fontWeight: 500 }}
            onClick={() => router.push("/preview/commerce")}
          >
            {t("Keep browsing")}
          </OutlineButton>
        </div>
      </div>
    </main>
  );
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
      <span style={{ color: "var(--ifr-text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

CommercePreviewCart.publicPage = true;
CommercePreviewCart.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewCart;
