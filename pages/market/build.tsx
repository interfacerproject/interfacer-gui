// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// LOCAL DEV marketplace — Build on demand (build journey). Pick a design, match
// compatible fabrication services (real structured capability check, seeded
// data), buy the build, mark it produced, and see the ValueFlows produce
// receipt. All writes are signed with a real Ed25519 envelope via /api/market.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React, { useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "../_app";
import type { MarketClient } from "../../lib/market/client";
import { useMarketClient } from "../../hooks/useMarketClient";
import { Design, MatchResult } from "../../lib/market/types";
import DevBanner from "../../components/market/DevBanner";
import MarketNav from "../../components/market/MarketNav";
import MatchResults from "../../components/market/MatchResults";
import MarketJourney from "../../components/market/MarketJourney";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const DesignRow = ({ client, design }: { client: MarketClient; design: Design }) => {
  const [result, setResult] = useState<MatchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const purchasable = Boolean(design.origin_dpp_id);

  const runMatch = async () => {
    setBusy(true);
    setError(null);
    const res = await client.match(design.id);
    setBusy(false);
    if (!res.ok) {
      setError(res.reason);
      return;
    }
    setResult(res.data);
  };

  return (
    <article className="p-4 border rounded-lg bg-white" data-testid="market-design">
      <h3 className="text-lg font-semibold">{design.name}</h3>
      <p className="text-sm">
        <span className="text-gray-500">Origin DPP: </span>
        <code className="break-all">{design.origin_dpp_id || "—"}</code>
      </p>
      <details className="mt-1">
        <summary className="text-sm cursor-pointer text-gray-600">Design requirements</summary>
        <pre className="p-2 mt-1 overflow-x-auto text-xs bg-gray-50 rounded">
          {JSON.stringify(design.requirements, null, 2)}
        </pre>
      </details>
      {!purchasable ? (
        <p className="mt-1 text-sm text-gray-500">
          Match only: this design has no origin DPP, so purchasing is disabled.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-600" data-testid="market-error">
          Could not match: {error}
        </p>
      ) : null}

      <button
        type="button"
        className="mt-2 btn btn-primary btn-sm"
        disabled={busy}
        onClick={runMatch}
        data-testid="market-match-btn"
      >
        {busy ? "Matching…" : "Match"}
      </button>

      {result ? (
        <MatchResults
          result={result}
          renderJourney={quote => (
            <MarketJourney
              client={client}
              kind="build"
              target={quote.id}
              purchasable={purchasable}
              unavailableReason="Origin DPP required — matching is available, but this build cannot be purchased."
            />
          )}
        />
      ) : null}
    </article>
  );
};

const MarketBuild: NextPageWithLayout = () => {
  const client = useMarketClient();
  const [designs, setDesigns] = useState<Design[] | null>(null);
  const [status, setStatus] = useState("Connecting and loading designs…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    setDesigns(null);
    setStatus("Connecting the buyer session…");
    (async () => {
      const c = await client.connect();
      if (!alive) return;
      if (!c.ok) {
        setError(c.reason);
        setStatus("");
        return;
      }
      const d = await client.listDesigns();
      if (!alive) return;
      if (!d.ok) {
        setError(d.reason);
        setStatus("");
        return;
      }
      setDesigns(d.data);
      setStatus("");
    })();
    return () => {
      alive = false;
    };
  }, [client]);

  return (
    <main className="max-w-4xl p-6 mx-auto">
      <MarketNav title="Build on demand" current="/market/build" />
      <DevBanner live={client.scene?.live} />
      {client.scene ? (
        <p className="mb-4 text-sm break-words" data-testid="market-buyer">
          Buyer: <code>{client.scene.buyer_person_id}</code>
          {client.scene.password ? " · disposable demo account" : " · verified Interfacer account"}
        </p>
      ) : null}

      {error ? (
        <div className="p-4 border-l-4 rounded bg-red-50 border-red-500 text-red-900" data-testid="market-page-error">
          {error === "market_upstream_unreachable" ? (
            <p>
              Marketplace server not reachable. Start it with <code>npm run dev:up</code> in interfacer-medusa, then
              reload.
            </p>
          ) : (
            <p>Could not load designs: {error}</p>
          )}
        </div>
      ) : status ? (
        <p className="text-gray-500">{status}</p>
      ) : (
        <div className="space-y-4" data-testid="market-designs">
          {designs && designs.length === 0 ? (
            <p>
              {client.scene?.live
                ? "No registered designs yet. Owners register a design's requirements from the Offer page."
                : "No designs seeded. Restart the local demo."}
            </p>
          ) : null}
          {designs?.map(design => (
            <DesignRow key={design.id} client={client} design={design} />
          ))}
        </div>
      )}
    </main>
  );
};

(MarketBuild as any).publicPage = true;
MarketBuild.getLayout = page => page;

export default MarketBuild;
