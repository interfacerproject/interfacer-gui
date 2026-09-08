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
import { useTranslation } from "next-i18next";
import Link from "next/link";

/**
 * Flag-gated entry point on the profile "Products" tab — a dark promo card
 * pointing at the (upcoming, not-yet-functional) sell-through-Interfacer flow.
 */
export default function ManageSalesCard() {
  const { t } = useTranslation("commercePreviewProps");
  if (!commercePreviewEnabled) return null;

  return (
    <div
      className="bg-ifr-dark rounded-ifr-md p-5 flex flex-col gap-2 md:max-w-[380px] md:shrink-0"
      style={{ fontFamily: "var(--ifr-font-body)" }}
    >
      <p
        className="m-0 uppercase text-ifr-yellow text-[12px] leading-[18px]"
        style={{ fontWeight: "var(--ifr-fw-medium)", letterSpacing: "0.4px" }}
      >
        {t("SELL THROUGH INTERFACER")}
      </p>
      <p
        className="m-0 text-ifr-text-inverse text-[18px] leading-[24px]"
        style={{ fontFamily: "var(--ifr-font-heading)", fontWeight: "var(--ifr-fw-bold)" }}
      >
        {t("Manage your sales")}
      </p>
      <p className="m-0 text-ifr-text-inverse-secondary text-[13px] leading-[19px]">
        {t("Track orders, inventory and product availability for items sold through Interfacer.")}
      </p>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <Link href="/preview/commerce/sales">
          <a
            className="inline-flex items-center px-4 no-underline"
            style={{
              height: "36px",
              borderRadius: "var(--ifr-radius-sm)",
              backgroundColor: "var(--ifr-yellow)",
              color: "var(--ifr-text-primary)",
              fontSize: "13px",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            {t("Manage sales")}
          </a>
        </Link>
        <span className="inline-flex items-center gap-1.5 text-ifr-text-inverse text-[12px]">
          {t("Selling enabled")}
          <span className="inline-block rounded-full" style={{ width: "8px", height: "8px", background: "#5da091" }} />
        </span>
      </div>
    </div>
  );
}
