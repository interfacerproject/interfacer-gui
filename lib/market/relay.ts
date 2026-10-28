// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Seller-signed Zenflows relay (enforced authz). Medusa builds the exact GraphQL
// body of each outbox write step. Before the seller's wallet signs one, this
// check confirms it is one of the marketplace's own mutation shapes, that it
// names the signer as provider, and, for a handover, the order's buyer as
// receiver. An unknown or altered body is refused, never signed. The query
// strings are pinned on purpose: if Medusa changes them, signing fails closed.

export type RelayStep = "process" | "create" | "transfer";

// Exactly as Medusa sends them (zenflowsBody collapses each query to one line).
export const RELAY_QUERIES = {
  process: "mutation($p: ProcessCreateParams!) { createProcess(process: $p) { process { id } } }",
  create:
    "mutation($e: EconomicEventCreateParams!, $r: EconomicResourceCreateParams!) { createEconomicEvent(event: $e, newInventoriedResource: $r) { economicEvent { id resourceInventoriedAs { id } } } }",
  transfer: "mutation($e: EconomicEventCreateParams!) { createEconomicEvent(event: $e) { economicEvent { id } } }",
  transferMarked:
    "mutation($e: EconomicEventCreateParams!, $r: EconomicResourceCreateParams!) { createEconomicEvent(event: $e, newInventoriedResource: $r) { economicEvent { id } } }",
};

const keys = (o: unknown) => (o && typeof o === "object" && !Array.isArray(o) ? Object.keys(o).sort().join(",") : "");

// Throws `relay_body_refused: <why>` unless `body` is safe for `me` to sign.
export function checkRelayBody(step: RelayStep, body: string, me: string, buyer: string): void {
  const refuse = (why: string): never => {
    throw new Error("relay_body_refused: " + why);
  };
  let parsed: { query?: unknown; variables?: Record<string, any> };
  try {
    parsed = JSON.parse(body);
  } catch {
    return refuse("not json");
  }
  if (keys(parsed) !== "query,variables") refuse("shape");
  const v = parsed.variables!;
  if (step === "process") {
    if (parsed.query !== RELAY_QUERIES.process || keys(v) !== "p") refuse("process shape");
    if (v.p?.finished !== true) refuse("process must be finished");
    return;
  }
  const e = v.e;
  if (!e || e.provider !== me) refuse("provider is not me");
  if (step === "create") {
    if (parsed.query !== RELAY_QUERIES.create || keys(v) !== "e,r") refuse("create shape");
    if (!["raise", "produce"].includes(e.action) || e.receiver !== me) refuse("create must stay with me");
    return;
  }
  const marked = parsed.query === RELAY_QUERIES.transferMarked;
  if (!(marked || parsed.query === RELAY_QUERIES.transfer) || keys(v) !== (marked ? "e,r" : "e"))
    refuse("transfer shape");
  if (marked && keys(v.r) !== "note") refuse("transfer destination");
  if (e.action !== "transfer" || e.receiver !== buyer) refuse("transfer must go to the buyer");
}
