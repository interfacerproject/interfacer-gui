// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React from "react";
import { MatchResult, Quote } from "../../lib/market/types";

const euro = (cents: number) => new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(cents / 100);

// Presentational render of a design's match result: the compatible services
// (each with its fixed-price quote and a purchase journey) and the rejected
// services with their concrete manufacturability reason. `renderJourney` wires
// the build purchase for a chosen quote (the page owns the client).
const MatchResults = ({
  result,
  renderJourney,
}: {
  result: MatchResult;
  renderJourney: (quote: Quote) => React.ReactNode;
}) => (
  <div className="mt-3" data-testid="market-match">
    {result.matches.length === 0 ? (
      <p className="text-sm">No compatible services. See the rejection reasons below.</p>
    ) : (
      <div className="space-y-3">
        {result.matches.map(({ service, quote }) => (
          <div key={quote.id} className="p-3 border rounded bg-gray-50" data-testid="market-match-service">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold">{service.name}</h4>
                <p className="text-sm">
                  <span className="text-gray-500">Provider: </span>
                  <code className="break-all">{quote.provider_person_id}</code>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Quote: </span>
                  <code className="break-all">{quote.id}</code>
                </p>
              </div>
              <p className="font-bold whitespace-nowrap">
                {euro(quote.total_price_cents)}
                <span className="block text-xs font-normal text-gray-400">lot of {quote.quantity} pieces</span>
              </p>
            </div>
            {renderJourney(quote)}
          </div>
        ))}
      </div>
    )}

    {result.rejected.length > 0 ? (
      <details className="mt-3">
        <summary className="text-sm cursor-pointer text-gray-600">
          Incompatible services &amp; reasons ({result.rejected.length})
        </summary>
        <ul className="mt-2 ml-4 text-sm list-disc">
          {result.rejected.map(r => (
            <li key={r.service.id}>
              <span className="font-medium">{r.service.name}</span>: {r.reason}
            </li>
          ))}
        </ul>
      </details>
    ) : null}
  </div>
);

export default MatchResults;
