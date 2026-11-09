// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// The Shop tab of a profile: the designs this person's services build (with
// price for the design's lot and lead time) and the products they have on
// sale. Owners also get the way to their Selling dashboard.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { useMarketClient } from "hooks/useMarketClient";
import { useMarketResources } from "hooks/useMarketResources";
import type { BuildListing, SceneProduct, StoreProduct } from "lib/market/types";
import { eur } from "lib/market/format";
import { Drawing, MarketNotice, SectionTitle, TypeChip, heading, mono } from "./ui";

export default function ProfileShop({ personId, isOwner }: { personId: string; isOwner?: boolean }) {
  const { t } = useTranslation("common");
  const client = useMarketClient();
  const [listings, setListings] = useState<BuildListing[] | null>(null);
  const [onSale, setOnSale] = useState<Array<{ listing: SceneProduct; product?: StoreProduct }>>([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [scene, builds] = await Promise.all([client.browse(), client.buildListings({ provider: personId })]);
      if (!alive) return;
      if (!scene.ok) return setOffline(true);
      setListings(builds.ok ? builds.data : []);
      const mine = scene.data.products.filter(p => p.seller_person_id === personId);
      if (!mine.length) return;
      const products = await client.catalog();
      if (!alive) return;
      setOnSale(
        mine.map(l => ({
          listing: l,
          product: products.ok ? products.data.find(p => p.id === l.product_id) : undefined,
        }))
      );
    })();
    return () => {
      alive = false;
    };
  }, [client, personId]);

  const ids = useMemo(
    () => [...(listings ?? []).map(l => l.design_id), ...onSale.map(s => s.listing.resource_id)],
    [listings, onSale]
  );
  const { resources } = useMarketResources(ids);

  if (offline) return <MarketNotice title={t("The marketplace is offline right now")} />;
  if (!listings) return <div className="h-[260px] bg-ifr-surface border border-ifr animate-pulse" />;

  const services = Array.from(new Set(listings.map(l => l.service_name)));

  return (
    <div className="flex flex-col gap-8" data-testid="profile-shop">
      {isOwner ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-4 border"
          style={{ background: "var(--ifr-yellow-bg)", borderColor: "var(--ifr-yellow)" }}
        >
          <span className="text-[14px]" style={{ color: "#5c4400" }}>
            {t("This is your shop as buyers see it.")}
          </span>
          <span className="flex gap-3">
            <Link href="/market/selling">
              <a className="font-semibold text-[14px]">{t("Selling dashboard")}</a>
            </Link>
            <Link href="/market/start-selling">
              <a className="font-semibold text-[14px]">{t("Add to your shop")}</a>
            </Link>
          </span>
        </div>
      ) : null}

      <section className="flex flex-col gap-4">
        <SectionTitle
          sub={
            services.length
              ? t("With {{services}}. Prices are for the design's whole lot, material included.", {
                  services: services.join(", "),
                })
              : undefined
          }
        >
          {t("Builds on demand")}
        </SectionTitle>
        {listings.length === 0 ? (
          <MarketNotice title={t("No designs offered yet")} />
        ) : (
          <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
            {listings.map(l => (
              <Link key={l.id} href={`/project/${l.design_id}`} passHref>
                <a
                  className="flex flex-col bg-ifr-surface border border-ifr text-ifr-text-primary no-underline hover:shadow-lg transition-shadow"
                  data-testid="profile-shop-build"
                >
                  <Drawing
                    type="design"
                    image={resources[l.design_id]?.image}
                    alt={l.design_name}
                    height={170}
                    chip={<TypeChip type="design" label={t("Design")} />}
                  />
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="m-0 text-[17px]" style={heading}>
                      {l.design_name}
                    </h3>
                    <span className="text-[12px] text-ifr-text-secondary" style={mono}>
                      {`${t("{{count}} pieces", { count: l.quantity })} · ${l.service_name}`}
                    </span>
                    <div className="mt-auto pt-2.5 border-t border-[#e3e4e6] flex items-baseline justify-between">
                      <strong className="text-[20px]" style={heading}>
                        {l.total_eur != null ? eur(l.total_eur) : "—"}
                      </strong>
                      <span className="text-[13px] text-ifr-text-secondary">
                        {t("ready in {{count}} days", { count: l.lead_days })}
                      </span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </section>

      {onSale.length ? (
        <section className="flex flex-col gap-4">
          <SectionTitle>{t("For sale")}</SectionTitle>
          <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
            {onSale.map(({ listing, product }) => {
              const variant = product?.variants?.[0];
              const amount = variant?.calculated_price?.calculated_amount;
              const r = resources[listing.resource_id];
              return (
                <Link key={listing.listing_id} href={`/project/${listing.resource_id}`} passHref>
                  <a className="flex flex-col bg-ifr-surface border border-ifr text-ifr-text-primary no-underline hover:shadow-lg transition-shadow">
                    <Drawing
                      type="product"
                      image={r?.image}
                      alt={r?.name ?? product?.title ?? ""}
                      height={170}
                      chip={<TypeChip type="product" label={t("Product")} />}
                    />
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="m-0 text-[17px]" style={heading}>
                        {r?.name ?? product?.title}
                      </h3>
                      <div className="mt-auto pt-2.5 border-t border-[#e3e4e6] flex items-baseline justify-between">
                        <strong className="text-[20px]" style={heading}>
                          {amount != null ? eur(amount) : "—"}
                        </strong>
                        <span className="text-[13px] text-ifr-text-secondary">
                          {(variant?.inventory_quantity ?? 0) > 0 ? t("Available") : t("Sold")}
                        </span>
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
