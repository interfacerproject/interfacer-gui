// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// The marketplace, on the project pages people already use. A listed product
// gets a Buy block; a registered design gets Get it built; a service shows the
// designs it builds. Owners get the way in (put on sale, publish requirements,
// offer the service). Anything outside the marketplace renders nothing.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useMarketClient } from "hooks/useMarketClient";
import { marketplaceEnabled } from "lib/market/flag";
import type { BuildListing, Requirements, SceneProduct, StoreProduct } from "lib/market/types";
import { eur } from "lib/market/format";
import { ProjectType } from "components/types";
import BuyPanel from "./BuyPanel";
import GetItBuiltPanel from "./GetItBuiltPanel";
import { heading } from "./ui";

type State =
  | { kind: "none" }
  | { kind: "product"; listing: SceneProduct; product: StoreProduct }
  | { kind: "design"; requirements: Requirements }
  | { kind: "service"; listings: BuildListing[] };

function OwnerInvite({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <section
      className="px-4 py-4 border-b border-[#c9cccf] flex flex-col gap-2"
      style={{ background: "var(--ifr-yellow-bg)" }}
    >
      <p className="m-0 text-[15px]" style={heading}>
        {title}
      </p>
      <p className="m-0 text-[13px]" style={{ color: "#5c4400" }}>
        {body}
      </p>
      <Link href={href} passHref>
        <a
          className="self-start inline-flex items-center h-10 px-4 rounded-[6px] text-[14px] font-semibold no-underline"
          style={{ background: "var(--ifr-text-primary)", color: "var(--ifr-text-inverse)" }}
          data-testid="market-owner-invite"
        >
          {cta}
        </a>
      </Link>
    </section>
  );
}

export default function MarketProjectPanel({
  projectId,
  projectType,
  isOwner,
}: {
  projectId: string;
  projectType: ProjectType;
  isOwner?: boolean;
}) {
  const { t } = useTranslation("common");
  const client = useMarketClient();
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    if (!marketplaceEnabled || !projectId) return;
    let alive = true;
    (async () => {
      const done = (s: State) => alive && setState(s);
      if (projectType === ProjectType.PRODUCT) {
        const scene = await client.browse();
        const listing = scene.ok ? scene.data.products.find(p => p.resource_id === projectId) : undefined;
        if (!listing) return done({ kind: "none" });
        const products = await client.catalog();
        const product = products.ok ? products.data.find(p => p.id === listing.product_id) : undefined;
        return done(product ? { kind: "product", listing, product } : { kind: "none" });
      }
      if (projectType === ProjectType.DESIGN) {
        const designs = await client.listDesigns();
        const design = designs.ok ? designs.data.find(d => d.id === projectId) : undefined;
        const req = design?.requirements as Requirements | undefined;
        return done(req && Array.isArray(req.process) ? { kind: "design", requirements: req } : { kind: "none" });
      }
      if (projectType === ProjectType.SERVICE) {
        const listings = await client.buildListings({ service: projectId });
        return done(
          listings.ok && listings.data.length ? { kind: "service", listings: listings.data } : { kind: "none" }
        );
      }
      done({ kind: "none" });
    })();
    return () => {
      alive = false;
    };
  }, [client, projectId, projectType]);

  if (!marketplaceEnabled || !state) return null;

  if (state.kind === "product") return <BuyPanel listing={state.listing} product={state.product} />;
  if (state.kind === "design")
    return <GetItBuiltPanel client={client} designId={projectId} requirements={state.requirements} />;
  if (state.kind === "service")
    return (
      <section
        className="px-4 py-4 border-b border-[#c9cccf] flex flex-col gap-2.5"
        data-testid="market-service-builds"
      >
        <p className="m-0 uppercase text-[12px] font-semibold tracking-[0.08em] text-ifr-text-secondary">
          {t("Builds on demand")}
        </p>
        <ul className="m-0 p-0 list-none flex flex-col">
          {state.listings.map(l => (
            <li key={l.id} className="py-2 border-b border-[#e3e4e6] last:border-b-0">
              <Link href={`/project/${l.design_id}`} passHref>
                <a className="flex justify-between gap-3 text-ifr-text-primary no-underline hover:underline">
                  <span className="text-[14px] font-semibold truncate">{l.design_name}</span>
                  <span className="shrink-0 text-[13px] text-ifr-text-secondary">
                    {l.total_eur != null ? eur(l.total_eur) : ""}
                  </span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
        {isOwner ? (
          <Link href={{ pathname: "/market/start-selling", query: { service: projectId } }} passHref>
            <a className="text-[13px] font-semibold">{t("Edit the designs you build")}</a>
          </Link>
        ) : null}
      </section>
    );

  if (!isOwner) return null;
  if (projectType === ProjectType.PRODUCT)
    return (
      <OwnerInvite
        title={t("Sell this product")}
        body={t("Put one unit on sale: buyers pay you and ownership moves to them, recorded on Interfacer.")}
        href={`/market/start-selling?product=${projectId}`}
        cta={t("Put it on sale")}
      />
    );
  if (projectType === ProjectType.DESIGN)
    return (
      <OwnerInvite
        title={t("Let makers build this")}
        body={t("Publish what it takes to build it, so makers with the right machines can offer it.")}
        href={`/market/start-selling?design=${projectId}`}
        cta={t("Publish build requirements")}
      />
    );
  if (projectType === ProjectType.SERVICE)
    return (
      <OwnerInvite
        title={t("Offer this service on the marketplace")}
        body={t("Describe your machines and pick the designs you can build, with your price and lead time.")}
        href={`/market/start-selling?service=${projectId}`}
        cta={t("Start selling")}
      />
    );
  return null;
}
