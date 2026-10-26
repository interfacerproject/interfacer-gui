// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

/* eslint-disable i18next/no-literal-string -- LOCAL DEV marketplace page, intentionally not translated */
import React from "react";
import { Receipt } from "../../lib/market/types";

const Row = ({ label, value }: { label: string; value?: string | number | null }) => (
  <p className="text-sm">
    <span className="text-gray-500">{label}: </span>
    <code className="break-all">{value === undefined || value === null || value === "" ? "—" : value}</code>
  </p>
);

const Badge = ({ tone, children }: { tone: string; children: React.ReactNode }) => (
  <span className={`px-1.5 py-0.5 mr-1 text-xs font-semibold rounded text-white ${tone}`}>{children}</span>
);

// The live Zenflows side of a receipt: LIVE, SYNC PENDING (durable, retried),
// SYNC BLOCKED (needs an operator; never auto-replayed) or LOCAL ONLY.
const ZenflowsStatus = ({
  receipt,
  onRetry,
  retrying,
}: {
  receipt: Receipt;
  onRetry?: () => void;
  retrying?: boolean;
}) => {
  const sync = receipt.zenflows_sync;
  if (receipt.zenflows_event_id)
    return (
      <p className="mt-2 text-sm" data-testid="market-zenflows-event">
        <Badge tone="bg-emerald-600">LIVE</Badge>
        <span className="text-emerald-900">Zenflows handover event: </span>
        <code className="break-all">{receipt.zenflows_event_id}</code>
      </p>
    );
  if (sync?.status === "pending")
    return (
      <div className="mt-2 text-sm" data-testid="market-zenflows-pending">
        <p>
          <Badge tone="bg-amber-600">SYNC PENDING</Badge>
          <span className="text-amber-900">
            Saved locally; the Zenflows write is retried and reconciled, never duplicated.
          </span>
        </p>
        <p className="text-xs text-gray-600">
          Attempts: {sync.attempts}
          {sync.inflight_step ? ` · checking step “${sync.inflight_step}”` : ""}
          {sync.last_error ? ` · last error: ${sync.last_error}` : ""}
        </p>
        {onRetry ? (
          <button
            type="button"
            className="mt-1 btn btn-outline btn-xs"
            disabled={retrying}
            onClick={onRetry}
            data-testid="market-zenflows-retry"
          >
            {retrying ? "Retrying…" : "Retry now"}
          </button>
        ) : null}
      </div>
    );
  if (sync?.status === "blocked")
    return (
      <p className="mt-2 text-sm" data-testid="market-zenflows-blocked">
        <Badge tone="bg-red-600">SYNC BLOCKED</Badge>
        <span className="text-red-900">Needs operator reconciliation: </span>
        <code className="break-all">{sync.last_error}</code>
      </p>
    );
  return (
    <p className="mt-1 text-xs text-gray-400" data-testid="market-zenflows-local">
      LOCAL ONLY — labeled stand-in for a live Zenflows economic event (set INTERFACER_ZENFLOWS_URL to write live).
    </p>
  );
};

// Presentational render of one local ValueFlows receipt (transfer | produce).
const ReceiptView = ({
  receipt,
  onRetry,
  retrying,
}: {
  receipt: Receipt;
  onRetry?: () => void;
  retrying?: boolean;
}) => (
  <div
    className="p-4 mt-3 border rounded bg-emerald-50 border-emerald-300"
    data-testid="market-receipt"
    data-action={receipt.action}
  >
    <h4 className="font-bold text-emerald-900">VF receipt · {receipt.action}</h4>
    <Row label="Receipt" value={receipt.id} />
    <Row label="Provider → receiver" value={`${receipt.provider_id} → ${receipt.receiver_id}`} />
    <Row label="Resource" value={receipt.resource_id} />
    <Row label="DPP reference" value={receipt.dpp_id} />
    {receipt.service_id ? <Row label="Service" value={receipt.service_id} /> : null}
    <Row
      label="Quantity"
      value={`${receipt.quantity}${
        receipt.has_point_in_time ? " · " + new Date(receipt.has_point_in_time).toLocaleString() : ""
      }`}
    />
    <ZenflowsStatus receipt={receipt} onRetry={onRetry} retrying={retrying} />
  </div>
);

export default ReceiptView;
