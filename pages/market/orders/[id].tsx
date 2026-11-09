// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// One order, for its buyer: progress, the traceability log of signed events
// (payment, production/handover, the Interfacer record) and what was bought.

import Link from "next/link";
import { useRouter } from "next/router";
import { GetStaticPaths } from "next";
import { useEffect, useMemo, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { useAuth } from "hooks/useAuth";
import { useMarketClient } from "hooks/useMarketClient";
import { useMarketResources } from "hooks/useMarketResources";
import type { Order, Receipt } from "lib/market/types";
import { buildReference, eur, orderKind, orderNumber, orderResourceId, orderStage } from "lib/market/format";
import { Drawing, MarketNotice, Panel, TypeChip, heading, mono } from "components/market/ui";
import { ProgressSteps, TraceEntry, TraceLog, receiptIds, useStageLabel } from "components/market/OrderProgress";

export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: "blocking" });

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "signInProps", "SideBarProps"])),
    },
  };
}

const OrderPage: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user } = useAuth();
  const client = useMarketClient();
  const stageLabel = useStageLabel();
  const id = router.query.id as string | undefined;
  const placed = router.query.placed === "1";
  const [order, setOrder] = useState<Order | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    let alive = true;
    const load = async () => {
      const c = await client.connect();
      if (!alive) return;
      if (!c.ok) return setError(c.reason);
      const [o, r] = await Promise.all([client.readOrder(id), client.receipts()]);
      if (!alive) return;
      if (!o.ok) return setError(o.reason);
      setOrder(o.data);
      setReceipt((r.ok ? r.data : []).find(x => x.order_id === id) ?? null);
    };
    load();
    // The seller's milestone and the Interfacer record happen elsewhere: refresh.
    const timer = setInterval(() => {
      Promise.all([client.receipts()]).then(([r]) => {
        if (alive && r.ok) setReceipt(r.data.find(x => x.order_id === id) ?? null);
      });
    }, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [client, user, id]);

  const build = order ? buildReference(order) : null;
  const rid = order ? orderResourceId(order) : null;
  const ids = useMemo(() => [rid, build?.service_id].filter((x): x is string => !!x), [rid, build?.service_id]);
  const { resources } = useMarketResources(ids);

  if (!user)
    return (
      <div className="max-w-[1080px] mx-auto px-4 md:px-10 py-10">
        <MarketNotice
          title={t("Sign in to see this order")}
          action={
            <Link href={{ pathname: "/sign_in", query: { redirect: router.asPath } }}>
              <a className="font-semibold">{t("Sign in")}</a>
            </Link>
          }
        />
      </div>
    );
  if (error)
    return (
      <div className="max-w-[1080px] mx-auto px-4 md:px-10 py-10">
        <MarketNotice tone="error" title={t("Could not load this order")}>
          {error}
        </MarketNotice>
      </div>
    );
  if (!order) return <div className="max-w-[1080px] mx-auto px-4 md:px-10 py-10 h-[420px] animate-pulse" />;

  const kind = orderKind(order);
  const stage = orderStage(order, receipt);
  const resource = rid ? resources[rid] : undefined;
  const title = resource?.name ?? order.items?.[0]?.product_title ?? order.items?.[0]?.title ?? "";
  const maker = build ? resources[build.service_id]?.name : resource?.owner?.name;
  const paidAt = order.payment_collections?.flatMap(pc => pc.payments ?? []).find(p => p.captured_at)?.captured_at;
  const sync = receipt?.zenflows_sync;

  const entries: TraceEntry[] = [];
  if (receipt)
    entries.push({
      when: receipt.has_point_in_time,
      title: kind === "build" ? t("Built and handed over") : t("Delivered"),
      action: kind === "build" ? "produce → transfer" : "transfer",
      detail:
        kind === "build"
          ? t("{{maker}} recorded the finished build and handed it over to you.", { maker: maker ?? t("The maker") })
          : t("{{seller}} handed the product over to you.", { seller: maker ?? t("The seller") }),
      signedBy: maker,
      ids: sync?.status === "done" ? receiptIds(receipt) : undefined,
    });
  if (paidAt)
    entries.push({
      when: paidAt,
      title: t("Payment sent"),
      action: "transfer",
      detail: t("{{total}} to {{seller}}, at the price they published.", {
        total: order.total != null ? eur(order.total) : "",
        seller: maker ?? t("the seller"),
      }),
      signedBy: t("you"),
    });
  if (!receipt)
    entries.unshift({
      upcoming: true,
      title: kind === "build" ? t("Built and handed over") : t("Delivered"),
      action: kind === "build" ? "produce" : "transfer",
      detail:
        kind === "build"
          ? t("The maker records the finished build and hands it over.")
          : t("The seller hands it over to you."),
    });
  else if (sync && sync.status !== "done")
    entries.unshift({
      upcoming: true,
      title: t("Recorded on Interfacer"),
      action: "ledger",
      detail:
        sync.status === "blocked"
          ? t("The record is on hold; the marketplace team is looking at it.")
          : t("Waiting for the seller to sign the record of this handover."),
    });

  return (
    <div className="bg-ifr-profile min-h-full">
      <section className="bg-ifr-dark text-ifr-text-inverse">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-8 pb-9 flex flex-col gap-7">
          {placed ? (
            <div
              role="status"
              className="self-start flex items-center gap-2.5 py-2 pl-2.5 pr-3.5 text-[14px] border"
              style={{ background: "rgba(255,255,255,0.1)", borderColor: "var(--ifr-border-on-dark)" }}
              data-testid="market-order-placed"
            >
              <span
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center"
                style={{ background: "var(--ifr-yellow)", color: "var(--ifr-bg-dark)" }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M2.5 6.5l2.2 2.2 4.8-5" />
                </svg>
              </span>
              {maker ? t("Order placed. {{name}} has it.", { name: maker }) : t("Order placed.")}
            </div>
          ) : null}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <p
                className="m-0 uppercase text-ifr-yellow text-[14px] tracking-[0.1em]"
                style={{ ...heading, fontWeight: 500 }}
              >
                <Link href="/market/orders">
                  <a className="text-ifr-yellow no-underline">{t("My orders")}</a>
                </Link>
                {" · "}
                <span style={mono}>{orderNumber(order)}</span>
              </p>
              <h1 className="m-0 text-[30px] leading-[36px] md:text-[40px] md:leading-[44px]" style={heading}>
                {build ? `${build.quantity} × ${title}` : title}
              </h1>
              <p className="m-0 text-[15px] text-ifr-text-inverse-secondary">
                {maker
                  ? kind === "build"
                    ? t("Built on demand by {{name}}", { name: maker })
                    : t("Sold by {{name}}", { name: maker })
                  : null}
                {order.created_at ? ` · ${new Date(order.created_at).toLocaleString()}` : null}
              </p>
            </div>
            <span className="text-[22px]" data-testid="market-order-status" style={heading}>
              {stageLabel(stage, kind)}
            </span>
          </div>
          <ProgressSteps stage={stage} kind={kind} />
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-8 pb-20 flex flex-wrap gap-9 items-start">
        <section aria-labelledby="trace" className="flex-[999_1_560px] min-w-0 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 id="trace" className="m-0 text-[22px]" style={heading}>
              {t("Traceability")}
            </h2>
            <p className="m-0 text-[14px] text-ifr-text-secondary">
              {t("Each step is signed by whoever did it and recorded on Interfacer.")}
            </p>
          </div>
          <TraceLog entries={entries} />
        </section>

        <aside className="flex-[1_1_340px] min-w-0 flex flex-col gap-4">
          <Panel>
            <Drawing
              type={kind === "build" ? "design" : "product"}
              image={resource?.image}
              alt={title}
              height={150}
              chip={
                <TypeChip
                  type={kind === "build" ? "build" : "product"}
                  label={kind === "build" ? t("Build") : t("Product")}
                />
              }
            />
            <div className="p-5 flex flex-col gap-2">
              <strong className="text-[17px]" style={heading}>
                {title}
              </strong>
              {rid ? (
                <Link href={`/project/${rid}`}>
                  <a className="text-[13px] font-semibold">
                    {kind === "build" ? t("View the design") : t("View the product")}
                  </a>
                </Link>
              ) : null}
              <dl className="m-0 pt-3 mt-1 border-t border-[#e3e4e6] flex justify-between gap-3 text-[15px]">
                <dt className="font-semibold">{t("Paid")}</dt>
                <dd className="m-0" style={heading}>
                  {order.total != null ? eur(order.total) : ""}
                </dd>
              </dl>
            </div>
          </Panel>
          <Panel className="p-5 flex flex-col gap-2.5">
            <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.08em] text-ifr-text-secondary">
              {t("Digital Product Passport")}
            </p>
            {receipt?.dpp_id ? (
              <p className="m-0 text-[13px] break-all" style={mono}>
                {receipt.dpp_id}
              </p>
            ) : (
              <p className="m-0 text-[13px] text-ifr-text-secondary">
                {t("Issued when the item is handed over to you.")}
              </p>
            )}
          </Panel>
          {order.shipping_address?.address_1 ? (
            <Panel className="p-5 flex flex-col gap-1.5">
              <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.08em] text-ifr-text-secondary">
                {t("Deliver to")}
              </p>
              <address className="not-italic text-[14px] leading-[22px]">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
                <br />
                {order.shipping_address.address_1}
                <br />
                {`${order.shipping_address.postal_code ?? ""} ${order.shipping_address.city ?? ""}, ${
                  order.shipping_address.country_code?.toUpperCase() ?? ""
                }`}
              </address>
            </Panel>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

OrderPage.publicPage = true;

export default OrderPage;
