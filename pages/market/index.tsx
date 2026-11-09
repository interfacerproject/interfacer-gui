// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Marketplace catalogue: one page, two buyer paths. Ready-made lists the units
// sellers have put on sale (Medusa listings bound to Zenflows products);
// Built on demand lists registered designs with the makers who listed them.
// Cards open the real project page, where the Buy / Get-it-built panel lives.

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../_app";
import { useMarketClient } from "hooks/useMarketClient";
import { useMarketResources } from "hooks/useMarketResources";
import type { BuildListing, Design, Requirements, StoreProduct } from "lib/market/types";
import { dims, eur, processCode, processLabel } from "lib/market/format";
import { Avatar, Drawing, MarketHero, MarketNotice, PathTab, TypeChip, heading, mono } from "components/market/ui";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "signInProps", "SideBarProps"])),
    },
  };
}

type View = "ready" | "build";

interface Loaded {
  products: StoreProduct[];
  sellers: Record<string, string | undefined>; // resource id → seller person id
  designs: Design[];
  listings: BuildListing[];
}

const ReadyIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
);
const BuildIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M4 20h16" />
    <path d="M6 20V9l6-5 6 5v11" />
    <path d="M10 20v-6h4v6" />
  </svg>
);

function reqOf(design: Design): Requirements | null {
  const r = design.requirements as Requirements | undefined;
  return r && Array.isArray(r.process) ? r : null;
}

const MarketCatalogue: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const view: View = router.query.view === "build" ? "build" : "ready";
  const client = useMarketClient();
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [process, setProcess] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const scene = await client.browse();
      if (!alive) return;
      if (!scene.ok) return setError(scene.reason);
      const [products, designs, listings] = await Promise.all([
        client.catalog(),
        client.listDesigns(),
        client.buildListings(),
      ]);
      if (!alive) return;
      if (!products.ok) return setError(products.reason);
      const sellers: Record<string, string | undefined> = {};
      for (const p of scene.data.products) sellers[p.resource_id] = p.seller_person_id;
      setData({
        products: products.data,
        sellers,
        designs: designs.ok ? designs.data : [],
        listings: listings.ok ? listings.data : [],
      });
    })();
    return () => {
      alive = false;
    };
  }, [client]);

  const resourceIds = useMemo(
    () => [
      ...(data?.products.map(p => p.metadata.interfacer_resource_id).filter((x): x is string => !!x) ?? []),
      ...(data?.designs.map(d => d.id) ?? []),
    ],
    [data]
  );
  const { resources } = useMarketResources(resourceIds);

  const setView = (next: View) =>
    router.replace({ pathname: "/market", query: next === "build" ? { view: "build" } : {} }, undefined, {
      shallow: true,
    });

  const q = search.trim().toLowerCase();
  const products = useMemo(() => {
    const list = (data?.products ?? []).filter(p => {
      const variant = p.variants?.[0];
      const inStock = (variant?.inventory_quantity ?? 0) > 0;
      return (!inStockOnly || inStock) && (!q || p.title.toLowerCase().includes(q));
    });
    return list.sort((a, b) => (b.variants?.[0]?.inventory_quantity ?? 0) - (a.variants?.[0]?.inventory_quantity ?? 0));
  }, [data, q, inStockOnly]);

  const offersByDesign = useMemo(() => {
    const map: Record<string, BuildListing[]> = {};
    for (const l of data?.listings ?? []) if (l.active && l.compatible) (map[l.design_id] ||= []).push(l);
    return map;
  }, [data]);

  const processes = useMemo(
    () => Array.from(new Set((data?.designs ?? []).flatMap(d => reqOf(d)?.process ?? []))).sort(),
    [data]
  );

  const designs = useMemo(() => {
    const list = (data?.designs ?? []).filter(d => {
      const r = reqOf(d);
      return (!q || d.name.toLowerCase().includes(q)) && (!process || (r?.process ?? []).includes(process));
    });
    return list.sort((a, b) => (offersByDesign[b.id]?.length ?? 0) - (offersByDesign[a.id]?.length ?? 0));
  }, [data, q, process, offersByDesign]);

  const buildable = (data?.designs ?? []).filter(d => offersByDesign[d.id]?.length).length;

  return (
    <div className="bg-ifr-profile min-h-full">
      <MarketHero
        eyebrow={t("Marketplace")}
        title={t("Open hardware, made near you")}
        description={t(
          "Buy finished products from the makers who build them, or pick an open design and have a compatible workshop build it for you."
        )}
      >
        <div className="flex flex-wrap gap-2">
          <PathTab
            active={view === "ready"}
            onClick={() => setView("ready")}
            title={t("Ready-made")}
            subtitle={t("Finished products sellers have listed")}
            count={data?.products.length}
            icon={ReadyIcon}
            testid="market-view-ready"
          />
          <PathTab
            active={view === "build"}
            onClick={() => setView("build")}
            title={t("Built on demand")}
            subtitle={t("Open designs a maker can build for you")}
            count={data ? buildable : undefined}
            icon={BuildIcon}
            testid="market-view-build"
          />
        </div>
      </MarketHero>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-8 pb-20 flex flex-wrap gap-8 items-start">
        <aside aria-label={t("Filters")} className="flex flex-col gap-6 flex-[1_1_232px] max-w-full">
          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ifr-text-secondary">
              {t("Search")}
            </span>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={view === "ready" ? t("Search products") : t("Search designs")}
              className="h-11 px-3 rounded-[6px] border border-ifr bg-ifr-surface text-[14px]"
              data-testid="market-search"
            />
          </label>
          {view === "ready" ? (
            <label className="flex items-center gap-2.5 text-[14px] cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="w-[18px] h-[18px]"
                style={{ accentColor: "var(--ifr-green)" }}
              />
              {t("Available now")}
            </label>
          ) : processes.length ? (
            <fieldset className="m-0 p-0 border-0 flex flex-col gap-2.5">
              <legend className="mb-2.5 p-0 text-[12px] font-semibold uppercase tracking-[0.08em] text-ifr-text-secondary">
                {t("Process")}
              </legend>
              {[null, ...processes].map(p => (
                <label key={p ?? "all"} className="flex items-center gap-2.5 text-[14px] cursor-pointer">
                  <input
                    type="radio"
                    name="process"
                    checked={process === p}
                    onChange={() => setProcess(p)}
                    className="w-[18px] h-[18px]"
                    style={{ accentColor: "var(--ifr-green)" }}
                  />
                  {p ? processLabel(p) : t("All processes")}
                </label>
              ))}
            </fieldset>
          ) : null}
          <div className="p-4 border" style={{ background: "var(--ifr-yellow-bg)", borderColor: "var(--ifr-yellow)" }}>
            <p className="m-0 text-[14px] font-semibold">{t("Traceable by design")}</p>
            <p className="m-0 mt-1 text-[13px]" style={{ color: "#5c4400" }}>
              {t("Every sale and every build is signed and recorded on Interfacer.")}
            </p>
          </div>
        </aside>

        <section className="flex-[999_1_560px] min-w-0 flex flex-col gap-5" data-testid="market-catalog">
          {error ? (
            <MarketNotice
              tone="error"
              title={
                error === "market_upstream_unreachable"
                  ? t("The marketplace is offline")
                  : t("Could not load the marketplace")
              }
              testid="market-page-error"
            >
              {error === "market_upstream_unreachable"
                ? t("The commerce server is not reachable. Try again in a moment.")
                : error}
            </MarketNotice>
          ) : !data ? (
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="h-[340px] bg-ifr-surface border border-ifr animate-pulse" />
              ))}
            </div>
          ) : view === "ready" ? (
            <>
              <h2 className="m-0 text-[24px] leading-[30px]" style={heading}>
                {t("{{count}} ready-made products", { count: products.length })}
              </h2>
              {products.length === 0 ? (
                <MarketNotice title={t("Nothing on sale yet")}>
                  {t("Sellers put their products on sale from Start selling.")}
                </MarketNotice>
              ) : (
                <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
                  {products.map(p => {
                    const resourceId = p.metadata.interfacer_resource_id;
                    const r = resourceId ? resources[resourceId] : undefined;
                    const variant = p.variants?.[0];
                    const amount = variant?.calculated_price?.calculated_amount;
                    const inStock = (variant?.inventory_quantity ?? 0) > 0;
                    const seller = r?.owner?.name;
                    const card = (
                      <a
                        className="group flex flex-col h-full bg-ifr-surface border border-ifr text-ifr-text-primary no-underline hover:shadow-lg transition-shadow"
                        data-testid="market-product"
                        data-resource={resourceId}
                      >
                        <Drawing
                          type="product"
                          image={r?.image}
                          alt={p.title}
                          chip={<TypeChip type="product" label={t("Product")} />}
                        />
                        <div className="flex flex-col gap-2.5 p-4 flex-1">
                          <h3 className="m-0 text-[18px] leading-[24px]" style={heading}>
                            {p.title}
                          </h3>
                          {seller ? (
                            <p className="m-0 flex items-center gap-2 text-[13px] text-ifr-text-secondary">
                              <Avatar name={seller} size={22} />
                              {seller}
                            </p>
                          ) : null}
                          <div className="mt-auto pt-2.5 border-t border-[#e3e4e6] flex items-center justify-between gap-2">
                            <span className="text-[22px]" style={heading}>
                              {amount != null ? eur(amount) : "—"}
                            </span>
                            <span
                              className="px-[9px] py-[3px] rounded-[4px] text-[12px] font-semibold"
                              style={
                                inStock
                                  ? { background: "rgba(3, 106, 83, 0.1)", color: "#00704f" }
                                  : { background: "rgba(200, 212, 229, 0.4)", color: "var(--ifr-text-secondary)" }
                              }
                            >
                              {inStock ? t("Available") : t("Sold")}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                    return resourceId ? (
                      <Link key={p.id} href={`/project/${resourceId}`} passHref>
                        {card}
                      </Link>
                    ) : (
                      <div key={p.id}>{card}</div>
                    );
                  })}
                </div>
              )}
              <div
                className="flex flex-wrap items-center justify-between gap-5 px-6 py-7 text-white"
                style={{ background: "var(--ifr-bg-dark-alt)" }}
              >
                <div className="flex flex-col gap-1.5 max-w-[58ch]">
                  <p
                    className="m-0 uppercase text-ifr-yellow text-[13px] tracking-[0.1em]"
                    style={{ ...heading, fontWeight: 500 }}
                  >
                    {t("Built on demand")}
                  </p>
                  <h3 className="m-0 text-[24px] leading-[30px]" style={heading}>
                    {t("Love a design? A maker can build it for you.")}
                  </h3>
                  <p className="m-0 text-[15px] text-ifr-text-inverse-secondary">
                    {t("Makers show their price and lead time up front, checked against what the design needs.")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setView("build")}
                  className="inline-flex items-center gap-2 h-12 px-5 rounded-[6px] font-semibold text-[15px]"
                  style={{ background: "var(--ifr-yellow)", color: "var(--ifr-text-primary)" }}
                >
                  {t("Browse buildable designs")}
                </button>
              </div>
            </>
          ) : (
            <>
              <ol
                className="m-0 p-0 list-none grid bg-ifr-surface border border-ifr"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
              >
                {[
                  [t("Pick an open design"), t("Every file is public, licensed and versioned.")],
                  [t("Choose a maker who can build it"), t("We check process, material, size and tolerance.")],
                  [t("Follow it until it arrives"), t("Each step is signed and recorded on Interfacer.")],
                ].map(([title, sub], i) => (
                  <li
                    key={title}
                    className="flex gap-3.5 items-start px-5 py-[18px] border-[#e3e4e6] [&:not(:last-child)]:border-r"
                  >
                    <span
                      className="shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-white"
                      style={{ ...heading, background: "var(--ifr-green)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <strong className="text-[15px]">{title}</strong>
                      <span className="text-[13px] text-ifr-text-secondary">{sub}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <h2 className="m-0 text-[24px] leading-[30px]" style={heading}>
                {t("{{count}} designs you can get built", { count: buildable })}
              </h2>
              {designs.length === 0 ? (
                <MarketNotice title={t("No designs here yet")}>
                  {t("Designers publish their designs' build requirements from Start selling.")}
                </MarketNotice>
              ) : (
                <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
                  {designs.map(d => {
                    const r = resources[d.id];
                    const req = reqOf(d);
                    const offers = offersByDesign[d.id] ?? [];
                    const from = offers.reduce<number | null>(
                      (min, o) => (o.total_eur != null && (min == null || o.total_eur < min) ? o.total_eur : min),
                      null
                    );
                    const author = r?.owner?.name;
                    return (
                      <Link key={d.id} href={`/project/${d.id}`} passHref>
                        <a
                          className="flex flex-col h-full bg-ifr-surface border border-ifr text-ifr-text-primary no-underline hover:shadow-lg transition-shadow"
                          data-testid="market-design"
                          data-resource={d.id}
                        >
                          <Drawing
                            type="design"
                            image={r?.image}
                            alt={d.name}
                            chip={<TypeChip type="design" label={t("Design")} />}
                            caption={
                              req
                                ? `${req.process.map(processCode).join("+")} · ${req.materials.join(", ")}`
                                : undefined
                            }
                          />
                          <div className="flex flex-col gap-2 p-4 flex-1">
                            <h3 className="m-0 text-[18px] leading-[24px]" style={heading}>
                              {d.name}
                            </h3>
                            <p className="m-0 text-[13px] text-ifr-text-secondary">
                              {author ? t("by {{name}}", { name: author }) : null}
                              {req ? (
                                <span className="block mt-1 text-[12px]" style={mono}>
                                  {t("largest part")} {dims(req.max_dimensions_mm)}
                                </span>
                              ) : null}
                            </p>
                            <div className="mt-auto pt-2.5 border-t border-[#e3e4e6] flex items-end justify-between gap-2">
                              {from != null ? (
                                <span className="flex flex-col">
                                  <span className="text-[12px] text-ifr-text-secondary">{t("from")}</span>
                                  <span className="text-[22px] leading-[26px]" style={heading}>
                                    {eur(from)}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[13px] text-ifr-text-secondary">{t("No maker yet")}</span>
                              )}
                              {offers.length ? (
                                <span
                                  className="text-[13px] font-semibold text-ifr-green"
                                  data-testid="market-design-makers"
                                >
                                  {t("{{count}} makers", { count: offers.length })}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </a>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

MarketCatalogue.publicPage = true;

export default MarketCatalogue;
