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

import PreviewCommerceHeader from "components/previewCommerce/PreviewCommerceHeader";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { chipStyle } from "components/previewCommerce/previewTokens";
import { OutlineButton, PreviewPage, PrimaryButton } from "components/previewCommerce/ui";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { RECENT_ORDERS, SALES_KPIS } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { CSSProperties, ReactElement } from "react";

const subToneColor: Record<"amber" | "muted", string> = {
  amber: "#916a00",
  muted: "var(--ifr-text-muted)",
};

const ROW_COLS = "130px minmax(0,1fr) 120px 100px";

const CommercePreviewSales: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const router = useRouter();

  return (
    <PreviewPage
      header={
        <PreviewCommerceHeader
          eyebrow={t("SELL THROUGH INTERFACER")}
          title={t("Sales overview")}
          description={t("Manage orders, inventory and product availability.")}
        />
      }
    >
      <div
        className="ifr-pc-kpi"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" }}
      >
        {SALES_KPIS.map(k => (
          <div
            key={k.label}
            style={{ border: "1px solid #c9cccf", borderRadius: "6px", background: "#fff", padding: "16px" }}
          >
            <p style={{ margin: 0, fontSize: "12px", color: "var(--ifr-text-muted)" }}>{t(k.label)}</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--ifr-font-heading)", fontSize: "26px", fontWeight: 700 }}>
              {k.value}
            </p>
            {k.sub && <p style={{ margin: "4px 0 0", fontSize: "12px", color: subToneColor[k.subTone] }}>{t(k.sub)}</p>}
          </div>
        ))}
      </div>

      <div
        style={{
          border: "1px solid #c9cccf",
          borderRadius: "6px",
          background: "#fff",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #c9cccf" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "18px", fontWeight: 700 }}>
            {t("Recent orders")}
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={headerRow()}>
            <span>{t("Order")}</span>
            <span>{t("Product")}</span>
            <span>{t("Status")}</span>
            <span style={{ textAlign: "right" }}>{t("Total")}</span>
          </div>
          {RECENT_ORDERS.map(o => (
            <div key={o.id} style={bodyRow()}>
              <span style={{ color: "#036a53", fontWeight: 500 }}>{o.id}</span>
              <span>{t(o.product)}</span>
              <span>
                <span style={chipStyle(o.statusTone)}>{t(o.status)}</span>
              </span>
              <span style={{ textAlign: "right", fontWeight: 500 }}>{o.total}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <PrimaryButton onClick={() => router.push("/preview/commerce/orders")}>{t("View all orders")}</PrimaryButton>
        <OutlineButton onClick={() => router.push("/preview/commerce/inventory")}>
          {t("Manage inventory")}
        </OutlineButton>
      </div>
    </PreviewPage>
  );
};

function headerRow(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: ROW_COLS,
    gap: "12px",
    minWidth: "640px",
    padding: "10px 16px",
    background: "rgba(200,212,229,0.15)",
    fontSize: "12px",
    color: "var(--ifr-text-muted)",
  };
}

function bodyRow(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: ROW_COLS,
    gap: "12px",
    minWidth: "640px",
    padding: "14px 16px",
    borderTop: "1px solid #c9cccf",
    alignItems: "center",
    fontSize: "14px",
  };
}

CommercePreviewSales.publicPage = true;
CommercePreviewSales.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewSales;
