// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Buy block on a product's page, shown when its owner has put a unit on sale:
// price, availability and the way to checkout. A seller sees their own sale.

import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useAuth } from "hooks/useAuth";
import type { SceneProduct, StoreProduct } from "lib/market/types";
import { eur } from "lib/market/format";
import { heading } from "./ui";

export default function BuyPanel({ listing, product }: { listing: SceneProduct; product: StoreProduct }) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const variant = product.variants?.[0];
  const amount = variant?.calculated_price?.calculated_amount;
  const available = (variant?.inventory_quantity ?? 0) > 0;
  const own = !!user && user.ulid === listing.seller_person_id;

  return (
    <section
      aria-labelledby="market-buy"
      className="px-4 py-4 border-b border-[#c9cccf] flex flex-col gap-3"
      data-testid="market-buy-panel"
    >
      <p className="m-0 uppercase text-[12px] font-semibold tracking-[0.08em] text-ifr-text-secondary" id="market-buy">
        {t("On sale")}
      </p>
      <div className="flex items-baseline gap-2.5">
        <span className="text-[34px] leading-none" style={heading}>
          {amount != null ? eur(amount) : "—"}
        </span>
        <span className="text-[12px] text-ifr-text-secondary">{t("incl. VAT")}</span>
      </div>
      <p className="m-0 text-[13px]" style={{ color: available ? "#00704f" : "var(--ifr-text-secondary)" }}>
        {available ? t("1 unit available, with its Digital Product Passport") : t("Sold")}
      </p>
      {own ? (
        <Link href="/market/selling" passHref>
          <a className="inline-flex items-center justify-center h-11 rounded-[6px] border border-ifr-text-primary text-ifr-text-primary font-semibold text-[14px] no-underline">
            {t("You are selling this — manage sales")}
          </a>
        </Link>
      ) : available && variant ? (
        <Link
          href={{
            pathname: "/market/checkout",
            query: { kind: "stock", product: product.id, resource: listing.resource_id },
          }}
          passHref
        >
          <a
            className="inline-flex items-center justify-center h-12 rounded-[6px] bg-ifr-green text-white font-semibold text-[15px] no-underline hover:bg-ifr-green-hover"
            data-testid="market-buy-stock"
          >
            {t("Buy now")}
          </a>
        </Link>
      ) : null}
      <p className="m-0 text-[12px] leading-[18px] text-ifr-text-secondary">
        {t("Paid to the seller and recorded on Interfacer: ownership moves to you on delivery.")}
      </p>
    </section>
  );
}
