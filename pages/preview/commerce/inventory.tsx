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
import { usePreviewDialog } from "components/previewCommerce/PreviewDialog";
import { BackLink, OutlineButton, PreviewPage, PrimaryButton } from "components/previewCommerce/ui";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { INVENTORY } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { CSSProperties, ReactElement } from "react";

const COLS = "minmax(0,1fr) 150px 130px 70px 90px 150px 150px";

const CommercePreviewInventory: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const router = useRouter();
  const dialog = usePreviewDialog();

  return (
    <PreviewPage
      header={
        <PreviewCommerceHeader
          eyebrow={t("SELL THROUGH INTERFACER")}
          title={t("Inventory")}
          description={t("Track stock and availability for products sold through Interfacer.")}
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
          {t("Search inventory…")}
        </div>
        <Pill label={t("All stock levels")} />
        <Pill label={t("Product name")} />
      </div>

      <div style={{ border: "1px solid #c9cccf", borderRadius: "6px", background: "#fff", overflowX: "auto" }}>
        <div style={headerRow()}>
          <span>{t("Product")}</span>
          <span>{t("Variant")}</span>
          <span>{t("SKU")}</span>
          <span>{t("Stock")}</span>
          <span>{t("Reserved")}</span>
          <span>{t("Available")}</span>
          <span>{t("Location")}</span>
        </div>
        {INVENTORY.map(r => (
          <div key={r.sku} style={bodyRow()}>
            <span style={{ fontWeight: 500 }}>{t(r.product)}</span>
            <span style={{ fontSize: "13px", color: "var(--ifr-text-muted)" }}>{t(r.variant)}</span>
            <span style={{ fontSize: "13px", color: "var(--ifr-text-muted)" }}>{r.sku}</span>
            <span style={{ fontWeight: 500 }}>{r.stock}</span>
            <span style={{ fontSize: "13px", color: "var(--ifr-text-muted)" }}>{r.reserved}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 500 }}>{r.available}</span>
              {r.lowStock && (
                <span
                  style={{
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: "#fff5ea",
                    color: "#916a00",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  {t("Low stock")}
                </span>
              )}
            </span>
            <span style={{ fontSize: "13px", color: "var(--ifr-text-muted)" }}>{r.location}</span>
          </div>
        ))}
      </div>

      <p style={{ margin: "10px 0 0", fontSize: "12px", color: "var(--ifr-text-muted)", maxWidth: "80ch" }}>
        {t("Stock is mirrored from your zenflows")}{" "}
        <span style={{ fontFamily: "ui-monospace,Menlo,monospace" }}>{t("EconomicResource")}</span>{" "}
        {t(
          "records — Interfacer stays the source of truth for the resource and its passports; commerce owns price, stock and orders."
        )}
      </p>

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
          {t("Showing {{shown}} of {{total}} items", { shown: INVENTORY.length, total: INVENTORY.length })}
        </span>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <OutlineButton onClick={() => router.push("/preview/commerce/orders")}>{t("View orders")}</OutlineButton>
          <PrimaryButton onClick={() => dialog.open(t("Update stock"))}>{t("Update stock")}</PrimaryButton>
        </div>
      </div>

      {dialog.element}
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
    minWidth: "900px",
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
    minWidth: "900px",
    padding: "14px 16px",
    borderTop: "1px solid #c9cccf",
    alignItems: "center",
    fontSize: "14px",
  };
}

CommercePreviewInventory.publicPage = true;
CommercePreviewInventory.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewInventory;
