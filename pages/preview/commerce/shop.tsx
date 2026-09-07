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

import PreviewBadge from "components/previewCommerce/PreviewBadge";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { chipStyle } from "components/previewCommerce/previewTokens";
import { PreviewHeading } from "components/previewCommerce/ui";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { SHOP_INVENTORY, SHOP_KPIS, SHOP_ORDERS } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "pages/_app";
import { CSSProperties, ReactElement } from "react";

const ORDER_COLS = "130px minmax(200px,1fr) 160px 130px 120px 100px";
const INV_COLS = "minmax(0,1fr) 140px 160px 120px";

const subToneColor: Record<"success" | "muted" | "dpp", string> = {
  success: "#008060",
  muted: "var(--ifr-text-secondary)",
  dpp: "#eb7b35",
};

const CommercePreviewShop: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");

  return (
    <main
      style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 120px", fontFamily: "var(--ifr-font-body)" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <PreviewHeading>{t("My shop")}</PreviewHeading>
        <span style={{ fontSize: "14px", color: "var(--ifr-text-secondary)" }}>
          {t("Fab City Hamburg · open since 12 Mar 2026")}
        </span>
        <PreviewBadge kind="sample" />
      </div>

      <div
        className="ifr-pc-kpi"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" }}
      >
        {SHOP_KPIS.map(k => (
          <div
            key={k.label}
            style={{ border: "1px solid #c9cccf", borderRadius: "6px", background: "#fff", padding: "16px" }}
          >
            <p style={{ margin: 0, fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{t(k.label)}</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--ifr-font-heading)", fontSize: "26px", fontWeight: 700 }}>
              {k.value}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: subToneColor[k.subTone] }}>{t(k.sub)}</p>
          </div>
        ))}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid #c9cccf",
          }}
        >
          <h2 style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "20px", fontWeight: 700 }}>
            {t("Orders")}
          </h2>
          <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
            {t("synced from Medusa · 2 min ago")}
          </span>
        </div>
        <div style={headerRowStyle(ORDER_COLS)}>
          <span>{t("ORDER")}</span>
          <span>{t("ITEM")}</span>
          <span>{t("BUYER")}</span>
          <span>{t("STATUS")}</span>
          <span>{t("PASSPORT")}</span>
          <span style={{ textAlign: "right" }}>{t("TOTAL")}</span>
        </div>
        {SHOP_ORDERS.map(o => (
          <div key={o.id} style={bodyRowStyle(ORDER_COLS)}>
            <span style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: "12px" }}>{o.id}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ fontWeight: 500 }}>{t(o.item)}</span>
              <span style={{ display: "block", fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
                {t(o.variant)}
              </span>
            </span>
            <span style={{ fontSize: "13px", color: "var(--ifr-text-secondary)" }}>{o.buyer}</span>
            <span>
              <span style={chipStyle(o.statusTone)}>{t(o.status)}</span>
            </span>
            <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{o.passport}</span>
            <span style={{ textAlign: "right", fontWeight: 600 }}>{o.total}</span>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid #c9cccf", borderRadius: "6px", background: "#fff", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #c9cccf" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "20px", fontWeight: 700 }}>
            {t("Inventory")}
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          {SHOP_INVENTORY.map(s => (
            <div key={s.sku} style={{ ...bodyRowStyle(INV_COLS), borderTop: "1px solid #c9cccf" }}>
              <span style={{ fontWeight: 500 }}>{t(s.name)}</span>
              <span style={{ fontSize: "13px", color: "var(--ifr-text-secondary)" }}>{s.sku}</span>
              <span style={{ fontSize: "13px", color: "var(--ifr-text-secondary)" }}>{t(s.lead)}</span>
              <span style={{ textAlign: "right" }}>
                <span style={chipStyle(s.qtyTone)}>{t(s.qty)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

function headerRowStyle(cols: string): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: cols,
    gap: "12px",
    minWidth: "1020px",
    padding: "10px 16px",
    background: "rgba(200,212,229,0.15)",
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--ifr-text-secondary)",
    letterSpacing: "0.4px",
  };
}

function bodyRowStyle(cols: string): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: cols,
    gap: "12px",
    minWidth: cols === INV_COLS ? "760px" : "1020px",
    padding: "14px 16px",
    borderTop: "1px solid #c9cccf",
    alignItems: "center",
    fontSize: "14px",
  };
}

CommercePreviewShop.publicPage = true;
CommercePreviewShop.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewShop;
