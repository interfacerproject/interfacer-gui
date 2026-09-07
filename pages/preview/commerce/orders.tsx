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
import { BackLink, OutlineButton, PreviewPage } from "components/previewCommerce/ui";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { ORDERS, ORDERS_TOTAL_COUNT } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { CSSProperties, ReactElement } from "react";

const COLS = "130px minmax(0,1fr) 110px 120px 120px 110px";

const CommercePreviewOrders: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const router = useRouter();

  return (
    <PreviewPage
      header={
        <PreviewCommerceHeader
          eyebrow={t("SELL THROUGH INTERFACER")}
          title={t("Orders")}
          description={t("Track and fulfil orders for products sold through Interfacer.")}
        />
      }
    >
      <BackLink href="/preview/commerce/sales" label={t("Sales overview")} />

      <div style={{ display: "flex", gap: "12px", alignItems: "center", margin: "16px 0", flexWrap: "wrap" }}>
        <div
          style={{
            flex: 1,
            minWidth: "220px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            borderRadius: "9999px",
            border: "1px solid #c9cccf",
            background: "rgba(200,212,229,0.15)",
            fontSize: "14px",
            color: "var(--ifr-placeholder)",
          }}
        >
          {t("Search orders…")}
        </div>
        <Pill label={t("All statuses")} />
        <Pill label={t("Latest first")} />
      </div>

      <div style={{ border: "1px solid #c9cccf", borderRadius: "6px", background: "#fff", overflowX: "auto" }}>
        <div style={headerRow()}>
          <span>{t("Order")}</span>
          <span>{t("Product")}</span>
          <span>{t("Date")}</span>
          <span>{t("Fulfilment")}</span>
          <span>{t("Passport")}</span>
          <span style={{ textAlign: "right" }}>{t("Total")}</span>
        </div>
        {ORDERS.map(o => (
          <div key={o.id} style={bodyRow()}>
            <span style={{ color: "#036a53", fontWeight: 500 }}>{o.id}</span>
            <span>{t(o.product)}</span>
            <span style={{ fontSize: "13px", color: "var(--ifr-text-muted)" }}>{o.date}</span>
            <span>
              <span style={chipStyle(o.fulfilmentTone)}>{t(o.fulfilment)}</span>
            </span>
            <span
              style={{
                fontSize: "13px",
                color: o.passportIsDpp ? "#036a53" : "var(--ifr-text-muted)",
                fontWeight: o.passportIsDpp ? 500 : 400,
              }}
            >
              {o.passportIsDpp ? o.passport : t("Pending")}
            </span>
            <span style={{ textAlign: "right", fontWeight: 500 }}>{o.total}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--ifr-text-muted)" }}>
          {t("Showing {{shown}} of {{total}} orders", { shown: ORDERS.length, total: ORDERS_TOTAL_COUNT })}
        </span>
        <OutlineButton onClick={() => router.push("/preview/commerce/inventory")}>
          {t("Manage inventory")}
        </OutlineButton>
      </div>
    </PreviewPage>
  );
};

function Pill({ label }: { label: string }) {
  return (
    <span
      style={{
        height: "36px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "0 14px",
        borderRadius: "6px",
        border: "1px solid #c9cccf",
        background: "#fff",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--ifr-text-primary)",
      }}
    >
      {label} <span aria-hidden>{"▾"}</span>
    </span>
  );
}

function headerRow(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: COLS,
    gap: "12px",
    minWidth: "820px",
    padding: "10px 16px",
    background: "rgba(200,212,229,0.15)",
    fontSize: "12px",
    color: "var(--ifr-text-muted)",
  };
}

function bodyRow(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: COLS,
    gap: "12px",
    minWidth: "820px",
    padding: "14px 16px",
    borderTop: "1px solid #c9cccf",
    alignItems: "center",
    fontSize: "14px",
  };
}

CommercePreviewOrders.publicPage = true;
CommercePreviewOrders.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewOrders;
