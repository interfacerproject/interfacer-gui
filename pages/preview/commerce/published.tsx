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

import { CheckGlyph } from "components/previewCommerce/glyphs";
import { usePreviewDialog } from "components/previewCommerce/PreviewDialog";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const muted = "var(--ifr-text-secondary)";

const CommercePreviewPublished: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const router = useRouter();
  const dialog = usePreviewDialog();

  return (
    <main
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "64px 24px 120px",
        fontFamily: "var(--ifr-font-body)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "9999px",
          background: "#036a53",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 16px",
        }}
      >
        <CheckGlyph size={22} stroke="#fff" />
      </div>
      <h1 style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "24px", fontWeight: 700 }}>
        {t("Product published")}
      </h1>
      <p style={{ margin: "6px 0 24px", fontSize: "14px", color: muted }}>
        {t("Choose how you want people to get this product.")}
      </p>

      <div
        className="ifr-pc-collapse"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          textAlign: "left",
          maxWidth: "620px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            border: "1px solid #c9cccf",
            borderRadius: "8px",
            background: "#fff",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>{t("Sell through Interfacer")}</p>
          <p style={{ margin: 0, fontSize: "13px", color: muted, lineHeight: 1.5, flex: 1 }}>
            {t("Accept orders and manage stock directly through Interfacer.")}
          </p>
          <button
            type="button"
            onClick={() => router.push("/preview/commerce/sell")}
            style={{
              alignSelf: "flex-start",
              marginTop: "8px",
              height: "40px",
              padding: "0 16px",
              border: "none",
              borderRadius: "6px",
              background: "#036a53",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("Set up selling")}
          </button>
        </div>

        <div
          style={{
            border: "1px solid #c9cccf",
            borderRadius: "8px",
            background: "#fff",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>{t("Add an external store link")}</p>
          <p style={{ margin: 0, fontSize: "13px", color: muted, lineHeight: 1.5, flex: 1 }}>
            {t("Send buyers to your existing store or sales page.")}
          </p>
          <button
            type="button"
            onClick={() => dialog.open(t("Add store link"))}
            style={{
              alignSelf: "flex-start",
              marginTop: "8px",
              height: "40px",
              padding: "0 16px",
              border: "1px solid #c9cccf",
              borderRadius: "6px",
              background: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t("Add store link")}
          </button>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <Link href="/products">
          <a style={{ color: "#036a53", fontSize: "14px", fontWeight: 500 }}>{t("Not now")}</a>
        </Link>
      </div>

      {dialog.element}
    </main>
  );
};

CommercePreviewPublished.publicPage = true;
CommercePreviewPublished.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewPublished;
