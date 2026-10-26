// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// LOCAL DEV marketplace — Offer (live mode). The signed-in person offers THEIR
// OWN Zenflows resources: register a Design's structured requirements or a
// Service's capabilities and fixed prices (versioned, strictly validated by
// Medusa), or list one unit of a Product for sale. Every action is signed with
// the person's wallet; Medusa re-reads the resource and checks they own it.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React, { useCallback, useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "../_app";
import { useAuth } from "../../hooks/useAuth";
import { useMarketClient } from "../../hooks/useMarketClient";
import { useResourceSpecs } from "../../hooks/useResourceSpecs";
import type { MarketClient } from "../../lib/market/client";
import { CatalogKind, OwnedResource, SellerDashboard } from "../../lib/market/types";
import DevBanner from "../../components/market/DevBanner";
import MarketNav from "../../components/market/MarketNav";

export async function getStaticProps({ locale }: { locale: string }) {
  return { props: { publicPage: true, ...(await serverSideTranslations(locale, ["common"])) } };
}

const OWNED = `query($me: [ID!], $specs: [ID!]) {
  economicResources(first: 100, filter: { primaryAccountable: $me, conformsTo: $specs }) {
    edges { node { id name conformsTo { id name } onhandQuantity { hasNumericalValue } } }
  }
}`;

const list = (v: string) =>
  v
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

const Field = ({
  label,
  value,
  onChange,
  testid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testid: string;
}) => (
  <label className="flex flex-col text-xs text-gray-600">
    {label}
    <input
      className="input input-bordered input-sm"
      value={value}
      onChange={e => onChange(e.target.value)}
      data-testid={testid}
    />
  </label>
);

type FormState = Record<string, string>;
const DESIGN_DEFAULTS: FormState = {
  process: "fdm_3d_print",
  materials: "PETG",
  x: "120",
  y: "80",
  z: "60",
  tolerance: "0.3",
  quantity: "2",
};
const SERVICE_DEFAULTS: FormState = {
  processes: "fdm_3d_print",
  materials: "PETG, PLA",
  x: "220",
  y: "220",
  z: "250",
  tolerance: "0.2",
  base: "10",
  unit: "4.5",
  country: "it",
  city: "Torino",
};

// Builds the exact versioned document Medusa validates; nothing is inferred.
function documentFor(kind: CatalogKind, f: FormState) {
  if (kind === "design")
    return {
      schema_version: "interfacer-build-requirements-v1" as const,
      requirements: {
        process: list(f.process),
        materials: list(f.materials),
        max_dimensions_mm: { x: Number(f.x), y: Number(f.y), z: Number(f.z) },
        tolerance_mm: Number(f.tolerance),
        quantity: Number(f.quantity),
      },
    };
  return {
    schema_version: "interfacer-fabrication-capabilities-v1" as const,
    capabilities: {
      processes: list(f.processes),
      materials: list(f.materials),
      build_volume_mm: { x: Number(f.x), y: Number(f.y), z: Number(f.z) },
      min_tolerance_mm: Number(f.tolerance),
    },
    base_price_eur: Number(f.base),
    per_unit_price_eur: Number(f.unit),
    location: { country_code: f.country.trim(), city: f.city.trim() },
  };
}

const OfferCard = ({
  market,
  resource,
  kind,
  dash,
  onDone,
}: {
  market: MarketClient;
  resource: OwnedResource;
  kind: CatalogKind | "product";
  dash: SellerDashboard | null;
  onDone: () => void;
}) => {
  const [form, setForm] = useState<FormState>(
    kind === "design" ? DESIGN_DEFAULTS : kind === "service" ? SERVICE_DEFAULTS : { price: "24.50" }
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const entries = dash?.catalog.filter(e => e.zenflows_resource_id === resource.id) ?? [];
  const listed = dash?.listings.some(l => l.catalog_resource_id === resource.id);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    const res =
      kind === "product"
        ? await market.listProduct(resource.id, Number(form.price))
        : await market.registerCatalog(kind, resource.id, documentFor(kind, form));
    setBusy(false);
    setMessage(res.ok ? (kind === "product" ? "Listed for sale." : "Registered.") : `Refused: ${res.reason}`);
    if (res.ok) onDone();
  };

  const fields: [string, string][] =
    kind === "design"
      ? [
          ["process", "Processes (comma separated)"],
          ["materials", "Materials"],
          ["x", "Max X mm"],
          ["y", "Max Y mm"],
          ["z", "Max Z mm"],
          ["tolerance", "Tolerance mm"],
          ["quantity", "Pieces per build"],
        ]
      : kind === "service"
      ? [
          ["processes", "Processes (comma separated)"],
          ["materials", "Materials"],
          ["x", "Build X mm"],
          ["y", "Build Y mm"],
          ["z", "Build Z mm"],
          ["tolerance", "Min tolerance mm"],
          ["base", "Base price EUR"],
          ["unit", "Per piece EUR"],
          ["country", "Country code"],
          ["city", "City"],
        ]
      : [["price", "Price EUR (one unit)"]];

  return (
    <article
      className="p-4 bg-white border rounded-lg"
      data-testid={`market-offer-${kind}`}
      data-resource={resource.id}
    >
      <h3 className="font-semibold">{resource.name}</h3>
      <p className="text-xs text-gray-500">
        {resource.conformsTo.name} · <code className="break-all">{resource.id}</code>
        {kind === "product" ? ` · on hand ${resource.onhandQuantity?.hasNumericalValue ?? "?"}` : ""}
      </p>
      {entries.length ? (
        <p className="mt-1 text-sm text-emerald-800" data-testid="market-offer-registered">
          Registered revision {Math.max(...entries.map(e => e.revision))}; a changed document creates a new revision.
        </p>
      ) : null}
      {listed ? (
        <p className="mt-1 text-sm text-emerald-800" data-testid="market-offer-listed">
          Listed. Buyers see it in the catalog.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-4">
        {fields.map(([k, label]) => (
          <Field key={k} label={label} value={form[k]} onChange={set(k)} testid={`market-offer-field-${k}`} />
        ))}
      </div>
      <button
        type="button"
        className="mt-2 btn btn-primary btn-sm"
        disabled={busy || (kind === "product" && listed)}
        onClick={submit}
        data-testid="market-offer-submit"
      >
        {busy ? "Signing…" : kind === "product" ? "List one unit for sale" : "Register (sign with my wallet)"}
      </button>
      {message ? (
        <p className="mt-1 text-sm" role="status" data-testid="market-offer-message">
          {message}
        </p>
      ) : null}
    </article>
  );
};

const MarketOffer: NextPageWithLayout = () => {
  const { user, client: sdk } = useAuth();
  const market = useMarketClient();
  const specs = useResourceSpecs();
  const [owned, setOwned] = useState<OwnedResource[] | null>(null);
  const [dash, setDash] = useState<SellerDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const d = await market.sellerDashboard();
    if (d.ok) setDash(d.data);
  }, [market]);

  useEffect(() => {
    if (!user || !sdk || specs.loading) return;
    let alive = true;
    (async () => {
      const c = await market.connect();
      if (!alive) return;
      if (!c.ok) return setError(c.reason);
      if (!c.data.live) return setError("live_mode_required");
      await refresh();
      try {
        const res = await sdk.graphql.request<any>(OWNED, {
          me: [user.id],
          specs: [specs.specProjectDesign.id, specs.specProjectService.id, specs.specProjectProduct.id],
        });
        if (res.errors?.length || !res.data) throw new Error("zenflows_error");
        if (alive) setOwned(res.data.economicResources.edges.map((e: { node: OwnedResource }) => e.node));
      } catch {
        if (alive) setError("zenflows_unreachable");
      }
    })();
    return () => {
      alive = false;
    };
  }, [
    user,
    sdk,
    market,
    specs.loading,
    specs.specProjectDesign.id,
    specs.specProjectService.id,
    specs.specProjectProduct.id,
    refresh,
  ]);

  const kindOf = (r: OwnedResource): CatalogKind | "product" | null =>
    r.conformsTo.id === specs.specProjectDesign.id
      ? "design"
      : r.conformsTo.id === specs.specProjectService.id
      ? "service"
      : r.conformsTo.id === specs.specProjectProduct.id
      ? "product"
      : null;

  return (
    <main className="max-w-4xl p-6 mx-auto">
      <MarketNav title="Offer" current="/market/offer" />
      <DevBanner live />
      {!user ? (
        <p data-testid="market-login-required">
          Sign in to Interfacer to offer your own designs, services and products.
        </p>
      ) : error ? (
        <p role="alert" className="text-red-700" data-testid="market-page-error">
          Could not load your resources: {error}
        </p>
      ) : !owned ? (
        <p className="text-gray-500">Loading your Zenflows resources…</p>
      ) : (
        <div className="space-y-4" data-testid="market-offer">
          <p className="text-sm text-gray-600">
            Only resources you are accountable for appear here. A design needs structured requirements and a service
            explicit capabilities and prices: matching never guesses from tags.
          </p>
          {owned.length === 0 ? <p>You have no Design, Service or Product resources yet.</p> : null}
          {owned.map(r => {
            const kind = kindOf(r);
            return kind ? (
              <OfferCard key={r.id} market={market} resource={r} kind={kind} dash={dash} onDone={refresh} />
            ) : null;
          })}
        </div>
      )}
    </main>
  );
};

(MarketOffer as any).publicPage = true;
MarketOffer.getLayout = page => page;

export default MarketOffer;
