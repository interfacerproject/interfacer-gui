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

import BuyBlock from "components/previewCommerce/BuyBlock";
import { CubeGlyph } from "components/previewCommerce/glyphs";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { usePreviewDialog } from "components/previewCommerce/PreviewDialog";
import { Card, HRule, PreviewHeading } from "components/previewCommerce/ui";
import { MOCK_PRODUCT } from "lib/previewCommerce/mockData";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const TABS = ["Overview", "Digital Product Passports", "Traceability", "Reviews"];

const CommercePreviewProduct: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const dialog = usePreviewDialog();
  const p = MOCK_PRODUCT;

  return (
    <main
      style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 24px 120px", fontFamily: "var(--ifr-font-body)" }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          color: "var(--ifr-text-secondary)",
          marginBottom: "16px",
        }}
      >
        <span>{t("Products")}</span>
        <span>{"/"}</span>
        <span style={{ color: "var(--ifr-text-primary)", fontWeight: 500 }}>{p.name}</span>
      </div>

      <div
        className="ifr-pc-collapse"
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: "24px", alignItems: "start" }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
          <div
            style={{
              position: "relative",
              height: "520px",
              border: "1px solid #c9cccf",
              borderRadius: "6px",
              background: "rgba(200,212,229,0.5)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--ifr-text-secondary)" }}>
              {t("Product photograph — placeholder")}
            </span>
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                padding: "4px 12px",
                borderRadius: "9999px",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: "12px",
              }}
            >
              {"1/4"}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "4px",
                  border: i === 0 ? "2px solid #036a53" : "2px solid transparent",
                  background: i === 0 ? "rgba(200,212,229,0.5)" : "rgba(200,212,229,0.35)",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
              borderBottom: "1px solid #c9cccf",
              marginTop: "12px",
              flexWrap: "wrap",
            }}
          >
            {TABS.map((tab, i) => (
              <div
                key={tab}
                style={{
                  padding: "12px 0",
                  borderBottom: i === 0 ? "2px solid #036a53" : "2px solid transparent",
                  color: i === 0 ? "var(--ifr-text-primary)" : "var(--ifr-text-secondary)",
                  fontSize: "14px",
                  fontWeight: i === 0 ? 600 : 400,
                }}
              >
                {t(tab)}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span
                style={{
                  padding: "3px 9px",
                  borderRadius: "4px",
                  background: "rgba(20,59,181,0.1)",
                  color: "#143bb5",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {t("PRODUCT")}
              </span>
              <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
                {t("{{location}} · 34 stars · {{listed}}", { location: p.location, listed: p.listedOn })}
              </span>
            </div>
            <PreviewHeading>{p.name}</PreviewHeading>
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                lineHeight: 1.6,
                color: "var(--ifr-text-primary)",
                maxWidth: "70ch",
              }}
            >
              {t(p.description)}
            </p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {p.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: "3px 9px",
                    border: "1px solid #c9cccf",
                    borderRadius: "4px",
                    background: "#f5f5f5",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div
              style={{
                padding: "12px 16px",
                border: "1px solid #c9cccf",
                borderRadius: "6px",
                background: "rgba(200,212,229,0.15)",
                fontSize: "12px",
                color: "var(--ifr-text-secondary)",
              }}
            >
              {t(p.machinesAndMaterials)}
            </div>
          </div>
        </div>

        {/* Right column */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <BuyBlock />

          <Card style={{ borderRadius: "4px" }}>
            <div style={{ padding: "16px" }}>
              <button
                type="button"
                onClick={() => dialog.open(t("Contact Manufacturer"))}
                style={{
                  width: "100%",
                  height: "48px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#f1bd4d",
                  color: "#1a1a1a",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {t("Contact Manufacturer")}
              </button>
            </div>
            <HRule />
            <div style={{ padding: "16px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
                {t("Manufactured by")}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  border: "1px solid #c9cccf",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "9999px",
                    background: "rgba(3,106,83,0.2)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#036a53",
                  }}
                >
                  {p.sellerInitials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: 500 }}>{p.seller}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#036a53" }}>{p.location}</p>
                </div>
              </div>
            </div>
            <HRule />
            <div style={{ padding: "16px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
                {t("Based on open source design")}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px",
                  border: "1px solid #c9cccf",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    background: "#036a53",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <CubeGlyph size={16} stroke="#fff" />
                </div>
                <span style={{ flex: 1, fontSize: "14px", fontWeight: 500 }}>{p.basedOnDesign}</span>
              </div>
            </div>
            <HRule />
            <div style={{ padding: "16px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{t("License")}</p>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>{p.license}</p>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
                {t("Licensed by {{licensor}}", { licensor: p.licensor })}
              </p>
            </div>
          </Card>
        </aside>
      </div>

      {dialog.element}
    </main>
  );
};

CommercePreviewProduct.publicPage = true;
CommercePreviewProduct.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewProduct;
