# Marketplace GUI integration — STATUS

**Branch:** `feat/medusa-marketplace-gui` · **Date:** 2026-10-22
**Spec:** `docs/superpowers/specs/2026-10-22-marketplace-gui-integration-design.md`
**Plan/ledger:** `docs/superpowers/plans/2026-10-22-marketplace-gui-integration.md`

Bridge **A** of "integra tutto": both Interfacer × Medusa marketplace journeys now
run inside the real interfacer-gui, authorized by a **real Ed25519 signed
envelope**. Bridges **B/C/D** (real match data, live Zenflows receipts, real
identity) are the next slice and need a locally-run Zenflows.

## What is real

- **Native GUI pages** at `/market` (catalog, stock journey) and `/market/build`
  (build journey), built with the GUI's own styling + i18n, plus a sidebar entry.
- **Real signing.** Every commerce write (checkout, build purchase, deliver,
  produce) is signed by the Medusa dev signer with a real Ed25519 envelope. The
  **private key never reaches the browser**: a server-side proxy
  (`pages/api/market/[...path].ts`) forwards an allowlisted set of Medusa paths
  over loopback; the GUI holds no key and cannot forge an envelope.
- **No SSRF / no secret leak.** The proxy forwards only to the single configured
  upstream (`MEDUSA_INTERNAL_URL`) and only to allowlisted prefixes
  (`dev/store/{config,sign,capture}`, `dev/interfacer/*`, `store/*`,
  `auth/customer/emailpass`); traversal/foreign paths are refused. The Medusa
  publishable key is client-safe by design; no private secret crosses the browser.
- **Real commerce + real match algorithm.** Medusa carts/payments/orders, and the
  design→service match (structured capability check: process, materials, build
  volume, tolerance) with priced immutable quotes and reasoned rejections.

## What is still a labeled local stand-in (bridges B/C/D)

- **Seeded data** — the catalog products and the designs/services the match runs
  over are Medusa seeds, not real Interfacer resources or registered providers
  (bridge **B**).
- **Receipts** — the ValueFlows receipts are written to the local `rea-receipts`
  sink, not a live Zenflows economic event (bridge **C**).
- **Identity** — key→Person resolution is the local stand-in, not the Zenflows
  registry (bridge **D**).

Each page shows a loud banner stating this. Known gap (inherited): no
nonce-replay prevention yet.

## Run it

```bash
# 1) marketplace backend
cd interfacer-medusa && npm run dev:up            # Medusa + storefront on :9000

# 2) the GUI (this branch)
cd interfacer-gui-medusa
pnpm exec next dev -p 3002                         # GUI on :3002
# open http://localhost:3002/market
```

The GUI proxy targets `MEDUSA_INTERNAL_URL` (default `http://localhost:9000`).

## Click paths

**Stock:** `/market` → a product with an enabled **Buy** (an available unit) →
**Buy** (order placed, test payment captured; no VF event on payment) → **Mark
delivered** → the **VF receipt · transfer** appears.

**Build:** `/market/build` → a design with an origin DPP → **Match** (compatible
services with priced quotes + rejected ones with reasons) → **Buy build** → **Mark
produced** → the **VF receipt · produce** appears.

## Tests

- Unit (`node --test`, 13/13): `tests/unit/market-client.test.ts`,
  `tests/unit/market-proxy.test.ts` — proxy allowlist/traversal refusal, header
  byte-passthrough, status/reason relay, 502 on unreachable, sign-then-write,
  reason propagation.
- E2e (`tests/market.spec.ts`, gated by `MARKET_E2E=1`): drives both journeys
  against the running GUI + Medusa. The stock test buys whatever unit is still
  available and **skips** when the demo run is sold out (one-unit resources, not
  replenished) — reseed with a fresh `dev:up`. The build journey is repeatable.

  ```bash
  MARKET_E2E=1 TEST_BASE_URL=http://localhost:3002 \
    pnpm exec playwright test tests/market.spec.ts --project=chromium
  ```

Verified live in a browser during development: stock Buy→deliver→transfer receipt,
and build Match→buy→produce→produce receipt, both with real signed envelopes.
