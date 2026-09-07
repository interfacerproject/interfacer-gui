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
import { ADMIN } from "components/previewCommerce/previewTokens";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { ADMIN_NAV, ADMIN_OPEN_QUESTIONS, ADMIN_ROWS, ADMIN_WEBHOOKS } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const COLS = "minmax(220px,1fr) 150px 110px 90px 190px";

const CommercePreviewAdmin: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px minmax(0,1fr)",
        minHeight: "calc(100vh - 40px)",
        background: ADMIN.page,
        fontFamily: "var(--ifr-font-body)",
        color: ADMIN.text,
      }}
      className="ifr-pc-collapse"
    >
      <aside
        style={{
          borderRight: `1px solid ${ADMIN.border}`,
          background: ADMIN.surface,
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px 18px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: ADMIN.ink,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {t("M")}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>{t("Medusa Admin")}</p>
            <p style={{ margin: 0, fontSize: "11px", color: ADMIN.muted }}>{t("interfacer.dyne.org")}</p>
          </div>
        </div>
        {ADMIN_NAV.map(item => {
          const active = item === "Products";
          return (
            <div
              key={item}
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                background: active ? ADMIN.rail : "transparent",
                fontWeight: active ? 600 : 400,
                color: active ? ADMIN.text : ADMIN.textSoft,
              }}
            >
              {t(item)}
            </div>
          );
        })}
        <div
          style={{
            marginTop: "auto",
            padding: "12px",
            borderRadius: "6px",
            background: ADMIN.rail,
            fontSize: "11px",
            color: ADMIN.textSoft,
            lineHeight: 1.5,
          }}
        >
          {t("Sales channel:")} <strong>{t("Interfacer GUI")}</strong>
          <br />
          {t("Region: EU · EUR")}
        </div>
      </aside>

      <div style={{ padding: "24px 28px 80px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "6px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 600, color: ADMIN.text }}>{t("Products")}</h1>
            <PreviewBadge kind="mockup" />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled
              style={{
                height: "34px",
                padding: "0 14px",
                border: `1px solid ${ADMIN.border}`,
                borderRadius: "6px",
                background: "#fff",
                fontSize: "13px",
                cursor: "not-allowed",
              }}
            >
              {t("Import")}
            </button>
            <button
              type="button"
              disabled
              style={{
                height: "34px",
                padding: "0 14px",
                border: "none",
                borderRadius: "6px",
                background: ADMIN.ink,
                color: "#fff",
                fontSize: "13px",
                cursor: "not-allowed",
              }}
            >
              {t("Create")}
            </button>
          </div>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: "13px", color: ADMIN.muted, maxWidth: "80ch" }}>
          {t("Products are mirrored from zenflows")}{" "}
          <span style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: "12px" }}>{t("EconomicResource")}</span>{" "}
          {t(
            "records. Interfacer stays the source of truth for the resource, its design lineage and its passports; Medusa owns price, stock, orders and payouts."
          )}
        </p>

        <div
          style={{ border: `1px solid ${ADMIN.border}`, borderRadius: "8px", background: "#fff", overflowX: "auto" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              gap: "12px",
              minWidth: "900px",
              padding: "10px 16px",
              background: ADMIN.page,
              borderBottom: `1px solid ${ADMIN.border}`,
              fontSize: "11px",
              fontWeight: 600,
              color: ADMIN.muted,
              letterSpacing: "0.4px",
            }}
          >
            <span>{t("PRODUCT")}</span>
            <span>{t("SELLER")}</span>
            <span>{t("STATUS")}</span>
            <span>{t("STOCK")}</span>
            <span>{t("LINKED RESOURCE")}</span>
          </div>
          {ADMIN_ROWS.map(r => (
            <div
              key={r.resource}
              style={{
                display: "grid",
                gridTemplateColumns: COLS,
                gap: "12px",
                minWidth: "900px",
                padding: "12px 16px",
                borderBottom: `1px solid ${ADMIN.rail}`,
                alignItems: "center",
                fontSize: "13px",
                color: ADMIN.text,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <span
                  style={{ width: "32px", height: "32px", borderRadius: "4px", background: ADMIN.rail, flex: "none" }}
                />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 500 }}>{t(r.name)}</span>
                  <span style={{ display: "block", fontSize: "11px", color: ADMIN.muted }}>{t(r.variants)}</span>
                </span>
              </span>
              <span style={{ fontSize: "12px", color: ADMIN.textSoft }}>{t(r.seller)}</span>
              <span>
                <span
                  style={{
                    padding: "3px 9px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: r.statusTone === "live" ? ADMIN.chipLiveBg : ADMIN.rail,
                    color: r.statusTone === "live" ? ADMIN.chipLiveText : ADMIN.textSoft,
                  }}
                >
                  {t(r.status)}
                </span>
              </span>
              <span style={{ fontSize: "12px" }}>{r.stock}</span>
              <span style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: "11px", color: ADMIN.textSoft }}>
                {r.resource}
              </span>
            </div>
          ))}
        </div>

        <div
          className="ifr-pc-collapse"
          style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
        >
          <div
            style={{ border: `1px solid ${ADMIN.border}`, borderRadius: "8px", background: "#fff", padding: "16px" }}
          >
            <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 600, color: ADMIN.text }}>
              {t("Webhooks into Interfacer")}
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: ADMIN.textSoft }}
            >
              {ADMIN_WEBHOOKS.map(w => (
                <span key={w.event}>
                  <span style={{ fontFamily: "ui-monospace,Menlo,monospace" }}>{w.event}</span>
                  {" → "}
                  {t(w.effect)}
                </span>
              ))}
            </div>
          </div>
          <div
            style={{ border: `1px solid ${ADMIN.border}`, borderRadius: "8px", background: "#fff", padding: "16px" }}
          >
            <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 600, color: ADMIN.text }}>
              {t("Open questions for the integration")}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "12px",
                color: ADMIN.textSoft,
                lineHeight: 1.5,
              }}
            >
              {ADMIN_OPEN_QUESTIONS.map(q => (
                <span key={q}>{t(q)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CommercePreviewAdmin.publicPage = true;
CommercePreviewAdmin.getLayout = (page: ReactElement) => (
  <PreviewCommerceLayout chrome="bare">{page}</PreviewCommerceLayout>
);

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewAdmin;
