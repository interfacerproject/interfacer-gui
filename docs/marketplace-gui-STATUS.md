# Marketplace GUI integration — STATUS

**Branch:** `feat/marketplace-ux` (stacked on `feat/medusa-marketplace-gui`, #922) · **Updated:** 2026-11-09
Backend: `interfacer-medusa`, `feat/build-listings` (stacked on `feat/zenflows-real-events`, PR #1).
No main/Zenflows/SDK changes. Not pushed yet.
Earlier pins (2026-10-27): backend `8018cb4`, GUI `f76a53e`; PR #1 and #922 descriptions,
label `workstream:authz-integration`, Zenflows issue #74 table, checkpoint comments on
#921, #84, SDK #7 and #74. Bilingual review snapshot: backend `docs/review/README.md`.

## 2026-11-09 — the marketplace inside the app (Beads `interfacer-gui-5q3`)

Design: Claude Design canvas https://claude.ai/artifact/5cdcPtwAUCZAbFsDGsHPFn.
Plan: `docs/superpowers/plans/2026-11-09-marketplace-ux.md`. Behind
`NEXT_PUBLIC_FF_MARKETPLACE=true` (local `.env`) and the local-only `/api/market` proxy.

- `/market`: one catalogue, **Ready-made** (units on sale) and **Built on demand**
  (registered designs with the makers who listed them). Public browsing.
- Project pages: **Buy** block on listed products, **Get it built** on registered
  designs (listed makers, fit chips, price for the lot, lead time, makers that no
  longer fit), designs a service builds; owners get an invitation to sell.
- `/market/checkout` (address, pilot test payment, signed order),
  `/market/orders` and `/market/orders/[id]` (progress, signed traceability log
  with Interfacer ids), `/market/selling` (next signed step per order, earnings,
  build listings, units on sale), `/market/start-selling` (service machines →
  designs you build; products; designs' build requirements).
- Profile **Shop** tab; Marketplace, My orders, Selling in topbar and menu.
- Backend: **build listings** — a service owner signs `catalog.build.list` (setup
  fee, per-piece price, lead time, active/paused) per registered design; live
  matching quotes only listed services, at the listed price, rechecking the fit.
- Deferred by the user: build request → maker accepts/refuses/counter-offers
  (`interfacer-gui-pvo`). Not modelled yet: buyer-chosen quantity (the design's
  lot), delivery options/prices (the maker arranges pickup or delivery).
- Old routes redirect (`/market/build`, `/market/sales`, `/market/offer`). The
  standalone-fixture UI e2e are skipped as superseded (`interfacer-gui-337`).

Validation: `pnpm test:market` 37/37; tsc and ESLint (i18n rule on) clean;
`tests/market-sellers.spec.ts` live against enforced Zenflows: **passed** (Start
selling with a signed build listing, product-page buy, design-page build order,
checkout, Selling milestones and earnings, buyer order page with Interfacer ids,
Zenflows provider/receiver/Process checks, 390 px without sideways scroll).
Backend unit tests 56/56.

## Implemented and verified

**Live mode** = Medusa started with a Zenflows URL. In live mode there is no demo
login and no dev signer: every person signs with their own Interfacer wallet.
Standalone Medusa keeps the original fixture demo (`tests/market.spec.ts`,
`tests/market-identity.spec.ts` skip themselves in live mode).

- **Buyers** (`/market`, `/market/build`):
  - Session: a one-use challenge signed by the browser wallet and verified against
    the key registered in Zenflows.
  - Checkout, build acceptance and capture are wallet-signed.
  - After paying, the buyer waits for the seller's signed milestone ("Check
    status").
- **Owners and sellers**
  - `/market/offer` lists only the person's OWN Zenflows Design, Service and
    Product resources (SDK query). From there they can:
    - register a design's structured requirements;
    - register a service's capabilities, fixed prices and location (versioned
      documents);
    - list one unit of a product.
    All signed with the wallet.
  - `/market/sales` is the seller console: orders on my listings and services,
    "Mark delivered / produced" signed with my wallet, and receipts with their
    Zenflows sync state.
- **Wallet roles:**
  - The market wallet signs buyer and seller operations only as itself.
  - The client pins the one operation each clicked action may sign, so a server
    response cannot swap it.
- **Receipts**:
  - **LIVE**: the handover id of the completed durable sync.
  - **SYNC PENDING**: saved, still being written or awaiting my signature. Has
    Retry.
  - **SYNC BLOCKED**: needs an operator.
  - **LOCAL ONLY**: no remote write claimed.
- **Enforced Zenflows authorization** (`GQL_AUTH_CALLS` + `AUTHZ_ENFORCE`):
  - The sales console fetches Medusa's exact body for each pending write.
  - `lib/market/relay.ts` checks it: pinned mutation shape, provider = me, a
    handover's receiver = the order's buyer.
  - The console signs it with the SDK's `signGraphQLRequest` and posts the
    signature.
  - Medusa verifies it against my registered key and relays it once.
- The server-side proxy stays loopback-only and allowlisted. It forwards signed
  proofs, never a private key, trusted user header or client-chosen target.

## Deliberate local boundaries

Payments are manual/test. Catalog documents are owner assertions validated for
shape, not physical capability proof. Owners must be Persons; organisation owners
are follow-up `interfacer-gui-4j3`. The outbox marker currently shows as the project
description of marketplace-created resources in GUI lists (`interfacer-gui-zzi`).
General commerce nonce replay/revocation remains inherited. Do not expose these
dev endpoints publicly. Protocol, environment and limits:
backend `docs/zenflows-bridge.md`.

## Run and click

```bash
# Zenflows PR #84 at :8000 (optionally GQL_AUTH_CALLS=true AUTHZ_ENFORCE=true AUTHZ_ALLOW_UNCHECKED=false)
cd interfacer-medusa && INTERFACER_ZENFLOWS_URL=http://127.0.0.1:8000/api npm run dev:up
# enforced Zenflows also needs INTERFACER_ZENFLOWS_SIGNED_WRITES=true and the
# Medusa service Person (INTERFACER_ZENFLOWS_SERVICE_USER / _SEED), see TESTING.md P9.
cd interfacer-gui-medusa && pnpm exec next dev -p 3002
```

1. Owners open **Start selling**: a designer publishes a design's build
   requirements; a maker describes the service's machines, then ticks the designs
   it can build with a price and lead time; a seller puts a unit on sale.
2. A buyer opens **Marketplace**, then a product page (**Buy now**) or a design
   page (**Get it built** → pick a maker), and places the order at checkout.
3. The seller or maker opens **Selling** and marks it delivered / built and handed
   over (and, with enforced Zenflows, signs the Interfacer record).
4. The buyer's order page shows the handover with its Interfacer ids.

## Validation (2026-10-26)

- `npm run test:market`: **28/28** (proxy, client incl. pinned actions and live
  mode, wallet roles, relay checks, Zenroom/Node/WebCrypto signing).
- `npm run check-types` and targeted ESLint: clean.
- `tests/market-sellers.spec.ts` (Chromium, live Medusa, fresh registered People):
  - registration and listing via the GUI;
  - buyer stock + build;
  - each seller signs their own milestone;
  - Zenflows confirms provider/receiver, the finished Process and the buyer-owned
    destination;
  - proof replay, the dev signer and a foreign-order prepare are refused;
  - no overflow at 390 px.
  It passes with Zenflows enforcement off and **on**. Ordinary GUI pages (home,
  projects, profile) load without Zenflows errors under enforcement.
- Backend: 50 unit tests, live fault proxy 8/8 + restart (both modes), real-actor
  probe, `test:all` 9/9 — see backend `TESTING.md` P7–P9.

```bash
npm run test:market
npm run check-types
MARKET_LIVE_E2E=1 TEST_BASE_URL=http://localhost:3002 \
  [MARKET_TEST_ZENFLOWS_ADMIN=<admin, enforced Zenflows only>] \
  ./node_modules/.bin/playwright test tests/market-sellers.spec.ts --project=chromium --workers=1
```

Task tracking: Beads `interfacer-gui-nhn`, `-h0n`, `-dz7` (done), publication
`-in3`, open follow-ups `-zzi`, `-4j3`; export in `.beads/issues.jsonl`.
