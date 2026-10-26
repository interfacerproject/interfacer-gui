# Marketplace GUI integration — STATUS

**Branch:** `feat/medusa-marketplace-gui` · **Updated:** 2026-10-26
Backend: `interfacer-medusa`, `feat/zenflows-real-events` (PR #1); GUI draft PR #922.
No main/Zenflows/SDK changes. Implementation pins: backend `8018cb4`, GUI `f76a53e`.
Maintained bilingual review snapshot: backend `docs/review/README.md` and
http://127.0.0.1:3110/it/medusa.html (also `/en/medusa.html`).

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

1. A design owner and a maker sign in and open **Offer**. They register their
   Design and Service. A seller lists a Product.
2. A buyer opens **Catalog** (stock) or **Build on demand** (Match, Buy build), and
   pays.
3. The seller or maker opens **My sales** and signs Mark delivered / produced (and,
   with enforced Zenflows, each write).
4. The buyer's receipt turns LIVE.

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

Task tracking: Beads `interfacer-gui-nhn`, `-h0n`, `-dz7` (done), `-zzi`, `-4j3`.
