// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// The signed-in buyer's marketplace orders, newest first, with where each one
// stands (paid → made or delivered → recorded on Interfacer).

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { useAuth } from "hooks/useAuth";
import { useMarketClient } from "hooks/useMarketClient";
import { useMarketResources } from "hooks/useMarketResources";
import type { Order, Receipt } from "lib/market/types";
import { buildReference, eur, orderKind, orderNumber, orderResourceId, orderStage } from "lib/market/format";
import { Drawing, MarketHero, MarketNotice, TypeChip, heading } from "components/market/ui";
import { StageChip } from "components/market/OrderProgress";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "signInProps", "SideBarProps"])),
    },
  };
}

const MyOrders: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const client = useMarketClient();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const c = await client.connect();
      if (!alive) return;
      if (!c.ok) return setError(c.reason);
      const [o, r] = await Promise.all([client.myOrders(), client.receipts()]);
      if (!alive) return;
      if (!o.ok) return setError(o.reason);
      setOrders(o.data);
      setReceipts(r.ok ? r.data : []);
    })();
    return () => {
      alive = false;
    };
  }, [client, user]);

  const ids = useMemo(
    () =>
      (orders ?? []).flatMap(o => {
        const b = buildReference(o);
        return [orderResourceId(o), b?.service_id].filter((x): x is string => !!x);
      }),
    [orders]
  );
  const { resources } = useMarketResources(ids);

  return (
    <div className="bg-ifr-profile min-h-full">
      <MarketHero
        eyebrow={t("Marketplace")}
        title={t("My orders")}
        description={t("What you bought and had built, and where each order stands.")}
      />
      <div className="max-w-[1080px] mx-auto px-4 md:px-10 py-8 pb-20 flex flex-col gap-4" data-testid="market-orders">
        {!user ? (
          <MarketNotice
            title={t("Sign in to see your orders")}
            action={
              <Link href="/sign_in">
                <a className="font-semibold">{t("Sign in")}</a>
              </Link>
            }
          />
        ) : error ? (
          <MarketNotice tone="error" title={t("Could not load your orders")}>
            {error}
          </MarketNotice>
        ) : !orders ? (
          <div className="h-[240px] bg-ifr-surface border border-ifr animate-pulse" />
        ) : orders.length === 0 ? (
          <MarketNotice
            title={t("No orders yet")}
            action={
              <Link href="/market">
                <a className="font-semibold">{t("Browse the marketplace")}</a>
              </Link>
            }
          />
        ) : (
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {orders.map(o => {
              const kind = orderKind(o);
              const rid = orderResourceId(o);
              const r = rid ? resources[rid] : undefined;
              const build = buildReference(o);
              const maker = build ? resources[build.service_id]?.name : r?.owner?.name;
              const receipt = receipts.find(x => x.order_id === o.id) ?? null;
              const title = r?.name ?? o.items?.[0]?.product_title ?? o.items?.[0]?.title ?? orderNumber(o);
              return (
                <li key={o.id}>
                  <Link href={`/market/orders/${o.id}`} passHref>
                    <a
                      className="flex flex-wrap items-center gap-4 p-3 pr-5 bg-ifr-surface border border-ifr text-ifr-text-primary no-underline hover:shadow-md transition-shadow"
                      data-testid="market-order"
                      data-order={o.id}
                    >
                      <div className="w-[88px] shrink-0 border border-ifr overflow-hidden">
                        <Drawing
                          type={kind === "build" ? "design" : "product"}
                          image={r?.image}
                          alt={title}
                          height={72}
                        />
                      </div>
                      <div className="flex-[1_1_220px] min-w-0 flex flex-col gap-1">
                        <span className="flex items-center gap-2">
                          <TypeChip
                            type={kind === "build" ? "build" : "product"}
                            label={kind === "build" ? t("Build") : t("Product")}
                          />
                          <span className="text-[12px] text-ifr-text-secondary">{orderNumber(o)}</span>
                        </span>
                        <strong className="text-[17px] truncate" style={heading}>
                          {build ? `${build.quantity} × ${title}` : title}
                        </strong>
                        <span className="text-[13px] text-ifr-text-secondary">
                          {maker
                            ? kind === "build"
                              ? t("Built by {{name}}", { name: maker })
                              : t("Sold by {{name}}", { name: maker })
                            : null}
                          {o.created_at ? ` · ${new Date(o.created_at).toLocaleDateString()}` : null}
                        </span>
                      </div>
                      <span className="text-[18px]" style={heading}>
                        {o.total != null ? eur(o.total) : ""}
                      </span>
                      <StageChip stage={orderStage(o, receipt)} kind={kind} />
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

MyOrders.publicPage = true;

export default MyOrders;
