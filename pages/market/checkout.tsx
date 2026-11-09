// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Checkout for both paths: a ready-made unit (?kind=stock&product=…) or a build
// (?kind=build&design=…&quote=…). The buyer types where it should go, signs
// with their wallet and pays (pilot: test payment, nothing is charged). The
// purchase state is kept per item so a retry resumes the same cart and order.

import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../_app";
import { useAuth } from "hooks/useAuth";
import { useMarketClient } from "hooks/useMarketClient";
import { useMarketResources } from "hooks/useMarketResources";
import type { JourneyState, MatchEntry, Requirements, ShippingAddress, StoreProduct } from "lib/market/types";
import { eur, eurCents, processLabel } from "lib/market/format";
import { Avatar, Drawing, MarketNotice, Panel, TypeChip, heading, primaryButton } from "components/market/ui";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "signInProps", "SideBarProps"])),
    },
  };
}

type Item =
  | { kind: "stock"; product: StoreProduct; resourceId: string; sellerId?: string }
  | { kind: "build"; match: MatchEntry; designId: string; designName: string; requirements: Requirements };

const EMPTY: ShippingAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  city: "",
  postal_code: "",
  country_code: "it",
  phone: "",
};

const COUNTRIES = ["at", "be", "de", "dk", "es", "fi", "fr", "gr", "ie", "it", "nl", "pl", "pt", "se"];

// Medusa/Interfacer refusals the buyer can act on, in words.
const REASONS: Record<string, string> = {
  self_purchase_forbidden: "You can't buy your own listing.",
  login_required: "Sign in to buy.",
  market_upstream_unreachable: "The marketplace is offline right now. Try again in a moment.",
  build_quote_not_found: "This offer changed. Go back and pick the maker again.",
  interfacer_single_unit_required: "This unit is no longer available.",
};

function journeyKey(item: { kind: string; id: string }) {
  return `market:checkout:${item.kind}:${item.id}`;
}

const Checkout: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user } = useAuth();
  const client = useMarketClient();
  const { kind, product, resource, design, quote } = router.query as Record<string, string | undefined>;
  const [item, setItem] = useState<Item | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    let alive = true;
    (async () => {
      const scene = await client.browse();
      if (!alive) return;
      if (!scene.ok) return setLoadError(scene.reason);
      if (kind === "stock" && product && resource) {
        const products = await client.catalog();
        const p = products.ok ? products.data.find(x => x.id === product) : undefined;
        const listing = scene.data.products.find(x => x.product_id === product);
        if (!alive) return;
        if (!p || !listing) return setLoadError("item_not_found");
        return setItem({ kind: "stock", product: p, resourceId: resource, sellerId: listing.seller_person_id });
      }
      if (kind === "build" && design && quote) {
        const [designs, match] = await Promise.all([client.listDesigns(), client.match(design)]);
        if (!alive) return;
        const d = designs.ok ? designs.data.find(x => x.id === design) : undefined;
        const m = match.ok ? match.data.matches.find(x => x.quote.id === quote) : undefined;
        if (!d || !m) return setLoadError(match.ok ? "build_quote_not_found" : match.reason);
        return setItem({
          kind: "build",
          match: m,
          designId: d.id,
          designName: d.name,
          requirements: d.requirements as Requirements,
        });
      }
      setLoadError("item_not_found");
    })();
    return () => {
      alive = false;
    };
  }, [router.isReady, client, kind, product, resource, design, quote]);

  // Prefill the name from the account once.
  useEffect(() => {
    if (!user?.name) return;
    setAddress(a => {
      if (a.first_name || a.last_name) return a;
      const [first, ...rest] = user.name.split(" ");
      return { ...a, first_name: first ?? "", last_name: rest.join(" ") };
    });
  }, [user?.name]);

  const resourceIds = useMemo(() => (item ? [item.kind === "stock" ? item.resourceId : item.designId] : []), [item]);
  const { resources } = useMarketResources(resourceIds);
  const image = resourceIds[0] ? resources[resourceIds[0]]?.image : null;
  const sellerName = item?.kind === "stock" ? resources[item.resourceId]?.owner?.name : item?.match.service.name;

  const total = item
    ? item.kind === "stock"
      ? item.product.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      : item.match.quote.total_price_cents / 100
    : 0;
  const own =
    !!user &&
    !!item &&
    (item.kind === "stock" ? item.sellerId === user.ulid : item.match.service.provider_person_id === user.ulid);

  const field = (key: keyof ShippingAddress) => ({
    value: address[key] ?? "",
    onChange: (e: { target: { value: string } }) => setAddress(a => ({ ...a, [key]: e.target.value })),
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setBusy(true);
    setError(null);
    const connected = await client.connect();
    if (!connected.ok) {
      setBusy(false);
      return setError(connected.reason);
    }
    const target = item.kind === "stock" ? item.product.variants[0].id : item.match.quote.id;
    const key = journeyKey({ kind: item.kind, id: target });
    let state: JourneyState = {};
    try {
      state = JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      state = {};
    }
    const clean: ShippingAddress = { ...address, country_code: address.country_code.toLowerCase() };
    if (!clean.phone) delete clean.phone;
    const res = await client.purchase(item.kind, target, state, clean);
    try {
      localStorage.setItem(key, JSON.stringify(res.ok ? res.data : state));
    } catch {
      /* per-browser convenience only */
    }
    if (!res.ok) {
      setBusy(false);
      return setError(res.reason);
    }
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    router.push(`/market/orders/${res.data.orderId}?placed=1`);
  };

  const label = (text: string, required = true) => (
    <span className="text-[13px] font-semibold">
      {text}
      {required ? <span aria-hidden="true">{" *"}</span> : null}
    </span>
  );
  const inputClass = "h-11 px-3 rounded-[6px] border border-ifr bg-ifr-surface text-[15px] font-normal";

  return (
    <div className="bg-ifr-profile min-h-full">
      <div className="max-w-[1180px] mx-auto px-4 md:px-10 pt-8 pb-20 flex flex-col gap-6">
        <nav aria-label={t("Breadcrumb")} className="text-[13px] text-ifr-text-secondary flex flex-wrap gap-2">
          <Link href="/market">
            <a className="text-ifr-text-secondary">{t("Marketplace")}</a>
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ifr-text-primary">{t("Checkout")}</span>
        </nav>
        <h1 className="m-0 text-[30px] leading-[36px]" style={heading}>
          {t("Checkout")}
        </h1>

        {loadError ? (
          <MarketNotice
            tone="error"
            title={t("This item can't be bought right now")}
            action={
              <Link href="/market">
                <a className="font-semibold">{t("Back to the marketplace")}</a>
              </Link>
            }
          >
            {t(REASONS[loadError] ?? "It may have been sold or its offer changed.")}
          </MarketNotice>
        ) : !item ? (
          <div className="h-[420px] bg-ifr-surface border border-ifr animate-pulse" />
        ) : (
          <div className="flex flex-wrap gap-9 items-start">
            <form
              onSubmit={submit}
              className="flex-[999_1_520px] min-w-0 flex flex-col gap-6"
              data-testid="market-checkout"
            >
              {!user ? (
                <MarketNotice
                  title={t("Sign in to buy")}
                  action={
                    <Link href={{ pathname: "/sign_in", query: { redirect: router.asPath } }}>
                      <a className="font-semibold">{t("Sign in")}</a>
                    </Link>
                  }
                >
                  {t("Your Interfacer account signs the order, so it is recorded as yours.")}
                </MarketNotice>
              ) : null}

              <Panel className="p-5 flex flex-col gap-4">
                <h2 className="m-0 text-[19px]" style={heading}>
                  {t("Delivery address")}
                </h2>
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                  <label className="flex flex-col gap-1.5">
                    {label(t("First name"))}
                    <input required autoComplete="given-name" className={inputClass} {...field("first_name")} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    {label(t("Last name"))}
                    <input required autoComplete="family-name" className={inputClass} {...field("last_name")} />
                  </label>
                  <label className="flex flex-col gap-1.5" style={{ gridColumn: "1 / -1" }}>
                    {label(t("Street and number"))}
                    <input required autoComplete="address-line1" className={inputClass} {...field("address_1")} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    {label(t("Postal code"))}
                    <input required autoComplete="postal-code" className={inputClass} {...field("postal_code")} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    {label(t("City"))}
                    <input required autoComplete="address-level2" className={inputClass} {...field("city")} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    {label(t("Country"))}
                    <select required autoComplete="country" className={inputClass} {...field("country_code")}>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>
                          {c.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    {label(t("Phone"), false)}
                    <input autoComplete="tel" className={inputClass} {...field("phone")} />
                  </label>
                </div>
                <p className="m-0 text-[13px] text-ifr-text-secondary">
                  {item.kind === "build"
                    ? t("{{maker}} will contact you to arrange pickup or delivery.", { maker: sellerName })
                    : t("The seller ships to this address.")}
                </p>
              </Panel>

              <Panel className="p-5 flex flex-col gap-3">
                <h2 className="m-0 text-[19px]" style={heading}>
                  {t("Payment")}
                </h2>
                <div
                  className="flex gap-3 items-start p-3.5 border"
                  style={{ background: "var(--ifr-yellow-bg)", borderColor: "var(--ifr-yellow)" }}
                >
                  <span className="text-[14px]" style={{ color: "#5c4400" }}>
                    <strong>{t("Pilot: test payment.")}</strong>{" "}
                    {t(
                      "Nothing is charged while the marketplace is in its pilot. The order, its signature and its record on Interfacer are real."
                    )}
                  </span>
                </div>
              </Panel>

              {error ? (
                <MarketNotice tone="error" title={t("The order was not placed")} testid="market-checkout-error">
                  {t(REASONS[error] ?? "Something went wrong ({{reason}}). Your card was not charged.", {
                    reason: error,
                  })}
                </MarketNotice>
              ) : null}

              <div className="flex flex-col gap-2.5">
                <button
                  type="submit"
                  className={primaryButton + " h-[54px] text-[17px]"}
                  disabled={busy || !user || own}
                  data-testid="market-place-order"
                >
                  {busy ? t("Signing and placing your order…") : t("Place order · {{total}}", { total: eur(total) })}
                </button>
                <p className="m-0 text-[13px] text-ifr-text-secondary text-center">
                  {own
                    ? t("You can't buy your own listing.")
                    : t("Your wallet signs the order. It is recorded on Interfacer as yours.")}
                </p>
              </div>
            </form>

            <aside aria-label={t("Order summary")} className="flex-[1_1_340px] min-w-0 flex flex-col gap-4">
              <Panel>
                <Drawing
                  type={item.kind === "stock" ? "product" : "design"}
                  image={image}
                  alt={item.kind === "stock" ? item.product.title : item.designName}
                  height={150}
                  chip={
                    <TypeChip
                      type={item.kind === "stock" ? "product" : "build"}
                      label={item.kind === "stock" ? t("Product") : t("Build")}
                    />
                  }
                />
                <div className="p-5 flex flex-col gap-3">
                  <strong className="text-[18px]" style={heading}>
                    {item.kind === "stock" ? item.product.title : item.designName}
                  </strong>
                  {item.kind === "build" ? (
                    <span className="text-[13px] text-ifr-text-secondary">
                      {[
                        t("{{count}} pieces", { count: item.match.quote.quantity }),
                        item.requirements.process.map(processLabel).join(", "),
                        item.requirements.materials.join(", "),
                      ].join(" · ")}
                    </span>
                  ) : null}
                  {sellerName ? (
                    <span className="flex items-center gap-2 text-[14px]">
                      <Avatar name={sellerName} size={28} />
                      {item.kind === "build"
                        ? t("Built by {{name}}", { name: sellerName })
                        : t("Sold by {{name}}", { name: sellerName })}
                    </span>
                  ) : null}
                  <dl className="m-0 pt-3 border-t border-[#e3e4e6] flex flex-col gap-2 text-[14px]">
                    {item.kind === "build" ? (
                      <>
                        <div className="flex justify-between gap-3">
                          <dt className="text-ifr-text-secondary">{t("Setup")}</dt>
                          <dd className="m-0">{eur(item.match.service.base_price_eur)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-ifr-text-secondary">
                            {t("{{count}} × {{price}} per piece", {
                              count: item.match.quote.quantity,
                              price: eur(item.match.service.per_unit_price_eur),
                            })}
                          </dt>
                          <dd className="m-0">
                            {eur(item.match.service.per_unit_price_eur * item.match.quote.quantity)}
                          </dd>
                        </div>
                      </>
                    ) : null}
                    <div className="flex justify-between gap-3 pt-2 border-t border-[#e3e4e6]">
                      <dt className="font-semibold text-[16px]">{t("Total")}</dt>
                      <dd className="m-0 text-[22px]" style={heading}>
                        {item.kind === "build" ? eurCents(item.match.quote.total_price_cents) : eur(total)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </Panel>
              <div className="p-5 bg-ifr-dark text-ifr-text-inverse flex flex-col gap-3.5">
                <p
                  className="m-0 uppercase text-ifr-yellow text-[13px] tracking-[0.1em]"
                  style={{ ...heading, fontWeight: 500 }}
                >
                  {t("What happens next")}
                </p>
                <ol className="m-0 p-0 list-none flex flex-col gap-3.5">
                  {(item.kind === "build"
                    ? [
                        [
                          t("{{maker}} gets your order", { maker: sellerName }),
                          t("Your signed payment is recorded on Interfacer."),
                        ],
                        [
                          t("They build it"),
                          item.match.listing?.lead_days
                            ? t("About {{count}} days. You can follow each step.", {
                                count: item.match.listing.lead_days,
                              })
                            : t("You can follow each step."),
                        ],
                        [t("It is handed over to you"), t("Ownership moves to you, with its passport.")],
                      ]
                    : [
                        [t("The seller gets your order"), t("Your signed payment is recorded on Interfacer.")],
                        [t("They ship it"), t("To the address above.")],
                        [t("Ownership moves to you"), t("With the product's Digital Product Passport.")],
                      ]
                  ).map(([title, sub], i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] box-border"
                        style={{
                          border: `1.5px solid ${i === 0 ? "var(--ifr-yellow)" : "rgba(255,255,255,0.4)"}`,
                          color: i === 0 ? "var(--ifr-yellow)" : "inherit",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="flex flex-col">
                        <strong className="text-[14px]">{title}</strong>
                        <span className="text-[13px] text-ifr-text-inverse-secondary">{sub}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

Checkout.publicPage = true;

export default Checkout;
