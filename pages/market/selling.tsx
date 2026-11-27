// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Selling dashboard: the orders on the signed-in person's listings and
// services, each with its next step (mark built or delivered, then sign the
// Interfacer record of the handover), plus what they offer.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../_app";
import { useAuth } from "hooks/useAuth";
import { useInBoxContext } from "hooks/useInBox";
import { useMarketClient } from "hooks/useMarketClient";
import { useMarketResources } from "hooks/useMarketResources";
import type { BuildListing, SellerDashboard, SellerOrder } from "lib/market/types";
import { eur } from "lib/market/format";
import { fulfilledNotice, sendMarketNotice } from "lib/market/notify";
import { MarketHero, MarketNotice, Panel, StatusChip, TypeChip, heading, mono } from "components/market/ui";
import { AfterSalePanel } from "components/market/AfterSalePanel";
import { PayoutsPanel } from "components/market/PayoutsPanel";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "signInProps", "SideBarProps"])),
    },
  };
}

type Step = "canceled" | "awaiting_payment" | "to_fulfil" | "to_sign" | "on_hold" | "done";

function stepOf(order: SellerOrder): Step {
  if (order.status === "canceled") return "canceled";
  // Stripe products are paid (authorized) at order, charged at delivery.
  if (!(order.paid ?? order.captured)) return "awaiting_payment";
  if (!order.receipt) return "to_fulfil";
  const sync = order.receipt.zenflows_sync;
  if (!sync || sync.status === "done") return "done";
  if (sync.status === "blocked") return "on_hold";
  return "to_sign";
}

const Selling: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const { sendMessage } = useInBoxContext();
  const market = useMarketClient();
  const [dash, setDash] = useState<SellerDashboard | null>(null);
  const [builds, setBuilds] = useState<BuildListing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const d = await market.sellerDashboard();
    if (d.ok) setDash(d.data);
    else setError(d.reason);
    if (user) {
      const b = await market.buildListings({ provider: user.ulid, includeInactive: true });
      if (b.ok) setBuilds(b.data);
    }
  }, [market, user]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const c = await market.connect();
      if (!alive) return;
      if (!c.ok) return setError(c.reason);
      await refresh();
    })();
    return () => {
      alive = false;
    };
  }, [user, market, refresh]);

  const ids = useMemo(
    () =>
      [
        ...(dash?.orders ?? []).map(o => (o.kind === "build" ? o.design_id : o.resource_id)),
        ...(dash?.listings ?? []).map(l => l.catalog_resource_id),
      ].filter((x): x is string => !!x),
    [dash]
  );
  const { resources } = useMarketResources(ids);

  const act = async (order: SellerOrder, retry: boolean) => {
    setBusy(order.id);
    setError(null);
    const sync = order.receipt?.zenflows_sync;
    let res = retry && sync ? await market.retrySync(order.id, sync.id) : await market.markSold(order.kind, order.id);
    // First time the milestone is recorded: tell the buyer it was built/delivered.
    if (!retry && res.ok && !order.receipt) {
      const itemId = (order.kind === "build" ? order.design_id : order.resource_id) ?? "";
      await sendMarketNotice(
        sendMessage,
        fulfilledNotice({
          kind: order.kind,
          orderId: order.id,
          itemId,
          itemName: resources[itemId]?.name || order.kind,
          sellerName: user?.name ?? "",
          buyerId: res.data.receiver_id,
        }),
        user?.ulid
      );
    }
    // Enforced authz: the seller's own signature carries each Interfacer write.
    const pending = res.ok ? res.data.zenflows_sync : undefined;
    if (res.ok && pending?.status === "pending" && pending.last_error?.startsWith("awaiting_seller_signature"))
      res = await market.signSync(order.id, pending.id, res.data.receiver_id);
    setBusy(null);
    if (!res.ok) setError(res.reason);
    await refresh();
  };

  const orders = dash?.orders ?? [];
  const open = orders.filter(o => !["done", "awaiting_payment", "canceled"].includes(stepOf(o)));
  const earned = orders.filter(o => o.captured).reduce((sum, o) => sum + (o.total_eur ?? 0), 0);

  return (
    <div className="bg-ifr-profile min-h-full">
      <MarketHero
        eyebrow={t("Your shop")}
        title={t("Selling")}
        description={t("Orders to fulfil, what you offer, and what you've earned.")}
      >
        {user ? (
          <div className="flex flex-wrap gap-2.5 pb-9">
            <Link href={`/profile/${user.ulid}?tab=shop`} passHref>
              <a
                className="inline-flex items-center h-11 px-4 rounded-[6px] border text-white font-semibold no-underline"
                style={{ borderColor: "rgba(255,255,255,0.4)" }}
              >
                {t("View your public shop")}
              </a>
            </Link>
            <Link href="/market/start-selling" passHref>
              <a
                className="inline-flex items-center h-11 px-[18px] rounded-[6px] font-semibold no-underline"
                style={{ background: "var(--ifr-yellow)", color: "var(--ifr-text-primary)" }}
              >
                {t("Add to your shop")}
              </a>
            </Link>
          </div>
        ) : null}
      </MarketHero>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-7 pb-20 flex flex-col gap-7">
        {!user ? (
          <MarketNotice
            title={t("Sign in to see your sales")}
            testid="market-login-required"
            action={
              <Link href="/sign_in">
                <a className="font-semibold">{t("Sign in")}</a>
              </Link>
            }
          />
        ) : (
          <>
            {error ? (
              <MarketNotice tone="error" title={t("Something went wrong")} testid="market-error">
                {error}
              </MarketNotice>
            ) : null}
            <dl className="m-0 grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              {[
                ["to-fulfil", t("To fulfil"), String(open.length)],
                ["earned", t("Earned"), eur(earned)],
                ["designs", t("Designs you build"), String(builds.filter(b => b.active).length)],
                ["products", t("Products on sale"), String(dash?.listings.length ?? 0)],
              ].map(([key, label, value]) => (
                <Panel key={key} className="p-[18px] flex flex-col gap-1.5">
                  <dt className="text-[13px] text-ifr-text-secondary">{label}</dt>
                  <dd className="m-0 text-[30px] leading-none" style={heading} data-testid={`market-stat-${key}`}>
                    {value}
                  </dd>
                </Panel>
              ))}
            </dl>

            <div className="flex flex-wrap gap-8 items-start">
              <section
                aria-labelledby="orders"
                className="flex-[999_1_600px] min-w-0 flex flex-col gap-3.5"
                data-testid="market-sales"
              >
                <div className="flex flex-wrap justify-between items-baseline gap-2">
                  <h2 id="orders" className="m-0 text-[22px]" style={heading}>
                    {t("Orders")}
                  </h2>
                  <span className="text-[13px] text-ifr-text-secondary">
                    {t("Each step you mark is signed with your key and recorded on Interfacer.")}
                  </span>
                </div>
                {!dash ? (
                  <div className="h-[200px] bg-ifr-surface border border-ifr animate-pulse" />
                ) : orders.length === 0 ? (
                  <MarketNotice title={t("No orders yet")}>
                    {t("When someone buys from you or orders a build, it shows up here.")}
                  </MarketNotice>
                ) : (
                  <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
                    {orders.map(o => {
                      const step = stepOf(o);
                      const rid = o.kind === "build" ? o.design_id : o.resource_id;
                      const name = (rid && resources[rid]?.name) || (o.kind === "build" ? t("Build") : t("Product"));
                      const loading = busy === o.id;
                      return (
                        <li
                          key={o.id}
                          className="bg-ifr-surface border border-ifr px-[18px] py-4 flex flex-wrap items-center gap-x-5 gap-y-3.5"
                          data-testid="market-sale"
                          data-kind={o.kind}
                          data-order={o.id}
                        >
                          <span className="flex-[1_1_260px] min-w-0 flex flex-col gap-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <TypeChip
                                type={o.kind === "build" ? "build" : "product"}
                                label={o.kind === "build" ? t("Build") : t("Product")}
                              />
                              <span className="text-[12px] text-ifr-text-secondary" style={mono}>
                                {o.id.slice(-8).toUpperCase()}
                              </span>
                            </span>
                            <strong className="text-[17px] truncate" style={heading}>
                              {o.kind === "build" && o.quantity ? `${o.quantity} × ${name}` : name}
                            </strong>
                            <span className="text-[13px] text-ifr-text-secondary">
                              {[
                                o.created_at ? new Date(o.created_at).toLocaleDateString() : null,
                                o.total_eur != null ? eur(o.total_eur) : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          {step === "canceled" ? (
                            <StatusChip tone="grey">{t("Cancelled")}</StatusChip>
                          ) : step === "awaiting_payment" ? (
                            <StatusChip tone="grey">{t("Awaiting payment")}</StatusChip>
                          ) : step === "to_fulfil" ? (
                            <>
                              <StatusChip tone="amber">
                                {o.kind === "build" ? t("To build") : t("To deliver")}
                              </StatusChip>
                              {o.capture_by ? (
                                <span
                                  className="text-[12px] text-ifr-text-secondary"
                                  data-testid="market-sale-capture-by"
                                >
                                  {t("Deliver by {{date}}, or the payment lapses", {
                                    date: new Date(o.capture_by).toLocaleDateString(),
                                  })}
                                </span>
                              ) : null}
                              <button
                                type="button"
                                className="h-11 px-[18px] rounded-[6px] bg-ifr-green text-white font-semibold disabled:opacity-60"
                                disabled={loading}
                                onClick={() => act(o, false)}
                                data-testid={`market-sale-milestone-${o.kind}`}
                              >
                                {loading
                                  ? t("Signing…")
                                  : o.kind === "build"
                                  ? t("Mark built and handed over")
                                  : t("Mark delivered")}
                              </button>
                            </>
                          ) : step === "to_sign" || step === "on_hold" ? (
                            <>
                              <StatusChip tone={step === "on_hold" ? "red" : "blue"}>
                                {step === "on_hold" ? t("Record on hold") : t("Record to sign")}
                              </StatusChip>
                              <button
                                type="button"
                                className="h-11 px-[18px] rounded-[6px] border border-ifr-text-primary font-semibold disabled:opacity-60"
                                disabled={loading}
                                onClick={() => act(o, true)}
                                data-testid="market-sale-sign"
                              >
                                {loading ? t("Signing…") : t("Sign the Interfacer record")}
                              </button>
                            </>
                          ) : (
                            <span
                              className="flex items-center gap-1.5 text-[13px]"
                              style={{ color: "#00704f" }}
                              data-testid="market-zenflows-event"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                aria-hidden="true"
                              >
                                <path d="M8 1.5l5 2.5v4c0 3.2-2.3 5.3-5 6.5-2.7-1.2-5-3.3-5-6.5V4l5-2.5z" />
                                <path d="M5.5 8l1.8 1.8L10.5 6.5" />
                              </svg>
                              {o.receipt?.zenflows_event_id ? t("Recorded on Interfacer") : t("Done (local record)")}
                            </span>
                          )}
                          {o.paid ?? o.captured ? (
                            <span className="basis-full flex flex-wrap items-center gap-2">
                              {o.open_case ? (
                                <StatusChip tone="amber" testid="market-sale-request">
                                  {o.open_case.kind === "cancellation"
                                    ? t("The buyer asks to cancel")
                                    : t("The buyer asks to return it")}
                                </StatusChip>
                              ) : null}
                              <button
                                type="button"
                                className="text-[13px] font-semibold underline bg-transparent p-0"
                                aria-expanded={expanded === o.id}
                                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                                data-testid="market-sale-aftersale"
                              >
                                {o.open_case ? t("Answer the request") : t("Returns and refunds")}
                              </button>
                            </span>
                          ) : null}
                          {expanded === o.id ? (
                            <div className="basis-full border-t border-[#e3e4e6] pt-3">
                              <AfterSalePanel
                                compact
                                client={market}
                                orderId={o.id}
                                onChange={refresh}
                                item={rid ? { id: rid, name: name ?? "" } : undefined}
                              />
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <aside className="flex-[1_1_340px] min-w-0 flex flex-col gap-4">
                {/* Only once connected: the panel reads the seller's account with the session token. */}
                {dash ? <PayoutsPanel client={market} /> : null}
                <Panel>
                  <div className="px-[18px] py-4 flex justify-between items-baseline border-b border-[#e3e4e6]">
                    <h2 className="m-0 text-[17px]" style={heading}>
                      {t("Designs you build")}
                    </h2>
                    <Link href="/market/start-selling">
                      <a className="text-[13px] font-semibold">{t("Edit")}</a>
                    </Link>
                  </div>
                  {builds.length === 0 ? (
                    <p className="m-0 px-[18px] py-4 text-[14px] text-ifr-text-secondary">
                      {t("Pick the designs your machines can build from Start selling.")}
                    </p>
                  ) : (
                    <ul className="m-0 p-0 list-none">
                      {builds.map(b => (
                        <li
                          key={b.id}
                          className="flex items-center gap-3 px-[18px] py-3 [&:not(:last-child)]:border-b border-[#e3e4e6]"
                        >
                          <span className="flex-1 min-w-0 flex flex-col">
                            <Link href={`/project/${b.design_id}`}>
                              <a className="text-[14px] font-semibold text-ifr-text-primary truncate">
                                {b.design_name}
                              </a>
                            </Link>
                            <span className="text-[12px] text-ifr-text-secondary" style={mono}>
                              {`${eur(b.base_price_eur)} + ${eur(b.per_unit_price_eur)} ${t("per piece")} · ${t(
                                "{{count}} days",
                                {
                                  count: b.lead_days,
                                }
                              )}`}
                            </span>
                          </span>
                          <StatusChip tone={b.active ? (b.compatible ? "green" : "red") : "amber"}>
                            {b.active ? (b.compatible ? t("Live") : t("No longer fits")) : t("Paused")}
                          </StatusChip>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
                <Panel>
                  <div className="px-[18px] py-4 border-b border-[#e3e4e6]">
                    <h2 className="m-0 text-[17px]" style={heading}>
                      {t("Products on sale")}
                    </h2>
                  </div>
                  {!dash?.listings.length ? (
                    <p className="m-0 px-[18px] py-4 text-[14px] text-ifr-text-secondary">
                      {t("Nothing on sale yet.")}
                    </p>
                  ) : (
                    <ul className="m-0 p-0 list-none">
                      {dash.listings.map(l => (
                        <li key={l.id} className="px-[18px] py-3 [&:not(:last-child)]:border-b border-[#e3e4e6]">
                          <Link href={`/project/${l.catalog_resource_id}`}>
                            <a className="text-[14px] font-semibold text-ifr-text-primary">
                              {resources[l.catalog_resource_id]?.name ?? l.catalog_resource_id}
                            </a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

Selling.publicPage = true;

export default Selling;
