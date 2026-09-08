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

import { commercePreviewEnabled } from "lib/previewCommerce/flag";
import { formatEur, MOCK_PRODUCT, variantById } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";

/**
 * Flag-gated price / stock line shown on product cards for the commerce
 * preview: "From €X" + variant count on the left, stock line on the right.
 * Uses the shared mock data — real products carry no commerce pricing yet.
 */
export default function CardPriceRow() {
  // `common` is loaded on every page that renders a product card; strings carry
  // an explicit defaultValue so they render even before the key is translated.
  const { t } = useTranslation("common");
  if (!commercePreviewEnabled) return null;

  const from = Math.min(...MOCK_PRODUCT.variants.map(v => v.price));
  const count = MOCK_PRODUCT.variants.length;
  const stockLine = variantById("assembled").stockLine;

  return (
    <div className="border-t border-ifr pt-2 flex flex-col gap-0.5" style={{ fontFamily: "var(--ifr-font-body)" }}>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="text-ifr-text-primary"
          style={{
            fontFamily: "var(--ifr-font-heading)",
            fontSize: "var(--ifr-fs-lg)",
            fontWeight: "var(--ifr-fw-bold)",
          }}
        >
          {t("From {{price}}", { defaultValue: "From {{price}}", price: formatEur(from) })}
        </span>
        <span className="flex items-center gap-1.5 shrink-0" style={{ fontSize: "var(--ifr-fs-sm)", color: "#036a53" }}>
          <span className="inline-block rounded-full" style={{ width: "8px", height: "8px", background: "#036a53" }} />
          {t(stockLine, { defaultValue: stockLine })}
        </span>
      </div>
      <span className="text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-sm)" }}>
        {t("{{count}} variants", { defaultValue: "{{count}} variants", count })}
      </span>
    </div>
  );
}
