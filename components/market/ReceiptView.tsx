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

// Presentational render of one local ValueFlows receipt (transfer | produce).
const ReceiptView = ({ receipt }: { receipt: Receipt }) => (
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
    {receipt.zenflows_event_id ? (
      <p className="mt-2 text-sm" data-testid="market-zenflows-event">
        <span className="px-1.5 py-0.5 mr-1 text-xs font-semibold rounded bg-emerald-600 text-white">LIVE</span>
        <span className="text-gray-500">Zenflows event: </span>
        <code className="break-all">{receipt.zenflows_event_id}</code>
      </p>
    ) : (
      <p className="mt-1 text-xs text-gray-400">
        Labeled local stand-in for a live Zenflows economic event (set INTERFACER_ZENFLOWS_URL to write live).
      </p>
    )}
  </div>
);

export default ReceiptView;
